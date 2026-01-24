// =========================================
// CashFlow Tracker - Storage Manager
// =========================================

const STORAGE_KEY = 'cashflow_transactions';

export class StorageManager {
  constructor() {
    this.transactions = this.loadTransactions();
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
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
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
}
