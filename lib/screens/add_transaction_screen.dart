import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/storage_service.dart';
import '../models/transaction.dart';
import '../models/wallet.dart';
import '../utils/helpers.dart';

class AddTransactionScreen extends StatefulWidget {
  final StorageService storage;
  final VoidCallback onSaved;
  final int initialTab;

  const AddTransactionScreen({
    super.key,
    required this.storage,
    required this.onSaved,
    this.initialTab = 0,
  });

  @override
  State<AddTransactionScreen> createState() => _AddTransactionScreenState();
}

class _AddTransactionScreenState extends State<AddTransactionScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Income form
  final _incomeAmountCtrl = TextEditingController();
  final _incomeDescCtrl = TextEditingController();
  String? _incomeWallet;

  // Expense form
  final _expenseAmountCtrl = TextEditingController();
  final _expenseDescCtrl = TextEditingController();
  String? _expenseWallet;

  // Transfer form
  final _transferAmountCtrl = TextEditingController();
  final _transferAdminCtrl = TextEditingController(text: '0');
  String? _transferFrom;
  String? _transferTo;

  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this, initialIndex: widget.initialTab);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _incomeAmountCtrl.dispose();
    _incomeDescCtrl.dispose();
    _expenseAmountCtrl.dispose();
    _expenseDescCtrl.dispose();
    _transferAmountCtrl.dispose();
    _transferAdminCtrl.dispose();
    super.dispose();
  }

  List<Wallet> get wallets => widget.storage.getWallets();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Tambah Transaksi', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primary,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textMuted,
          labelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13),
          tabs: const [
            Tab(text: '💵 Cuan'),
            Tab(text: '💸 Keluar'),
            Tab(text: '🔄 Transfer'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildIncomeForm(),
          _buildExpenseForm(),
          _buildTransferForm(),
        ],
      ),
    );
  }

  Widget _buildIncomeForm() => _formWrapper([
    _amountField(_incomeAmountCtrl, 'Jumlah Cuan'),
    _textField(_incomeDescCtrl, 'Sumber Cuan', 'Gajian, Freelance, dll'),
    _walletDropdown('Simpan ke', _incomeWallet, (v) => setState(() => _incomeWallet = v)),
    _dateField(),
    _submitButton('Gas Tambah! 🚀', AppTheme.successGradient, _submitIncome),
  ]);

  Widget _buildExpenseForm() => _formWrapper([
    _amountField(_expenseAmountCtrl, 'Jumlah Keluar'),
    _textField(_expenseDescCtrl, 'Keterangan', 'Bayar kost, Makan, dll'),
    _walletDropdown('Bayar dari', _expenseWallet, (v) => setState(() => _expenseWallet = v)),
    _dateField(),
    _submitButton('Catat Dulu! 📝', const LinearGradient(colors: [AppTheme.secondary, AppTheme.accent]), _submitExpense),
  ]);

  Widget _buildTransferForm() => _formWrapper([
    _amountField(_transferAmountCtrl, 'Jumlah Transfer'),
    _amountField(_transferAdminCtrl, 'Biaya Admin'),
    _walletDropdown('Dari', _transferFrom, (v) => setState(() => _transferFrom = v)),
    _walletDropdown('Ke', _transferTo, (v) => setState(() => _transferTo = v)),
    _dateField(),
    _submitButton('Pindahin Cuan! ⚡', AppTheme.primaryGradient, _submitTransfer),
  ]);

  Widget _formWrapper(List<Widget> children) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: children.map((w) => Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: w,
      )).toList(),
    );
  }

  Widget _amountField(TextEditingController ctrl, String label) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.poppins(fontSize: 13, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
        const SizedBox(height: 6),
        TextField(
          controller: ctrl,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          style: GoogleFonts.poppins(color: AppTheme.textPrimary),
          decoration: InputDecoration(
            prefixText: 'Rp ',
            prefixStyle: GoogleFonts.poppins(color: AppTheme.textMuted, fontWeight: FontWeight.w500),
            hintText: '0',
          ),
        ),
      ],
    );
  }

  Widget _textField(TextEditingController ctrl, String label, String hint) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.poppins(fontSize: 13, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
        const SizedBox(height: 6),
        TextField(
          controller: ctrl,
          style: GoogleFonts.poppins(color: AppTheme.textPrimary),
          decoration: InputDecoration(hintText: hint),
        ),
      ],
    );
  }

  Widget _walletDropdown(String label, String? value, ValueChanged<String?> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.poppins(fontSize: 13, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: value,
          dropdownColor: AppTheme.bgSecondary,
          style: GoogleFonts.poppins(color: AppTheme.textPrimary),
          decoration: const InputDecoration(),
          hint: Text('Pilih dompet...', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
          items: wallets.map((w) => DropdownMenuItem(
            value: w.id,
            child: Text('${w.icon} ${w.name}'),
          )).toList(),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _dateField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Tanggal', style: GoogleFonts.poppins(fontSize: 13, color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
        const SizedBox(height: 6),
        InkWell(
          onTap: () async {
            final picked = await showDatePicker(
              context: context,
              initialDate: _selectedDate,
              firstDate: DateTime(2020),
              lastDate: DateTime(2030),
              builder: (ctx, child) => Theme(
                data: ThemeData.dark().copyWith(
                  colorScheme: const ColorScheme.dark(primary: AppTheme.primary, surface: AppTheme.bgSecondary),
                ),
                child: child!,
              ),
            );
            if (picked != null) setState(() => _selectedDate = picked);
          },
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withOpacity(0.15)),
            ),
            child: Text(
              AppHelpers.formatDate(_selectedDate.toIso8601String().split('T')[0]),
              style: GoogleFonts.poppins(color: AppTheme.textPrimary),
            ),
          ),
        ),
      ],
    );
  }

  Widget _submitButton(String label, Gradient gradient, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          gradient: gradient,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [BoxShadow(color: gradient.colors.first.withOpacity(0.3), blurRadius: 16)],
        ),
        child: Center(
          child: Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppTheme.bgPrimary,
            ),
          ),
        ),
      ),
    );
  }

  String get _dateStr => _selectedDate.toIso8601String().split('T')[0];

  void _submitIncome() {
    final amount = double.tryParse(_incomeAmountCtrl.text) ?? 0;
    final desc = _incomeDescCtrl.text.trim();
    if (amount <= 0 || desc.isEmpty || _incomeWallet == null) {
      _showError('Lengkapin dulu datanya ya! 😅');
      return;
    }
    widget.storage.addTransaction(CashTransaction(
      id: AppHelpers.generateId(),
      type: 'income',
      amount: amount,
      description: desc,
      wallet: _incomeWallet,
      date: _dateStr,
      createdAt: DateTime.now().toIso8601String(),
    ));
    _incomeAmountCtrl.clear();
    _incomeDescCtrl.clear();
    widget.onSaved();
    Navigator.pop(context);
    _showSuccess('Cuan masuk berhasil dicatat! 💰');
  }

  void _submitExpense() {
    final amount = double.tryParse(_expenseAmountCtrl.text) ?? 0;
    final desc = _expenseDescCtrl.text.trim();
    if (amount <= 0 || desc.isEmpty || _expenseWallet == null) {
      _showError('Lengkapin dulu datanya ya! 😅');
      return;
    }
    // Try to match to budget
    final budgets = widget.storage.getBudgetItems();
    final matched = budgets.where((b) => b.name.toLowerCase() == desc.toLowerCase());
    final budgetItem = matched.isNotEmpty ? matched.first : null;

    widget.storage.addTransaction(CashTransaction(
      id: AppHelpers.generateId(),
      type: 'expense',
      amount: amount,
      description: desc,
      budgetItemId: budgetItem?.id,
      budgetItemName: budgetItem?.name,
      category: budgetItem != null ? 'custom' : 'lainnya',
      wallet: _expenseWallet,
      date: _dateStr,
      createdAt: DateTime.now().toIso8601String(),
    ));
    _expenseAmountCtrl.clear();
    _expenseDescCtrl.clear();
    widget.onSaved();
    Navigator.pop(context);
    _showSuccess('Pengeluaran dicatat! 📝');
  }

  void _submitTransfer() {
    final amount = double.tryParse(_transferAmountCtrl.text) ?? 0;
    final admin = double.tryParse(_transferAdminCtrl.text) ?? 0;
    if (amount <= 0 || _transferFrom == null || _transferTo == null) {
      _showError('Lengkapin dulu datanya ya! 😅');
      return;
    }
    if (_transferFrom == _transferTo) {
      _showError('Dompet tujuan harus beda dong! 😅');
      return;
    }
    final toName = widget.storage.getWalletName(_transferTo);
    widget.storage.addTransaction(CashTransaction(
      id: AppHelpers.generateId(),
      type: 'transfer',
      amount: amount,
      adminFee: admin,
      fromWallet: _transferFrom,
      toWallet: _transferTo,
      description: 'Transfer ke $toName',
      date: _dateStr,
      createdAt: DateTime.now().toIso8601String(),
    ));
    _transferAmountCtrl.clear();
    _transferAdminCtrl.text = '0';
    widget.onSaved();
    Navigator.pop(context);
    _showSuccess('Transfer berhasil dicatat! ⚡');
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg, style: GoogleFonts.poppins()), backgroundColor: AppTheme.danger.withOpacity(0.9)),
    );
  }

  void _showSuccess(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg, style: GoogleFonts.poppins()), backgroundColor: AppTheme.success.withOpacity(0.9)),
    );
  }
}
