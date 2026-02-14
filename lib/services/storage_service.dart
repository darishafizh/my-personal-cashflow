import 'package:shared_preferences/shared_preferences.dart';
import '../models/transaction.dart';
import '../models/wallet.dart';
import '../models/budget_item.dart';

class StorageService {
  static const _txKey = 'cashflow_transactions';
  static const _budgetKey = 'cashflow_budget_items';
  static const _walletKey = 'cashflow_wallets';

  late SharedPreferences _prefs;
  List<CashTransaction> _transactions = [];
  List<BudgetItem> _budgetItems = [];
  List<Wallet> _wallets = [];

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _transactions = _loadTransactions();
    _budgetItems = _loadBudgetItems();
    _wallets = _loadWallets();
  }

  // === Transactions ===
  List<CashTransaction> _loadTransactions() {
    final data = _prefs.getString(_txKey);
    if (data == null) return [];
    try {
      return CashTransaction.decode(data);
    } catch (_) {
      return [];
    }
  }

  void _saveTransactions() {
    _prefs.setString(_txKey, CashTransaction.encode(_transactions));
  }

  List<CashTransaction> getTransactions() => List.unmodifiable(_transactions);

  void addTransaction(CashTransaction tx) {
    _transactions.add(tx);
    _saveTransactions();
  }

  void deleteTransaction(String id) {
    _transactions.removeWhere((t) => t.id == id);
    _saveTransactions();
  }

  // === Wallets ===
  List<Wallet> _loadWallets() {
    final data = _prefs.getString(_walletKey);
    if (data == null) return [];
    try {
      return Wallet.decode(data);
    } catch (_) {
      return [];
    }
  }

  void _saveWallets() {
    _prefs.setString(_walletKey, Wallet.encode(_wallets));
  }

  List<Wallet> getWallets() => List.unmodifiable(_wallets);

  void addWallet(Wallet w) {
    _wallets.add(w);
    _saveWallets();
  }

  void deleteWallet(String id) {
    _wallets.removeWhere((w) => w.id == id);
    _saveWallets();
  }

  String getWalletName(String? id) {
    if (id == null) return 'Unknown';
    final w = _wallets.where((w) => w.id == id);
    return w.isNotEmpty ? w.first.name : 'Unknown';
  }

  double getWalletBalance(String walletId) {
    double income = 0;
    double expense = 0;
    for (final t in _transactions) {
      if (t.type == 'income' && t.wallet == walletId) income += t.amount;
      if (t.type == 'transfer' && t.toWallet == walletId) income += t.amount;
      if (t.type == 'expense' && t.wallet == walletId) expense += t.amount;
      if (t.type == 'transfer' && t.fromWallet == walletId) {
        expense += t.amount + t.adminFee;
      }
    }
    return income - expense;
  }

  // === Budget Items ===
  List<BudgetItem> _loadBudgetItems() {
    final data = _prefs.getString(_budgetKey);
    if (data == null) return [];
    try {
      return BudgetItem.decode(data);
    } catch (_) {
      return [];
    }
  }

  void _saveBudgetItems() {
    _prefs.setString(_budgetKey, BudgetItem.encode(_budgetItems));
  }

  List<BudgetItem> getBudgetItems() => List.unmodifiable(_budgetItems);

  void addBudgetItem(BudgetItem item) {
    _budgetItems.add(item);
    _saveBudgetItems();
  }

  void updateBudgetItem(String id, BudgetItem updated) {
    final idx = _budgetItems.indexWhere((b) => b.id == id);
    if (idx != -1) {
      _budgetItems[idx] = updated;
      _saveBudgetItems();
    }
  }

  void deleteBudgetItem(String id) {
    _budgetItems.removeWhere((b) => b.id == id);
    _saveBudgetItems();
  }

  List<BudgetSummary> getBudgetSummary() {
    final now = DateTime.now();
    final currentMonth = now.month;
    final currentYear = now.year;

    final monthExpenses = _transactions.where((t) {
      if (t.type != 'expense') return false;
      final d = DateTime.tryParse(t.date);
      return d != null && d.month == currentMonth && d.year == currentYear;
    }).toList();

    final monthTransfers = _transactions.where((t) {
      if (t.type != 'transfer') return false;
      final d = DateTime.tryParse(t.date);
      return d != null && d.month == currentMonth && d.year == currentYear;
    }).toList();

    return _budgetItems.map((budget) {
      double expSpent = monthExpenses
          .where((t) => t.budgetItemId == budget.id)
          .fold(0.0, (sum, t) => sum + t.amount);

      double trSpent = monthTransfers
          .where((t) => t.description.contains(budget.name))
          .fold(0.0, (sum, t) => sum + t.amount);

      final spent = expSpent + trSpent;
      return BudgetSummary(
        budget: budget,
        spent: spent,
        remaining: budget.amount - spent,
        percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
      );
    }).toList();
  }

  // === Summary helpers ===
  double get totalIncome => _transactions
      .where((t) => t.type == 'income')
      .fold(0.0, (s, t) => s + t.amount);

  double get totalExpense => _transactions.fold(0.0, (s, t) {
    if (t.type == 'expense') return s + t.amount;
    if (t.type == 'transfer') return s + t.adminFee;
    return s;
  });

  double get balance => totalIncome - totalExpense;
}
