import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../services/storage_service.dart';
import '../models/wallet.dart';
import '../models/transaction.dart';
import '../utils/helpers.dart';

class WalletScreen extends StatefulWidget {
  final StorageService storage;
  final VoidCallback onRefresh;

  const WalletScreen({super.key, required this.storage, required this.onRefresh});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  StorageService get storage => widget.storage;

  @override
  Widget build(BuildContext context) {
    final wallets = storage.getWallets();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '💳 Dompet Saya',
              style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w700),
            ),
            _addButton(),
          ],
        ),
        const SizedBox(height: 16),
        if (wallets.isEmpty)
          _emptyState()
        else
          ...wallets.map((w) => _walletCard(w)),
      ],
    );
  }

  Widget _addButton() {
    return GestureDetector(
      onTap: _showAddWalletDialog,
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
          const Text('💳', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 12),
          Text('Belum ada dompet!', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
          Text('Tap tombol Tambah untuk memulai.', style: GoogleFonts.poppins(fontSize: 12, color: AppTheme.textMuted)),
        ],
      ),
    );
  }

  Widget _walletCard(Wallet w) {
    final bal = storage.getWalletBalance(w.id);
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              gradient: _walletGradient(w.type),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Center(child: Text(w.icon, style: const TextStyle(fontSize: 24))),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(w.name, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(
                  _walletTypeLabel(w.type),
                  style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textMuted),
                ),
              ],
            ),
          ),
          FittedBox(
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
  }

  LinearGradient _walletGradient(String type) {
    switch (type) {
      case 'bank': return const LinearGradient(colors: [Color(0xFF36A2EB), Color(0xFF2196F3)]);
      case 'ewallet': return AppTheme.primaryGradient;
      case 'cash': return AppTheme.successGradient;
      default: return const LinearGradient(colors: [Color(0xFF9B5DE5), Color(0xFFF15BB5)]);
    }
  }

  String _walletTypeLabel(String type) {
    switch (type) {
      case 'bank': return '🏦 Bank';
      case 'ewallet': return '💳 E-Wallet';
      case 'cash': return '💵 Cash / Tunai';
      default: return '📦 Lainnya';
    }
  }

  void _showAddWalletDialog() {
    final nameCtrl = TextEditingController();
    final balCtrl = TextEditingController();
    String selectedType = 'bank';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: Text('Tambah Dompet', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  style: GoogleFonts.poppins(color: AppTheme.textPrimary),
                  decoration: InputDecoration(
                    labelText: 'Nama Dompet',
                    hintText: 'Misal: BCA, GoPay',
                    labelStyle: GoogleFonts.poppins(),
                  ),
                ),
                const SizedBox(height: 14),
                DropdownButtonFormField<String>(
                  value: selectedType,
                  dropdownColor: AppTheme.bgSecondary,
                  style: GoogleFonts.poppins(color: AppTheme.textPrimary),
                  decoration: InputDecoration(labelText: 'Tipe', labelStyle: GoogleFonts.poppins()),
                  items: const [
                    DropdownMenuItem(value: 'bank', child: Text('🏦 Bank')),
                    DropdownMenuItem(value: 'ewallet', child: Text('💳 E-Wallet')),
                    DropdownMenuItem(value: 'cash', child: Text('💵 Cash / Tunai')),
                    DropdownMenuItem(value: 'other', child: Text('📦 Lainnya')),
                  ],
                  onChanged: (v) => setDialogState(() => selectedType = v!),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: balCtrl,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  style: GoogleFonts.poppins(color: AppTheme.textPrimary),
                  decoration: InputDecoration(
                    labelText: 'Saldo Awal',
                    prefixText: 'Rp ',
                    hintText: '0',
                    labelStyle: GoogleFonts.poppins(),
                    prefixStyle: GoogleFonts.poppins(color: AppTheme.textMuted),
                  ),
                ),
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
                if (name.isEmpty) return;
                final walletId = 'wallet_${AppHelpers.generateId()}';
                final wallet = Wallet(
                  id: walletId,
                  name: name,
                  type: selectedType,
                  createdAt: DateTime.now().toIso8601String(),
                );
                storage.addWallet(wallet);

                final initBal = double.tryParse(balCtrl.text) ?? 0;
                if (initBal > 0) {
                  storage.addTransaction(CashTransaction(
                    id: AppHelpers.generateId(),
                    type: 'income',
                    amount: initBal,
                    description: 'Saldo Awal',
                    wallet: walletId,
                    date: AppHelpers.todayString(),
                    createdAt: DateTime.now().toIso8601String(),
                  ));
                }

                Navigator.pop(ctx);
                setState(() {});
                widget.onRefresh();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Dompet berhasil ditambahkan! ✅', style: GoogleFonts.poppins())),
                );
              },
              child: Text('Simpan', style: GoogleFonts.poppins()),
            ),
          ],
        ),
      ),
    );
  }
}
