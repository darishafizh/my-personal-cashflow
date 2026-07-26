// ============================================
// TypeScript types matching Supabase schema
// ============================================

export type WalletType = 'bank' | 'ewallet' | 'cash' | 'other';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type DebtType = 'hutang' | 'piutang';
export type DebtStatus = 'belum_lunas' | 'sebagian' | 'lunas';
export type BudgetType = 'expense' | 'transfer';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: TransactionType;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  admin_fee: number;
  description: string | null;
  category_id: string | null;
  wallet_id: string;
  destination_wallet_id: string | null;
  budget_id: string | null;
  date: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category | null;
  wallet?: Wallet | null;
  destination_wallet?: Wallet | null;
}

export interface Budget {
  id: string;
  name: string;
  category_id: string | null;
  budget_type: BudgetType;
  wallet_id: string | null;
  target_wallet_id: string | null;
  month: number;
  year: number;
  limit_amount: number;
  created_at: string;
  updated_at: string;
  // Computed
  category?: Category | null;
  wallet?: Wallet | null;
  target_wallet?: Wallet | null;
  spent?: number;
  remaining?: number;
  percentage?: number;
}

export interface Debt {
  id: string;
  type: DebtType;
  person_name: string;
  total_amount: number;
  remaining_amount: number;
  description: string | null;
  status: DebtStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  // Computed
  payments?: DebtPayment[];
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  note: string | null;
  paid_at: string;
  created_at: string;
}

// API response types
export interface DashboardData {
  total_balance: number;
  monthly_income: number;
  monthly_expense: number;
  wallets: Wallet[];
  recent_transactions: Transaction[];
  daily_trend: { date: string; income: number; expense: number }[];
  boncos_categories: {
    category_name: string;
    category_icon: string;
    spent: number;
    budget_limit: number;
    percentage: number;
    avg_previous: number;
  }[];
  monthly_trend: { month: string; income: number; expense: number }[];
}

// Form input types
export interface WalletInput {
  name: string;
  type: WalletType;
  icon?: string;
  color?: string;
  initial_balance?: number;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  admin_fee?: number;
  description?: string;
  category_id?: string;
  wallet_id: string;
  destination_wallet_id?: string;
  budget_id?: string;
  date: string;
}

export interface BudgetInput {
  name: string;
  category_id?: string;
  budget_type: BudgetType;
  wallet_id?: string;
  target_wallet_id?: string;
  month: number;
  year: number;
  limit_amount: number;
}

export interface DebtInput {
  type: DebtType;
  person_name: string;
  total_amount: number;
  description?: string;
  due_date?: string;
}

export interface DebtPaymentInput {
  amount: number;
  note?: string;
  paid_at: string;
}
