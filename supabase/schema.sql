-- ============================================
-- CashFlow Web App — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Clean up if re-running
DROP FUNCTION IF EXISTS update_wallet_balance() CASCADE;
DROP FUNCTION IF EXISTS update_debt_on_payment() CASCADE;

DROP TABLE IF EXISTS debt_payments CASCADE;
DROP TABLE IF EXISTS debts CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;

DROP TYPE IF EXISTS wallet_type;
DROP TYPE IF EXISTS transaction_type;
DROP TYPE IF EXISTS debt_type;
DROP TYPE IF EXISTS debt_status;

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE wallet_type AS ENUM ('bank', 'ewallet', 'cash', 'other');
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE debt_type AS ENUM ('hutang', 'piutang');
CREATE TYPE debt_status AS ENUM ('belum_lunas', 'sebagian', 'lunas');

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type wallet_type NOT NULL,
  balance BIGINT NOT NULL DEFAULT 0,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type transaction_type NOT NULL,
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  budget_type TEXT NOT NULL DEFAULT 'expense' CHECK (budget_type IN ('expense', 'transfer')),
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  target_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  limit_amount BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, month, year)
);

CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type transaction_type NOT NULL,
  amount BIGINT NOT NULL,
  admin_fee BIGINT NOT NULL DEFAULT 0,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  destination_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type debt_type NOT NULL,
  person_name TEXT NOT NULL,
  total_amount BIGINT NOT NULL,
  remaining_amount BIGINT NOT NULL,
  description TEXT,
  status debt_status DEFAULT 'belum_lunas',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE debt_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  note TEXT,
  paid_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_budget ON transactions(budget_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_budgets_period ON budgets(year, month);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_type ON debts(type);
CREATE INDEX idx_debt_payments_debt ON debt_payments(debt_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update wallet balance on transaction changes
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'income' THEN
      UPDATE wallets SET balance = balance + NEW.amount, updated_at = now() WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE wallets SET balance = balance - NEW.amount, updated_at = now() WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE wallets SET balance = balance - (NEW.amount + NEW.admin_fee), updated_at = now() WHERE id = NEW.wallet_id;
      IF NEW.destination_wallet_id IS NOT NULL THEN
        UPDATE wallets SET balance = balance + NEW.amount, updated_at = now() WHERE id = NEW.destination_wallet_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'income' THEN
      UPDATE wallets SET balance = balance - OLD.amount, updated_at = now() WHERE id = OLD.wallet_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE wallets SET balance = balance + OLD.amount, updated_at = now() WHERE id = OLD.wallet_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE wallets SET balance = balance + (OLD.amount + OLD.admin_fee), updated_at = now() WHERE id = OLD.wallet_id;
      IF OLD.destination_wallet_id IS NOT NULL THEN
        UPDATE wallets SET balance = balance - OLD.amount, updated_at = now() WHERE id = OLD.destination_wallet_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Reverse old
    IF OLD.type = 'income' THEN
      UPDATE wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE wallets SET balance = balance + (OLD.amount + OLD.admin_fee) WHERE id = OLD.wallet_id;
      IF OLD.destination_wallet_id IS NOT NULL THEN
        UPDATE wallets SET balance = balance - OLD.amount WHERE id = OLD.destination_wallet_id;
      END IF;
    END IF;
    -- Apply new
    IF NEW.type = 'income' THEN
      UPDATE wallets SET balance = balance + NEW.amount, updated_at = now() WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE wallets SET balance = balance - NEW.amount, updated_at = now() WHERE id = NEW.wallet_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE wallets SET balance = balance - (NEW.amount + NEW.admin_fee), updated_at = now() WHERE id = NEW.wallet_id;
      IF NEW.destination_wallet_id IS NOT NULL THEN
        UPDATE wallets SET balance = balance + NEW.amount, updated_at = now() WHERE id = NEW.destination_wallet_id;
      END IF;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wallet_balance
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

-- Auto-update debt remaining & status on payment changes
CREATE OR REPLACE FUNCTION update_debt_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  total_paid BIGINT;
  debt_total BIGINT;
  target_debt_id UUID;
BEGIN
  target_debt_id := COALESCE(NEW.debt_id, OLD.debt_id);

  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM debt_payments WHERE debt_id = target_debt_id;

  SELECT total_amount INTO debt_total
  FROM debts WHERE id = target_debt_id;

  UPDATE debts SET
    remaining_amount = debt_total - total_paid,
    status = CASE
      WHEN total_paid >= debt_total THEN 'lunas'
      WHEN total_paid > 0 THEN 'sebagian'
      ELSE 'belum_lunas'
    END,
    updated_at = now()
  WHERE id = target_debt_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_debt_payment
AFTER INSERT OR UPDATE OR DELETE ON debt_payments
FOR EACH ROW EXECUTE FUNCTION update_debt_on_payment();

-- ============================================
-- SEED DATA: Default Categories
-- ============================================
INSERT INTO categories (name, slug, type, icon, color, is_default) VALUES
  ('Kost', 'kost', 'expense', '🏠', '#FF9F40', true),
  ('Kebutuhan', 'kebutuhan', 'expense', '🛒', '#36A2EB', true),
  ('Harian', 'harian', 'expense', '☕', '#FFCD56', true),
  ('Ortu', 'ortu', 'expense', '👨‍👩‍👧', '#4BC0C0', true),
  ('Zakat', 'zakat', 'expense', '🕌', '#9966FF', true),
  ('Transport', 'transport', 'expense', '🚗', '#FF6384', true),
  ('Hiburan', 'hiburan', 'expense', '🎮', '#FF9FF3', true),
  ('Makan Luar', 'makan', 'expense', '🍔', '#FECA57', true),
  ('Subscriptions', 'subscriptions', 'expense', '📱', '#54A0FF', true),
  ('Lainnya', 'lainnya', 'expense', '📦', '#C9CBCF', true),
  ('Gaji', 'gaji', 'income', '💼', '#00FF87', true),
  ('Freelance', 'freelance', 'income', '💻', '#00F5D4', true),
  ('Investasi', 'investasi', 'income', '📈', '#FFD93D', true),
  ('Lainnya', 'lainnya_income', 'income', '📦', '#C9CBCF', true);
