import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/storage_service.dart';
import '../models/budget_item.dart';
import '../models/transaction.dart';
import '../utils/helpers.dart';

class BudgetScreen extends StatefulWidget {
  final StorageService storage;
  final VoidCallback onRefresh;

  const BudgetScreen({super.key, required this.storage, required this.onRefresh});

  @override
  State<BudgetScreen> createState() => _BudgetScreenState();
}

class _BudgetScreenState extends State<BudgetScreen> {
  StorageService get storage => widget.storage;

  void _refresh() {
    setState(() {});
    widget.onRefresh();
  }

  @override
  Widget build(BuildContext context) {
    final summaries = storage.getBudgetSummary();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '📊 Budget Planner',
              style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w700),
            ),
            _addButton(),
          ],
        ),
        const SizedBox(height: 16),
        if (summaries.isEmpty)
          _emptyState()
        else
          ...summaries.map((bs) => _budgetCard(bs)),
      ],
    );
  }

  Widget _addButton() {
    return GestureDetector(
      onTap: () => _showBudgetDialog(),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          gradient: AppTheme.primaryGradient,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          '➕ Tambah',
          style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.bgPrimary),
        ),
      ),
    );
  }

  Widget _emptyState() {
    return Container(
      padding: const EdgeInsets.all(40),
      decoration: AppTheme.glassmorphicDecoration,
      child: Column(
        children: [
          const Text('📊', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 12),
          Text('Belum ada item budget!', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
          Text('Klik tombol Tambah untuk mulai.', style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textMuted)),
        ],
      ),
    );
  }

  Widget _budgetCard(BudgetSummary bs) {
    final pct = bs.percentage.clamp(0, 100).toDouble();
    final isOver = bs.spent > bs.budget.amount && bs.budget.amount > 0;
    final barColor = pct >= 90 ? AppTheme.danger : pct >= 70 ? AppTheme.warning : AppTheme.primary;
    final isFull = pct >= 100;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Expanded(
                child: Text(bs.budget.name, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600)),
              ),
              IconButton(
                icon: const Text('✏️', style: TextStyle(fontSize: 16)),
                onPressed: () => _showBudgetDialog(edit: bs.budget),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Text('🗑️', style: TextStyle(fontSize: 16)),
                onPressed: () => _confirmDelete(bs.budget.id),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          const SizedBox(height: 10),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: pct / 100,
              backgroundColor: Colors.white.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation(barColor),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text('${pct.toStringAsFixed(1)}% terpakai', style: GoogleFonts.poppins(fontSize: 12, color: barColor, fontWeight: FontWeight.w600)),
              if (isOver) ...[
                const SizedBox(width: 8),
                Text('⚠️ Over budget!', style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.danger)),
              ],
            ],
          ),
          const SizedBox(height: 10),
          // Amounts row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _miniStat('Target', AppHelpers.formatCurrency(bs.budget.amount), AppTheme.textSecondary),
              _miniStat('Terpakai', AppHelpers.formatCurrency(bs.spent), AppTheme.warning),
              _miniStat('Sisa', AppHelpers.formatCurrency(bs.remaining.abs()), isOver ? AppTheme.danger : AppTheme.success),
            ],
          ),
          // Source/Target wallet info
          if (bs.budget.walletId != null) ...[
            const SizedBox(height: 6),
            Text(
              'Sumber: ${storage.getWalletName(bs.budget.walletId)}',
              style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textMuted),
            ),
          ],
          if (bs.budget.type == 'transfer' && bs.budget.targetWalletId != null)
            Text(
              'Tujuan: ${storage.getWalletName(bs.budget.targetWalletId)}',
              style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textMuted),
            ),
          const SizedBox(height: 12),
          // Use budget button
          SizedBox(
            width: double.infinity,
            child: isFull
                ? Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(
                      child: Text('✅ Budget Habis', style: GoogleFonts.poppins(fontSize: 13, color: AppTheme.textMuted)),
                    ),
                  )
                : GestureDetector(
                    onTap: () => _useBudget(bs),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Center(
                        child: Text(
                          '⚡ Gunakan Budget',
                          style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.bgPrimary),
                        ),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _miniStat(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.poppins(fontSize: 10, color: AppTheme.textMuted)),
        Text(value, style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
      ],
    );
  }

  void _showBudgetDialog({BudgetItem? edit}) {
    final nameCtrl = TextEditingController(text: edit?.name ?? '');
    final amountCtrl = TextEditingController(text: edit != null ? edit.amount.toStringAsFixed(0) : '');
    String budgetType = edit?.type ?? 'expense';
    String? walletId = edit?.walletId;
    String? targetWalletId = edit?.targetWalletId;
    final wallets = storage.getWallets();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: Text(edit != null ? 'Edit Budget' : 'Tambah Budget', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  style: GoogleFonts.poppins(color: AppTheme.textPrimary),
                  decoration: InputDecoration(
                    labelText: 'Nama Item',
                    hintText: 'Misal: Kost, Makan',
                    labelStyle: GoogleFonts.poppins(),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: amountCtrl,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  style: GoogleFonts.poppins(color: AppTheme.textPrimary),
                  decoration: InputDecoration(
                    labelText: 'Target Budget (per bulan)',
                    prefixText: 'Rp ',
                    labelStyle: GoogleFonts.poppins(),
                    prefixStyle: GoogleFonts.poppins(color: AppTheme.textMuted),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                DropdownButtonFormField<String>(
                  value: budgetType,
                  dropdownColor: AppTheme.bgSecondary,
                  style: GoogleFonts.poppins(color: AppTheme.textPrimary),
                  decoration: InputDecoration(
                    labelText: 'Tipe Budget',
                    labelStyle: GoogleFonts.poppins(),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                    ),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'expense', child: Text('📉 Pengeluaran')),
                    DropdownMenuItem(value: 'transfer', child: Text('🔄 Transfer')),
                  ],
                  onChanged: (v) => setDialogState(() => budgetType = v!),
                ),
                const SizedBox(height: 20),
                DropdownButtonFormField<String>(
                  value: walletId,
                  dropdownColor: AppTheme.bgSecondary,
                  style: GoogleFonts.poppins(color: AppTheme.textPrimary),
                  decoration: InputDecoration(
                    labelText: 'Sumber Dana',
                    labelStyle: GoogleFonts.poppins(),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                    ),
                  ),
                  hint: Text('Pilih dompet...', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
                  items: wallets.map((w) => DropdownMenuItem(value: w.id, child: Text('${w.icon} ${w.name}'))).toList(),
                  onChanged: (v) => setDialogState(() => walletId = v),
                ),
                if (budgetType == 'transfer') ...[
                  const SizedBox(height: 20),
                  DropdownButtonFormField<String>(
                    value: targetWalletId,
                    dropdownColor: AppTheme.bgSecondary,
                    style: GoogleFonts.poppins(color: AppTheme.textPrimary),
                    decoration: InputDecoration(
                      labelText: 'Ke Dompet (Tujuan)',
                      labelStyle: GoogleFonts.poppins(),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                      ),
                    ),
                    hint: Text('Pilih dompet tujuan...', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
                    items: wallets.map((w) => DropdownMenuItem(value: w.id, child: Text('${w.icon} ${w.name}'))).toList(),
                    onChanged: (v) => setDialogState(() => targetWalletId = v),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text('Batal', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
            ),
            ElevatedButton(
              onPressed: () {
                final name = nameCtrl.text.trim();
                final amount = double.tryParse(amountCtrl.text) ?? 0;
                if (name.isEmpty) return;

                if (budgetType == 'transfer' && (targetWalletId == null || walletId == targetWalletId)) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Dompet asal dan tujuan tidak boleh sama!', style: GoogleFonts.poppins())),
                  );
                  return;
                }

                if (edit != null) {
                  storage.updateBudgetItem(edit.id, edit.copyWith(
                    name: name,
                    amount: amount,
                    walletId: walletId,
                    type: budgetType,
                    targetWalletId: targetWalletId,
                  ));
                } else {
                  storage.addBudgetItem(BudgetItem(
                    id: 'budget_${AppHelpers.generateId()}',
                    name: name,
                    amount: amount,
                    walletId: walletId,
                    type: budgetType,
                    targetWalletId: targetWalletId,
                  ));
                }

                Navigator.pop(ctx);
                _refresh();
              },
              child: Text('Simpan', style: GoogleFonts.poppins()),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(String id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Hapus Budget?', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: Text('Yakin mau hapus item budget ini?', style: GoogleFonts.poppins(color: AppTheme.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Batal', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            onPressed: () {
              storage.deleteBudgetItem(id);
              Navigator.pop(ctx);
              _refresh();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Budget item dihapus! 🗑️', style: GoogleFonts.poppins())),
              );
            },
            child: Text('Ya, Hapus', style: GoogleFonts.poppins(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _useBudget(BudgetSummary bs) {
    final remaining = bs.remaining > 0 ? bs.remaining : 0.0;
    if (remaining <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Budget sudah habis! Edit untuk menambah limit.', style: GoogleFonts.poppins())),
      );
      return;
    }

    final amountCtrl = TextEditingController(text: remaining.toStringAsFixed(0));

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Gunakan Budget', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Masukkan jumlah untuk "${bs.budget.name}"',
              style: GoogleFonts.poppins(fontSize: 13, color: AppTheme.textSecondary),
            ),
            Text(
              'Maks: ${AppHelpers.formatCurrency(remaining)}',
              style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textMuted),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: amountCtrl,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              style: GoogleFonts.poppins(color: AppTheme.textPrimary),
              autofocus: true,
              decoration: InputDecoration(
                prefixText: 'Rp ',
                prefixStyle: GoogleFonts.poppins(color: AppTheme.textMuted),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Batal', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              final amount = double.tryParse(amountCtrl.text) ?? 0;
              if (amount <= 0) return;
              if (amount > remaining) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Melebihi sisa budget!', style: GoogleFonts.poppins()), backgroundColor: AppTheme.danger),
                );
                return;
              }

              final today = AppHelpers.todayString();

              if (bs.budget.type == 'transfer') {
                if (bs.budget.walletId == null || bs.budget.targetWalletId == null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Data dompet budget tidak lengkap!', style: GoogleFonts.poppins())),
                  );
                  return;
                }
                storage.addTransaction(CashTransaction(
                  id: AppHelpers.generateId(),
                  type: 'transfer',
                  amount: amount,
                  adminFee: 0,
                  fromWallet: bs.budget.walletId,
                  toWallet: bs.budget.targetWalletId,
                  description: 'Budget Transfer: ${bs.budget.name}',
                  date: today,
                  createdAt: DateTime.now().toIso8601String(),
                ));
              } else {
                if (bs.budget.walletId == null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Sumber dana belum diset!', style: GoogleFonts.poppins())),
                  );
                  return;
                }
                storage.addTransaction(CashTransaction(
                  id: AppHelpers.generateId(),
                  type: 'expense',
                  amount: amount,
                  budgetItemId: bs.budget.id,
                  budgetItemName: bs.budget.name,
                  category: 'budget',
                  wallet: bs.budget.walletId,
                  description: 'Budget: ${bs.budget.name}',
                  date: today,
                  createdAt: DateTime.now().toIso8601String(),
                ));
              }

              Navigator.pop(ctx);
              _refresh();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Transaksi budget berhasil dicatat! ⚡', style: GoogleFonts.poppins()),
                  backgroundColor: AppTheme.success.withOpacity(0.9),
                ),
              );
            },
            child: Text('Gunakan', style: GoogleFonts.poppins()),
          ),
        ],
      ),
    );
  }
}
