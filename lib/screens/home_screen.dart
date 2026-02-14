import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/storage_service.dart';
import '../models/transaction.dart';
import '../utils/helpers.dart';
import '../widgets/summary_card.dart';
import '../widgets/transaction_tile.dart';
import '../widgets/glassmorphic_card.dart';

class HomeScreen extends StatefulWidget {
  final StorageService storage;
  final VoidCallback onRefresh;

  const HomeScreen({super.key, required this.storage, required this.onRefresh});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _filter = 'all';

  StorageService get storage => widget.storage;

  void _refresh() {
    setState(() {});
    widget.onRefresh();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => _refresh(),
      color: AppTheme.primary,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
        children: [
          _buildHeader(),
          const SizedBox(height: 20),
          _buildSummaryCards(),
          const SizedBox(height: 24),
          _buildWalletSection(),
          const SizedBox(height: 24),
          _buildBudgetSection(),
          const SizedBox(height: 24),
          _buildTransactionsSection(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        const Text('💰', style: TextStyle(fontSize: 36)),
        const SizedBox(height: 4),
        ShaderMask(
          shaderCallback: (bounds) => AppTheme.primaryGradient.createShader(bounds),
          child: Text(
            'CashFlow',
            style: GoogleFonts.poppins(
              fontSize: 32,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
        ),
        Text(
          'Kelola cuan lo biar makin cuan! ✨',
          style: GoogleFonts.poppins(fontSize: 14, color: AppTheme.textSecondary),
        ),
      ],
    );
  }

  Widget _buildSummaryCards() {
    return Column(
      children: [
        SummaryCard(
          icon: '📈',
          label: 'CUAN MASUK',
          value: AppHelpers.formatCurrency(storage.totalIncome),
          valueColor: AppTheme.success,
          iconGradient: AppTheme.successGradient,
        ),
        const SizedBox(height: 12),
        SummaryCard(
          icon: '📉',
          label: 'DUIT KELUAR',
          value: AppHelpers.formatCurrency(storage.totalExpense),
          valueColor: AppTheme.danger,
          iconGradient: AppTheme.dangerGradient,
        ),
        const SizedBox(height: 12),
        SummaryCard(
          icon: '🎯',
          label: 'SISA DOMPET',
          value: AppHelpers.formatCurrency(storage.balance),
          valueColor: storage.balance >= 0 ? AppTheme.primary : AppTheme.danger,
          iconGradient: AppTheme.primaryGradient,
        ),
      ],
    );
  }

  Widget _buildWalletSection() {
    final wallets = storage.getWallets();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '💳 Saldo Dompet Digital',
          style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        if (wallets.isEmpty)
          GlassmorphicCard(
            child: Center(
              child: Column(
                children: [
                  const Text('💳', style: TextStyle(fontSize: 36)),
                  const SizedBox(height: 8),
                  Text('Belum ada dompet!', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
                  Text('Tambah dompet di tab Wallets', style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textMuted)),
                ],
              ),
            ),
          )
        else
          SizedBox(
            height: 90,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: wallets.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final w = wallets[index];
                final bal = storage.getWalletBalance(w.id);
                return Container(
                  width: 180,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.bgCard,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        children: [
                          Text(w.icon, style: const TextStyle(fontSize: 18)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              w.name,
                              style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w500),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      FittedBox(
                        fit: BoxFit.scaleDown,
                        alignment: Alignment.centerLeft,
                        child: Text(
                          AppHelpers.formatCurrency(bal),
                          style: GoogleFonts.poppins(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: bal >= 0 ? AppTheme.primary : AppTheme.danger,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
      ],
    );
  }

  Widget _buildBudgetSection() {
    final summaries = storage.getBudgetSummary();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '📊 Perencanaan Pengeluaran',
          style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        if (summaries.isEmpty)
          GlassmorphicCard(
            child: Center(
              child: Column(
                children: [
                  const Text('📊', style: TextStyle(fontSize: 36)),
                  const SizedBox(height: 8),
                  Text('Belum ada item budget!', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
                  Text('Tambah di tab Budget', style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textMuted)),
                ],
              ),
            ),
          )
        else
          ...summaries.map((bs) {
            final pct = bs.percentage.clamp(0, 100).toDouble();
            final isOver = bs.spent > bs.budget.amount && bs.budget.amount > 0;
            final barColor = pct >= 90 ? AppTheme.danger : pct >= 70 ? AppTheme.warning : AppTheme.primary;
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.bgCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          bs.budget.name,
                          style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w600),
                        ),
                      ),
                      Text(
                        '${pct.toStringAsFixed(1)}%',
                        style: GoogleFonts.poppins(fontSize: 12, color: barColor, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: pct / 100,
                      backgroundColor: Colors.white.withOpacity(0.1),
                      valueColor: AlwaysStoppedAnimation(barColor),
                      minHeight: 6,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _budgetMini('Target', AppHelpers.formatCurrency(bs.budget.amount), AppTheme.textSecondary),
                      _budgetMini('Terpakai', AppHelpers.formatCurrency(bs.spent), AppTheme.warning),
                      _budgetMini(
                        'Sisa',
                        AppHelpers.formatCurrency(bs.remaining.abs()),
                        isOver ? AppTheme.danger : AppTheme.success,
                      ),
                    ],
                  ),
                  if (isOver)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text('⚠️ Over budget!', style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.danger)),
                    ),
                ],
              ),
            );
          }),
      ],
    );
  }

  Widget _budgetMini(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.poppins(fontSize: 10, color: AppTheme.textMuted)),
        Text(value, style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
      ],
    );
  }

  Widget _buildTransactionsSection() {
    final txAll = storage.getTransactions();
    List<CashTransaction> filtered;
    if (_filter == 'income') {
      filtered = txAll.where((t) => t.type == 'income').toList();
    } else if (_filter == 'expense') {
      filtered = txAll.where((t) => t.type == 'expense').toList();
    } else {
      filtered = List.from(txAll);
    }
    filtered.sort((a, b) => b.date.compareTo(a.date));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '📋 Riwayat Transaksi',
              style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        const SizedBox(height: 12),
        // Filter tabs
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(50),
          ),
          child: Row(
            children: [
              _filterChip('Semua', 'all'),
              _filterChip('Cuan Masuk', 'income'),
              _filterChip('Duit Keluar', 'expense'),
            ],
          ),
        ),
        const SizedBox(height: 16),
        if (filtered.isEmpty)
          GlassmorphicCard(
            child: Center(
              child: Column(
                children: [
                  const Text('🤷', style: TextStyle(fontSize: 40)),
                  const SizedBox(height: 8),
                  Text('Belum ada transaksi nih!', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
                  Text('Yuk mulai catat cuan lo! 💪', style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textMuted)),
                ],
              ),
            ),
          )
        else
          ...filtered.take(20).map((tx) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: TransactionTile(
              tx: tx,
              walletName: storage.getWalletName(tx.wallet),
              fromWalletName: storage.getWalletName(tx.fromWallet),
              toWalletName: storage.getWalletName(tx.toWallet),
              onDelete: () => _confirmDelete(tx.id),
            ),
          )),
        if (filtered.length > 20)
          Center(
            child: Text(
              '+ ${filtered.length - 20} transaksi lainnya...',
              style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textMuted),
            ),
          ),
      ],
    );
  }

  Widget _filterChip(String label, String value) {
    final isActive = _filter == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _filter = value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isActive ? AppTheme.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(50),
          ),
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: isActive ? AppTheme.bgPrimary : AppTheme.textSecondary,
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _confirmDelete(String id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Hapus Transaksi?', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        content: Text(
          'Yakin mau hapus transaksi ini selamanya?',
          style: GoogleFonts.poppins(color: AppTheme.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Batal', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
            onPressed: () {
              storage.deleteTransaction(id);
              Navigator.pop(ctx);
              _refresh();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Transaksi dihapus! 🗑️', style: GoogleFonts.poppins()),
                  backgroundColor: AppTheme.bgCard,
                ),
              );
            },
            child: Text('Ya, Hapus', style: GoogleFonts.poppins(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
