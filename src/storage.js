// =========================================
// CashFlow Tracker - Storage Manager
// =========================================

const STORAGE_KEY = 'cashflow_transactions';
const BUDGET_KEY = 'cashflow_budget_items';

export class StorageManager {
  constructor() {
    this.transactions = this.loadTransactions();
    this.budgetItems = this.loadBudgetItems();
  }
  
  /**
   * Load transactions from localStorage
   * @returns {Array} Array of transactions
   */
  loadTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }
  
  /**
   * Save transactions to localStorage
   */
  saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }
  
  /**
   * Get all transactions
   * @returns {Array} Array of transactions
   */
  getTransactions() {
    return this.transactions;
  }
  
  /**
   * Add a new transaction
   * @param {Object} transaction - Transaction object
   */
  addTransaction(transaction) {
    this.transactions.push(transaction);
    this.saveTransactions();
  }
  
  /**
   * Delete a transaction by ID
   * @param {string} id - Transaction ID
   */
  deleteTransaction(id) {
    this.transactions = this.transactions.filter(t => t.id !== id);
    this.saveTransactions();
  }
  
  /**
   * Update a transaction
   * @param {string} id - Transaction ID
   * @param {Object} updates - Fields to update
   */
  updateTransaction(id, updates) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.transactions[index] = { ...this.transactions[index], ...updates };
      this.saveTransactions();
    }
  }
  
  /**
   * Get transactions filtered by type
   * @param {string} type - 'income' or 'expense'
   * @returns {Array} Filtered transactions
   */
  getTransactionsByType(type) {
    return this.transactions.filter(t => t.type === type);
  }
  
  /**
   * Get transactions for a specific month
   * @param {number} year - Year
   * @param {number} month - Month (0-11)
   * @returns {Array} Filtered transactions
   */
  getTransactionsByMonth(year, month) {
    return this.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }
  
  /**
   * Get expense totals by category
   * @returns {Object} Category totals
   */
  getExpensesByCategory() {
    const expenses = this.getTransactionsByType('expense');
    const categories = {};
    
    expenses.forEach(t => {
      if (!categories[t.category]) {
        categories[t.category] = 0;
      }
      categories[t.category] += t.amount;
    });
    
    return categories;
  }
  
  /**
   * Get monthly totals for the last N months
   * @param {number} months - Number of months to get
   * @returns {Array} Monthly totals
   */
  getMonthlyTotals(months = 6) {
    const result = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const monthTransactions = this.getTransactionsByMonth(year, month);
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expense = monthTransactions
        .reduce((sum, t) => {
          if (t.type === 'expense') return sum + t.amount;
          if (t.type === 'transfer') return sum + (t.adminFee || 0);
          return sum;
        }, 0);
      
      result.push({
        label: new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date),
        income,
        expense
      });
    }
    
    return result;
  }
  
  /**
   * Clear all transactions
   */
  clearAll() {
    this.transactions = [];
    this.saveTransactions();
  }
  
  // =========================================
  // Budget Management Methods
  // =========================================
  
  /**
   * Load budget items from localStorage
   * @returns {Array} Array of budget items
   */
  loadBudgetItems() {
    try {
      const data = localStorage.getItem(BUDGET_KEY);
      if (data) {
        return JSON.parse(data);
      }
      // Default budget items
      const defaultBudgets = [
        { id: 'budget_kost', name: 'Kost', amount: 1300000 },
        { id: 'budget_ortu', name: 'Ortu', amount: 500000 },
        { id: 'budget_listrik', name: 'Listrik', amount: 0 },
        { id: 'budget_bekal', name: 'Bekal', amount: 0 },
        { id: 'budget_kebutuhan', name: 'Kebutuhan per Bulan', amount: 0 },
        { id: 'budget_emoney', name: 'E-Money', amount: 0 },
        { id: 'budget_tabungan', name: 'Tabungan', amount: 0 }
      ];
      this.budgetItems = defaultBudgets;
      this.saveBudgetItems();
      return defaultBudgets;
    } catch (error) {
      console.error('Error loading budget items:', error);
      return [];
    }
  }
  
  /**
   * Save budget items to localStorage
   */
  saveBudgetItems() {
    try {
      localStorage.setItem(BUDGET_KEY, JSON.stringify(this.budgetItems));
    } catch (error) {
      console.error('Error saving budget items:', error);
    }
  }
  
  /**
   * Get all budget items
   * @returns {Array} Array of budget items
   */
  getBudgetItems() {
    return this.budgetItems;
  }
  
  /**
   * Add a new budget item
   * @param {Object} budgetItem - Budget item object with name and amount
   */
  addBudgetItem(budgetItem) {
    this.budgetItems.push(budgetItem);
    this.saveBudgetItems();
  }
  
  /**
   * Update a budget item
   * @param {string} id - Budget item ID
   * @param {Object} updates - Fields to update
   */
  updateBudgetItem(id, updates) {
    const index = this.budgetItems.findIndex(b => b.id === id);
    if (index !== -1) {
      this.budgetItems[index] = { ...this.budgetItems[index], ...updates };
      this.saveBudgetItems();
    }
  }
  
  /**
   * Delete a budget item
   * @param {string} id - Budget item ID
   */
  deleteBudgetItem(id) {
    this.budgetItems = this.budgetItems.filter(b => b.id !== id);
    this.saveBudgetItems();
  }
  
  /**
   * Get budget summary for current month
   * @returns {Array} Budget items with actual spending
   */
  getBudgetSummary() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthExpenses = this.transactions.filter(t => {
      if (t.type !== 'expense') return false;
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    return this.budgetItems.map(budget => {
      const spent = monthExpenses
        .filter(t => t.budgetItemId === budget.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0
      };
    });
  }
}
