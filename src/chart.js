// =========================================
// CashFlow Tracker - Chart Manager
// =========================================

export class ChartManager {
  constructor() {
    this.expenseChart = null;
    this.trendChart = null;
    this.chartColors = {
      kost: '#ff9f40',
      kebutuhan: '#36a2eb',
      harian: '#ffcd56',
      ortu: '#4bc0c0',
      zakat: '#9966ff',
      lainnya: '#c9cbcf'
    };
    this.initCharts();
  }
  
  /**
   * Initialize empty charts
   */
  initCharts() {
    // Set Chart.js defaults
    Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
    Chart.defaults.font.family = "'Outfit', sans-serif";
    
    // Initialize expense breakdown chart
    const expenseCtx = document.getElementById('expenseChart');
    if (expenseCtx) {
      this.expenseChart = new Chart(expenseCtx, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [],
            borderWidth: 0,
            hoverBorderWidth: 3,
            hoverBorderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(10, 10, 26, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (context) => {
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${this.formatCurrency(value)} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
    
    // Initialize trend chart
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
      this.trendChart = new Chart(trendCtx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Cuan Masuk',
              data: [],
              backgroundColor: 'rgba(0, 255, 135, 0.7)',
              borderColor: '#00ff87',
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false
            },
            {
              label: 'Duit Keluar',
              data: [],
              backgroundColor: 'rgba(255, 107, 107, 0.7)',
              borderColor: '#ff6b6b',
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  weight: 500
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                callback: (value) => this.formatCompactCurrency(value)
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(10, 10, 26, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (context) => {
                  return `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`;
                }
              }
            }
          }
        }
      });
    }
  }
  
  /**
   * Update charts with new data
   * @param {Array} transactions - All transactions
   */
  updateCharts(transactions) {
    this.updateExpenseChart(transactions);
    this.updateTrendChart(transactions);
  }
  
  /**
   * Update expense breakdown chart
   * @param {Array} transactions - All transactions
   */
  updateExpenseChart(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const emptyEl = document.getElementById('expenseChartEmpty');
    
    if (expenses.length === 0) {
      emptyEl?.classList.add('visible');
      if (this.expenseChart) {
        this.expenseChart.data.labels = [];
        this.expenseChart.data.datasets[0].data = [];
        this.expenseChart.update();
      }
      return;
    }
    
    emptyEl?.classList.remove('visible');
    
    // Group by category
    const categories = {};
    expenses.forEach(t => {
      if (!categories[t.category]) {
        categories[t.category] = 0;
      }
      categories[t.category] += t.amount;
    });
    
    const labels = Object.keys(categories).map(cat => this.getCategoryLabel(cat));
    const data = Object.values(categories);
    const colors = Object.keys(categories).map(cat => this.chartColors[cat] || '#888888');
    
    if (this.expenseChart) {
      this.expenseChart.data.labels = labels;
      this.expenseChart.data.datasets[0].data = data;
      this.expenseChart.data.datasets[0].backgroundColor = colors;
      this.expenseChart.update('active');
    }
  }
  
  /**
   * Update monthly trend chart
   * @param {Array} transactions - All transactions
   */
  updateTrendChart(transactions) {
    const emptyEl = document.getElementById('trendChartEmpty');
    
    if (transactions.length === 0) {
      emptyEl?.classList.add('visible');
      if (this.trendChart) {
        this.trendChart.data.labels = [];
        this.trendChart.data.datasets[0].data = [];
        this.trendChart.data.datasets[1].data = [];
        this.trendChart.update();
      }
      return;
    }
    
    emptyEl?.classList.remove('visible');
    
    // Get last 6 months data
    const monthlyData = this.getMonthlyTotals(transactions, 6);
    
    if (this.trendChart) {
      this.trendChart.data.labels = monthlyData.map(m => m.label);
      this.trendChart.data.datasets[0].data = monthlyData.map(m => m.income);
      this.trendChart.data.datasets[1].data = monthlyData.map(m => m.expense);
      this.trendChart.update('active');
    }
  }
  
  /**
   * Get monthly totals for the last N months
   * @param {Array} transactions - All transactions
   * @param {number} months - Number of months
   * @returns {Array} Monthly totals
   */
  getMonthlyTotals(transactions, months = 6) {
    const result = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === year && tDate.getMonth() === month;
      });
      
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
   * Get category label in Indonesian
   * @param {string} category - Category key
   * @returns {string} Category label
   */
  getCategoryLabel(category) {
    const labels = {
      kost: '🏠 Kost',
      kebutuhan: '🛒 Kebutuhan',
      harian: '☕ Harian',
      ortu: '👨‍👩‍👧 Ortu',
      zakat: '🕌 Zakat',
      lainnya: '📦 Lainnya'
    };
    return labels[category] || category;
  }
  
  /**
   * Format currency in Indonesian Rupiah
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  /**
   * Format compact currency (e.g., 1jt, 500rb)
   * @param {number} amount - Amount to format
   * @returns {string} Compact formatted currency
   */
  formatCompactCurrency(amount) {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}jt`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}rb`;
    }
    return amount.toString();
  }
}
