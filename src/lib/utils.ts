// ============================================
// Utility functions — ported from Flutter helpers.dart
// ============================================

/**
 * Format number as Indonesian Rupiah currency
 * e.g. 1500000 → "Rp 1.500.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Compact currency format for charts
 * e.g. 1500000 → "1.5jt", 500000 → "500rb"
 */
export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}jt`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(0)}rb`;
  }
  return `${sign}${abs}`;
}

/**
 * Format date string to Indonesian locale
 * e.g. "2024-01-15" → "15 Jan 2024"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date to relative time
 * e.g. "Hari ini", "Kemarin", "3 hari lalu"
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Kemarin';
  if (diff < 7) return `${diff} hari lalu`;
  if (diff < 30) return `${Math.floor(diff / 7)} minggu lalu`;
  return formatDate(dateStr);
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get month name in Indonesian
 */
export function getMonthName(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  return months[month - 1] || '';
}

/**
 * Get short month name
 */
export function getShortMonthName(month: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  return months[month - 1] || '';
}

/**
 * Wallet type label with icon
 */
export function getWalletTypeLabel(type: string): string {
  switch (type) {
    case 'bank': return '🏦 Bank';
    case 'ewallet': return '💳 E-Wallet';
    case 'cash': return '💵 Cash / Tunai';
    default: return '📦 Lainnya';
  }
}

/**
 * Wallet type icon
 */
export function getWalletIcon(type: string): string {
  switch (type) {
    case 'bank': return '🏦';
    case 'ewallet': return '💳';
    case 'cash': return '💵';
    default: return '📦';
  }
}

/**
 * Debt status label
 */
export function getDebtStatusLabel(status: string): string {
  switch (status) {
    case 'lunas': return 'Lunas';
    case 'sebagian': return 'Sebagian';
    case 'belum_lunas': return 'Belum Lunas';
    default: return status;
  }
}

/**
 * Debt status color class
 */
export function getDebtStatusColor(status: string): string {
  switch (status) {
    case 'lunas': return 'text-success';
    case 'sebagian': return 'text-warning';
    case 'belum_lunas': return 'text-danger';
    default: return 'text-text-muted';
  }
}

/**
 * Transaction type icon & color
 */
export function getTransactionMeta(type: string) {
  switch (type) {
    case 'income':
      return { icon: '📈', label: 'Pemasukan', color: 'text-success', bg: 'bg-success-muted' };
    case 'expense':
      return { icon: '📉', label: 'Pengeluaran', color: 'text-danger', bg: 'bg-danger-muted' };
    case 'transfer':
      return { icon: '🔄', label: 'Transfer', color: 'text-blue-400', bg: 'bg-blue-400/15' };
    default:
      return { icon: '📦', label: type, color: 'text-text-muted', bg: 'bg-surface-raised' };
  }
}

/**
 * classNames merge helper
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Parse currency input string to number
 * "1.500.000" → 1500000
 */
export function parseCurrencyInput(value: string): number {
  return parseInt(value.replace(/\D/g, ''), 10) || 0;
}

/**
 * Format number for display in input (with dots)
 * 1500000 → "1.500.000"
 */
export function formatNumberInput(value: number): string {
  if (!value) return '';
  return value.toLocaleString('id-ID');
}
