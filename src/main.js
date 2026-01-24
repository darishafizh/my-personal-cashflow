// =========================================
// CashFlow Tracker - Main Application
// =========================================

import './style.css';
import { StorageManager } from './storage.js';
import { ChartManager } from './chart.js';

// Initialize managers
const storage = new StorageManager();
const chartManager = new ChartManager();

// DOM Elements
const incomeForm = document.getElementById('incomeForm');
const expenseForm = document.getElementById('expenseForm');
const transactionsList = document.getElementById('transactionsList');
const filterBtns = document.querySelectorAll('.filter-btn');

// Summary elements
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const balanceEl = document.getElementById('balance');

// Current filter
let currentFilter = 'all';

// =========================================
// Initialize App
// =========================================
function init() {
  // Set default dates to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('incomeDate').value = today;
  document.getElementById('expenseDate').value = today;
  
  // Load and render data
  renderTransactions();
  updateSummary();
  updateWalletBalances();
  chartManager.updateCharts(storage.getTransactions());
  
  // Setup event listeners
  setupEventListeners();
}

// =========================================
// Event Listeners
// =========================================
function setupEventListeners() {
  // Income form submit
  incomeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleIncomeSubmit();
  });
  
  // Expense form submit
  expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleExpenseSubmit();
  });
  
  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTransactions();
    });
  });
  
  // Delete transaction (event delegation)
  transactionsList.addEventListener('click', (e) => {
    if (e.target.closest('.btn-delete')) {
      const id = e.target.closest('.btn-delete').dataset.id;
      handleDelete(id);
    }
  });
}

// =========================================
// Form Handlers
// =========================================
function handleIncomeSubmit() {
  const amount = parseFloat(document.getElementById('incomeAmount').value);
  const description = document.getElementById('incomeDesc').value.trim();
  const wallet = document.getElementById('incomeWallet').value;
  const date = document.getElementById('incomeDate').value;
  
  if (!amount || !description || !wallet || !date) {
    showToast('Lengkapin dulu datanya ya! 😅', 'error');
    return;
  }
  
  const transaction = {
    id: generateId(),
    type: 'income',
    amount,
    description,
    wallet,
    date,
    createdAt: new Date().toISOString()
  };
  
  storage.addTransaction(transaction);
  
  // Reset form
  incomeForm.reset();
  document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];
  
  // Update UI
  renderTransactions();
  updateSummary();
  updateWalletBalances();
  chartManager.updateCharts(storage.getTransactions());
  
  showToast('Cuan masuk berhasil dicatat! 💰', 'success');
}

function handleExpenseSubmit() {
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const category = document.getElementById('expenseCategory').value;
  const description = document.getElementById('expenseDesc').value.trim();
  const wallet = document.getElementById('expenseWallet').value;
  const date = document.getElementById('expenseDate').value;
  
  if (!amount || !category || !description || !wallet || !date) {
    showToast('Lengkapin dulu datanya ya! 😅', 'error');
    return;
  }
  
  const transaction = {
    id: generateId(),
    type: 'expense',
    amount,
    category,
    description,
    wallet,
    date,
    createdAt: new Date().toISOString()
  };
  
  storage.addTransaction(transaction);
  
  // Reset form
  expenseForm.reset();
  document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
  
  // Update UI
  renderTransactions();
  updateSummary();
  updateWalletBalances();
  chartManager.updateCharts(storage.getTransactions());
  
  showToast('Pengeluaran dicatat! 📝', 'success');
}

function handleDelete(id) {
  storage.deleteTransaction(id);
  
  // Update UI
  renderTransactions();
  updateSummary();
  updateWalletBalances();
  chartManager.updateCharts(storage.getTransactions());
  
  showToast('Transaksi dihapus! 🗑️', 'success');
}

// =========================================
// Render Functions
// =========================================
function renderTransactions() {
  const transactions = storage.getTransactions();
  
  // Filter transactions
  let filtered = transactions;
  if (currentFilter === 'income') {
    filtered = transactions.filter(t => t.type === 'income');
  } else if (currentFilter === 'expense') {
    filtered = transactions.filter(t => t.type === 'expense');
  }
  
  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (filtered.length === 0) {
    transactionsList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🤷</span>
        <p>Belum ada transaksi nih!</p>
        <p class="empty-subtitle">Yuk mulai catat cuan lo! 💪</p>
      </div>
    `;
    return;
  }
  
  transactionsList.innerHTML = filtered.map(t => createTransactionHTML(t)).join('');
}

function createTransactionHTML(transaction) {
  const { id, type, amount, description, date, category, wallet } = transaction;
  
  const icon = type === 'income' ? '💵' : getCategoryIcon(category);
  const formattedAmount = formatCurrency(amount);
  const formattedDate = formatDate(date);
  const categoryLabel = getCategoryLabel(category);
  const walletLabel = getWalletLabel(wallet);
  
  return `
    <div class="transaction-item new" data-id="${id}">
      <div class="transaction-left">
        <div class="transaction-icon ${type}">
          ${icon}
        </div>
        <div class="transaction-info">
          <div class="transaction-desc">${escapeHTML(description)}</div>
          <div class="transaction-meta">
            <span>${formattedDate}</span>
            ${category ? `<span class="transaction-category category-${category}">${categoryLabel}</span>` : ''}
            ${wallet ? `<span class="transaction-wallet wallet-badge-${wallet}">${walletLabel}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="transaction-right">
        <span class="transaction-amount ${type}">
          ${type === 'income' ? '+' : '-'}${formattedAmount}
        </span>
        <button class="btn-delete" data-id="${id}" title="Hapus transaksi">
          🗑️
        </button>
      </div>
    </div>
  `;
}

function updateSummary() {
  const transactions = storage.getTransactions();
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpense;
  
  totalIncomeEl.textContent = formatCurrency(totalIncome);
  totalExpenseEl.textContent = formatCurrency(totalExpense);
  balanceEl.textContent = formatCurrency(balance);
  
  // Add color indicator for balance
  if (balance < 0) {
    balanceEl.style.color = 'var(--danger)';
  } else if (balance > 0) {
    balanceEl.style.color = 'var(--primary)';
  } else {
    balanceEl.style.color = 'var(--text-secondary)';
  }
}

// =========================================
// Utility Functions
// =========================================
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function getCategoryIcon(category) {
  const icons = {
    kost: '🏠',
    kebutuhan: '🛒',
    harian: '☕',
    ortu: '👨‍👩‍👧',
    zakat: '🕌',
    lainnya: '📦'
  };
  return icons[category] || '📦';
}

function getCategoryLabel(category) {
  const labels = {
    kost: 'Kost',
    kebutuhan: 'Kebutuhan',
    harian: 'Harian',
    ortu: 'Ortu',
    zakat: 'Zakat',
    lainnya: 'Lainnya'
  };
  return labels[category] || category;
}

function getWalletIcon(wallet) {
  const icons = {
    bca: '🏦',
    mandiri: '🏛️',
    shopeepay: '🛒',
    emoney: '💳'
  };
  return icons[wallet] || '💳';
}

function getWalletLabel(wallet) {
  const labels = {
    bca: 'BCA',
    mandiri: 'Mandiri',
    shopeepay: 'SPay',
    emoney: 'E-Money'
  };
  return labels[wallet] || wallet;
}

function updateWalletBalances() {
  const transactions = storage.getTransactions();
  const wallets = ['bca', 'mandiri', 'shopeepay', 'emoney'];
  
  wallets.forEach(wallet => {
    const income = transactions
      .filter(t => t.type === 'income' && t.wallet === wallet)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense' && t.wallet === wallet)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    
    const elementId = `balance${wallet.charAt(0).toUpperCase() + wallet.slice(1)}`;
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = formatCurrency(balance);
    }
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = type === 'success' ? '✅' : '❌';
  
  toast.querySelector('.toast-icon').textContent = icon;
  toast.querySelector('.toast-message').textContent = message;
  toast.className = `toast ${type}`;
  
  // Show toast
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// =========================================
// Start App
// =========================================
document.addEventListener('DOMContentLoaded', init);
