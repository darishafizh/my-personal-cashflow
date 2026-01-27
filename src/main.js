// =========================================
// CashFlow Tracker - Main Application
// =========================================


import { StorageManager } from './storage.js';
import { ChartManager } from './chart.js';

// Initialize managers
const storage = new StorageManager();
const chartManager = new ChartManager();

// DOM Elements
const incomeForm = document.getElementById('incomeForm');
const expenseForm = document.getElementById('expenseForm');
const transferForm = document.getElementById('transferForm');
const transactionsList = document.getElementById('transactionsList');
const filterBtns = document.querySelectorAll('.filter-btn');

// Summary elements
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const balanceEl = document.getElementById('balance');

// Current filter
let currentFilter = 'all';

// Budget elements
const budgetList = document.getElementById('budgetList');
const btnAddBudget = document.getElementById('btnAddBudget');
const budgetModal = document.getElementById('budgetModal');
const budgetForm = document.getElementById('budgetForm');
const modalTitle = document.getElementById('modalTitle');
const btnCancelBudget = document.getElementById('btnCancelBudget');
const modalClose = document.getElementById('modalClose');

// Current budget being edited
let currentBudgetId = null;

// Wallet elements
const walletList = document.getElementById('walletList');
const btnAddWallet = document.getElementById('btnAddWallet');
const walletModal = document.getElementById('walletModal');
const walletForm = document.getElementById('walletForm');
const walletModalTitle = document.getElementById('walletModalTitle');
const btnCancelWallet = document.getElementById('btnCancelWallet');
const walletModalClose = document.getElementById('walletModalClose');

let currentWalletId = null;

// =========================================
// Initialize App
// =========================================
function init() {
  // Set default dates to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('incomeDate').value = today;
  document.getElementById('expenseDate').value = today;
  document.getElementById('transferDate').value = today;
  
  // Migration: Clear old default data if present (run once)
  if (!localStorage.getItem('migration_v1_cleared')) {
    // Check if we have the specific default items
    const oldBudgets = localStorage.getItem('cashflow_budget_items');
    if (oldBudgets && oldBudgets.includes('budget_kost')) {
      localStorage.removeItem('cashflow_budget_items');
      // Also clear transactions to be safe since they might reference old budgets
      // localStorage.removeItem('cashflow_transactions'); 
      // Actually let's just clear budgets as requested
      console.log('Migrated: Cleared old default budgets');
    }
    localStorage.setItem('migration_v1_cleared', 'true');
    
    // Reload items after clear
    storage.budgetItems = storage.loadBudgetItems();
  }

  // Load and render data
  renderWalletSection();
  populateWalletDropdowns();
  renderBudgetSection();
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
  
  // Transfer form submit
  transferForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleTransferSubmit();
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
  
  // Budget event listeners
  btnAddBudget.addEventListener('click', () => showBudgetForm());
  
  budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleBudgetSubmit();
  });
  
  btnCancelBudget.addEventListener('click', closeBudgetModal);
  modalClose.addEventListener('click', closeBudgetModal);
  
  budgetModal.addEventListener('click', (e) => {
    if (e.target === budgetModal) closeBudgetModal();
  });
  
  // Budget item actions (event delegation)
  budgetList.addEventListener('click', (e) => {
    if (e.target.closest('.btn-edit-budget')) {
      handleEditBudget(e.target.closest('.btn-edit-budget').dataset.id);
    }
    if (e.target.closest('.btn-delete-budget')) {
      handleDeleteBudget(e.target.closest('.btn-delete-budget').dataset.id);
    }
  });
  
  // Wallet event listeners
  if (btnAddWallet) {
    btnAddWallet.addEventListener('click', () => showWalletForm());
  }
  
  if (walletForm) {
    walletForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleWalletSubmit();
    });
  }
  
  if (btnCancelWallet) btnCancelWallet.addEventListener('click', closeWalletModal);
  if (walletModalClose) walletModalClose.addEventListener('click', closeWalletModal);
  
  if (walletModal) {
    walletModal.addEventListener('click', (e) => {
      if (e.target === walletModal) closeWalletModal();
    });
  }
  
  // Wallet item actions
  if (walletList) {
    walletList.addEventListener('click', (e) => {
      // Future: add edit/delete for wallets
    });
  }
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
  const description = document.getElementById('expenseDesc').value.trim();
  const wallet = document.getElementById('expenseWallet').value;
  const date = document.getElementById('expenseDate').value;
  
  if (!amount || !description || !wallet || !date) {
    showToast('Lengkapin dulu datanya ya! 😅', 'error');
    return;
  }
  
  // Try to match description to a budget item (case-insensitive)
  const budgetItem = storage.getBudgetItems().find(b => b.name.toLowerCase() === description.toLowerCase());
  
  const transaction = {
    id: generateId(),
    type: 'expense',
    amount,
    description,
    budgetItemId: budgetItem ? budgetItem.id : null,
    budgetItemName: budgetItem ? budgetItem.name : null,
    category: budgetItem ? 'custom' : 'lainnya', // Fallback category
    wallet,
    date,
    createdAt: new Date().toISOString()
  };
  
  storage.addTransaction(transaction);
  
  // Reset form
  expenseForm.reset();
  document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
  
  // Update UI
  renderBudgetSection();
  renderTransactions();
  updateSummary();
  updateWalletBalances();
  chartManager.updateCharts(storage.getTransactions());
  
  showToast('Pengeluaran dicatat! 📝', 'success');
}

function handleTransferSubmit() {
  const amount = parseFloat(document.getElementById('transferAmount').value);
  const adminFee = parseFloat(document.getElementById('transferAdmin').value) || 0;
  const fromWallet = document.getElementById('transferFrom').value;
  const toWallet = document.getElementById('transferTo').value;
  const date = document.getElementById('transferDate').value;
  
  if (!amount || !fromWallet || !toWallet || !date) {
    showToast('Lengkapin dulu datanya ya! 😅', 'error');
    return;
  }
  
  if (fromWallet === toWallet) {
    showToast('Dompet tujuan harus beda dong! 😅', 'error');
    return;
  }

  const toWalletName = getWalletName(toWallet);
  const description = `Transfer ke ${toWalletName}`;
  
  const transaction = {
    id: generateId(),
    type: 'transfer',
    amount,
    adminFee,
    fromWallet,
    toWallet,
    description,
    date,
    createdAt: new Date().toISOString()
  };
  
  storage.addTransaction(transaction);
  
  // Reset form
  transferForm.reset();
  document.getElementById('transferDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('transferAdmin').value = 0;
  
  // Update UI
  renderTransactions();
  updateSummary();
  updateWalletBalances();
  chartManager.updateCharts(storage.getTransactions());
  
  showToast('Transfer berhasil dicatat! ⚡', 'success');
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
  const { id, type, amount, description, date, category, wallet, fromWallet, toWallet, adminFee } = transaction;
  
  let icon = type === 'income' ? '💵' : getCategoryIcon(category);
  if (type === 'transfer') icon = '🔄';
  
  const formattedAmount = formatCurrency(amount);
  const formattedDate = formatDate(date);
  const categoryLabel = getCategoryLabel(category);
  const walletLabel = getWalletLabel(wallet);
  
  const fromWalletLabel = getWalletLabel(fromWallet);
  const toWalletLabel = getWalletLabel(toWallet);
  const formattedAdmin = adminFee > 0 ? ` (+${formatCurrency(adminFee)} admin)` : '';
  
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
            ${type === 'transfer' ? `
              <span class="transfer-badge">
                <span class="wallet-badge-${fromWallet}">${fromWalletLabel}</span> 
                → 
                <span class="wallet-badge-${toWallet}">${toWalletLabel}</span>
              </span>
            ` : ''}
          </div>
        </div>
      </div>
      <div class="transaction-right">
        <span class="transaction-amount ${type}">
          ${type === 'income' ? '+' : '-'}${formattedAmount}${type === 'transfer' ? formattedAdmin : ''}
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
    .reduce((sum, t) => {
      if (t.type === 'expense') return sum + t.amount;
      if (t.type === 'transfer') return sum + (t.adminFee || 0);
      return sum;
    }, 0);
    
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

function getWalletIcon(walletId) {
  const wallet = storage.getWallets().find(w => w.id === walletId);
  if (wallet) {
    if (wallet.type === 'bank') return '🏦';
    if (wallet.type === 'ewallet') return '💳';
    if (wallet.type === 'cash') return '💵';
    return '📦';
  }
  
  // Fallback for legacy
  const icons = {
    bca: '🏦',
    mandiri: '🏛️',
    shopeepay: '🛒',
    emoney: '💳'
  };
  return icons[walletId] || '💳';
}

function getWalletLabel(walletId) {
  const wallet = storage.getWallets().find(w => w.id === walletId);
  if (wallet) return wallet.name;

  // Fallback for legacy
  const labels = {
    bca: 'BCA',
    mandiri: 'Mandiri',
    shopeepay: 'SPay',
    emoney: 'E-Money'
  };
  return labels[walletId] || walletId;
}

function updateWalletBalances() {
  renderWalletSection();
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

// =========================================
// Budget Management Functions
// =========================================
function renderBudgetSection() {
  const budgetSummary = storage.getBudgetSummary();
  
  if (budgetSummary.length === 0) {
    budgetList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📊</span>
        <p>Belum ada item budget!</p>
        <p class="empty-subtitle">Klik tombol "Tambah Item" untuk mulai.</p>
      </div>
    `;
    return;
  }
  
  budgetList.innerHTML = budgetSummary.map(budget => createBudgetItemHTML(budget)).join('');
}

function createBudgetItemHTML(budget) {
  const percentage = Math.min(budget.percentage, 100);
  const isOverBudget = budget.spent > budget.amount && budget.amount > 0;
  const progressClass = percentage >= 90 ? 'danger' : percentage >= 70 ? 'warning' : '';
  
  return `
    <div class="budget-item">
      <div class="budget-item-header">
        <div class="budget-item-info">
          <div class="budget-item-name">${escapeHTML(budget.name)}</div>
          <div class="budget-item-amounts">
            <div class="budget-amount">
              <span class="budget-amount-label">Target</span>
              <span class="budget-amount-value planned">${formatCurrency(budget.amount)}</span>
            </div>
            <div class="budget-amount">
              <span class="budget-amount-label">Terpakai</span>
              <span class="budget-amount-value spent">${formatCurrency(budget.spent)}</span>
            </div>
            <div class="budget-amount">
              <span class="budget-amount-label">Sisa</span>
              <span class="budget-amount-value ${isOverBudget ? 'over-budget' : 'remaining'}">
                ${formatCurrency(Math.abs(budget.remaining))}
              </span>
            </div>
          </div>
        </div>
        <div class="budget-item-actions">
          <button class="btn-icon edit btn-edit-budget" data-id="${budget.id}" title="Edit">✏️</button>
          <button class="btn-icon delete btn-delete-budget" data-id="${budget.id}" title="Hapus">🗑️</button>
        </div>
      </div>
      <div class="budget-progress">
        <div class="budget-progress-bar-container">
          <div class="budget-progress-bar ${progressClass}" style="width: ${percentage}%"></div>
        </div>
        <div class="budget-progress-text">
          <span>${percentage.toFixed(1)}% terpakai</span>
          ${isOverBudget ? '<span style="color: var(--danger)">⚠️ Over budget!</span>' : ''}
        </div>
      </div>
      ${budget.walletId ? `<div class="budget-source" style="margin-top: 8px; font-size: 0.8rem; color: var(--text-muted);">
        Sumber: ${getWalletName(budget.walletId)}
      </div>` : ''}
    </div>
  `;
}



function showBudgetForm(budgetItem = null) {
  currentBudgetId = budgetItem ? budgetItem.id : null;
  
  if (budgetItem) {
    modalTitle.textContent = 'Edit Item Budget';
    document.getElementById('budgetName').value = budgetItem.name;
    document.getElementById('budgetAmount').value = budgetItem.amount;
    if (document.getElementById('budgetWallet')) {
      document.getElementById('budgetWallet').value = budgetItem.walletId || '';
    }
  } else {
    modalTitle.textContent = 'Tambah Item Budget';
    budgetForm.reset();
  }
  
  budgetModal.classList.add('show');
}

function closeBudgetModal() {
  budgetModal.classList.remove('show');
  budgetForm.reset();
  currentBudgetId = null;
}

function handleBudgetSubmit() {
  const name = document.getElementById('budgetName').value.trim();
  const amount = parseFloat(document.getElementById('budgetAmount').value) || 0;
  const walletId = document.getElementById('budgetWallet') ? document.getElementById('budgetWallet').value : null;
  
  if (!name) {
    showToast('Nama item harus diisi! 😅', 'error');
    return;
  }
  
  if (currentBudgetId) {
    storage.updateBudgetItem(currentBudgetId, { name, amount, walletId });
    showToast('Budget item berhasil diupdate! ✅', 'success');
  } else {
    const budgetItem = {
      id: 'budget_' + generateId(),
      name,
      amount,
      walletId
    };
    storage.addBudgetItem(budgetItem);
    showToast('Budget item berhasil ditambahkan! ✅', 'success');
  }
  
  closeBudgetModal();
  renderBudgetSection();
}

function handleEditBudget(id) {
  const budgetItem = storage.getBudgetItems().find(b => b.id === id);
  if (budgetItem) {
    showBudgetForm(budgetItem);
  }
}

function handleDeleteBudget(id) {
  if (confirm('Yakin mau hapus item budget ini?')) {
    storage.deleteBudgetItem(id);
    renderBudgetSection();
    showToast('Budget item dihapus! 🗑️', 'success');
  }
}

// =========================================
// Wallet Management Functions
// =========================================
function renderWalletSection() {
  const wallets = storage.getWallets();
  const walletList = document.getElementById('walletList');
  
  if (wallets.length === 0) {
    walletList.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; padding: var(--space-lg);">
        <span class="empty-icon">💳</span>
        <p>Belum ada dompet!</p>
        <p class="empty-subtitle">Tambah dompet dulu biar bisa catat transaksi.</p>
      </div>
    `;
    return;
  }
  
  walletList.innerHTML = wallets.map(wallet => {
    const balance = storage.getWalletBalance(wallet.id);
    let icon = '📦';
    if (wallet.type === 'bank') icon = '🏦';
    if (wallet.type === 'ewallet') icon = '💳';
    if (wallet.type === 'cash') icon = '💵';
    
    // Add specific style classes based on wallet type for color coding
    const typeClass = `wallet-${wallet.type}`; 
    
    return `
      <div class="wallet-card ${typeClass}" data-id="${wallet.id}" style="cursor: pointer;">
        <div class="wallet-icon">${icon}</div>
        <div class="wallet-info">
          <span class="wallet-name">${escapeHTML(wallet.name)}</span>
          <span class="wallet-balance">${formatCurrency(balance)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function populateWalletDropdowns() {
  const wallets = storage.getWallets();
  const selects = ['incomeWallet', 'expenseWallet', 'transferFrom', 'transferTo', 'budgetWallet'];
  
  selects.forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    
    const placeholder = select.options[0];
    select.innerHTML = '';
    select.appendChild(placeholder);
    
    wallets.forEach(wallet => {
      const option = document.createElement('option');
      option.value = wallet.id;
      let icon = '📦';
      if (wallet.type === 'bank') icon = '🏦';
      if (wallet.type === 'ewallet') icon = '💳';
      if (wallet.type === 'cash') icon = '💵';
      
      option.textContent = `${icon} ${wallet.name}`;
      select.appendChild(option);
    });
  });
}

function showWalletForm() {
  currentWalletId = null;
  walletModalTitle.textContent = 'Tambah Dompet';
  walletForm.reset();
  walletModal.classList.add('show');
}

function closeWalletModal() {
  walletModal.classList.remove('show');
  walletForm.reset();
  currentWalletId = null;
}

function handleWalletSubmit() {
  const name = document.getElementById('walletName').value.trim();
  const type = document.getElementById('walletType').value;
  const initialBalance = parseFloat(document.getElementById('walletBalance').value) || 0;
  
  if (!name) {
    showToast('Nama dompet harus diisi! 😅', 'error');
    return;
  }
  
  // Create new wallet
  const wallet = {
    id: 'wallet_' + generateId(),
    name,
    type,
    createdAt: new Date().toISOString()
  };
  
  storage.addWallet(wallet);
  
  // If there's initial balance, create an income transaction
  if (initialBalance > 0) {
    const transaction = {
      id: generateId(),
      type: 'income',
      amount: initialBalance,
      description: 'Saldo Awal',
      wallet: wallet.id,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    storage.addTransaction(transaction);
  }
  
  showToast('Dompet berhasil ditambahkan! ✅', 'success');
  closeWalletModal();
  
  // Update UI
  renderWalletSection();
  populateWalletDropdowns();
  updateSummary(); // Because balance might change
  renderTransactions(); // New transaction added
}

function getWalletName(walletId) {
  const wallet = storage.getWallets().find(w => w.id === walletId);
  return wallet ? wallet.name : 'Unknown';
}
