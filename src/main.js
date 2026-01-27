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

// =========================================
// Initialize App
// =========================================
function init() {
  // Set default dates to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('incomeDate').value = today;
  document.getElementById('expenseDate').value = today;
  document.getElementById('transferDate').value = today;
  
  // Load and render data
  renderBudgetSection();
  populateExpenseBudgetDropdown();
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
  const budgetItemId = document.getElementById('expenseBudgetItem').value;
  const wallet = document.getElementById('expenseWallet').value;
  const date = document.getElementById('expenseDate').value;
  
  if (!amount || !budgetItemId || !wallet || !date) {
    showToast('Lengkapin dulu datanya ya! 😅', 'error');
    return;
  }
  
  const budgetItem = storage.getBudgetItems().find(b => b.id === budgetItemId);
  
  const transaction = {
    id: generateId(),
    type: 'expense',
    amount,
    budgetItemId,
    budgetItemName: budgetItem ? budgetItem.name : 'Unknown',
    description: budgetItem ? budgetItem.name : 'Unknown',
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
  const description = document.getElementById('transferDesc').value.trim();
  const date = document.getElementById('transferDate').value;
  
  if (!amount || !fromWallet || !toWallet || !description || !date) {
    showToast('Lengkapin dulu datanya ya! 😅', 'error');
    return;
  }
  
  if (fromWallet === toWallet) {
    showToast('Dompet tujuan harus beda dong! 😅', 'error');
    return;
  }
  
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
      .reduce((sum, t) => {
        if (t.type === 'income' && t.wallet === wallet) return sum + t.amount;
        if (t.type === 'transfer' && t.toWallet === wallet) return sum + t.amount;
        return sum;
      }, 0);
    
    const expense = transactions
      .reduce((sum, t) => {
        if (t.type === 'expense' && t.wallet === wallet) return sum + t.amount;
        if (t.type === 'transfer' && t.fromWallet === wallet) return sum + t.amount + (t.adminFee || 0);
        return sum;
      }, 0);
    
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
    </div>
  `;
}

function populateExpenseBudgetDropdown() {
  const budgetItems = storage.getBudgetItems();
  const select = document.getElementById('expenseBudgetItem');
  
  const placeholder = select.options[0];
  select.innerHTML = '';
  select.appendChild(placeholder);
  
  budgetItems.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name;
    select.appendChild(option);
  });
}

function showBudgetForm(budgetItem = null) {
  currentBudgetId = budgetItem ? budgetItem.id : null;
  
  if (budgetItem) {
    modalTitle.textContent = 'Edit Item Budget';
    document.getElementById('budgetName').value = budgetItem.name;
    document.getElementById('budgetAmount').value = budgetItem.amount;
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
  
  if (!name) {
    showToast('Nama item harus diisi! 😅', 'error');
    return;
  }
  
  if (currentBudgetId) {
    storage.updateBudgetItem(currentBudgetId, { name, amount });
    showToast('Budget item berhasil diupdate! ✅', 'success');
  } else {
    const budgetItem = {
      id: 'budget_' + generateId(),
      name,
      amount
    };
    storage.addBudgetItem(budgetItem);
    showToast('Budget item berhasil ditambahkan! ✅', 'success');
  }
  
  closeBudgetModal();
  renderBudgetSection();
  populateExpenseBudgetDropdown();
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
    populateExpenseBudgetDropdown();
    showToast('Budget item dihapus! 🗑️', 'success');
  }
}
