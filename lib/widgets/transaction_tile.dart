import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../models/transaction.dart';
import '../utils/helpers.dart';

class TransactionTile extends StatelessWidget {
  final CashTransaction tx;
  final String walletName;
  final String? fromWalletName;
  final String? toWalletName;
  final VoidCallback? onDelete;

  const TransactionTile({
    super.key,
    required this.tx,
    required this.walletName,
    this.fromWalletName,
    this.toWalletName,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isIncome = tx.type == 'income';
    final isTransfer = tx.type == 'transfer';
    final iconText = isTransfer
        ? '🔄'
        : isIncome
            ? '💵'
            : AppHelpers.getCategoryIcon(tx.category);

    final amountColor = isIncome
        ? AppTheme.success
        : isTransfer
            ? AppTheme.warning
            : AppTheme.danger;

    final prefix = isIncome ? '+' : '-';
    final adminStr = isTransfer && tx.adminFee > 0
        ? ' (+${AppHelpers.formatCurrency(tx.adminFee)} admin)'
        : '';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.transparent),
      ),
      child: Row(
        children: [
          // Icon
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              gradient: isIncome
                  ? const LinearGradient(colors: [Color(0x3300FF87), Color(0x3300CC6A)])
                  : isTransfer
                      ? const LinearGradient(colors: [Color(0x3300F5D4), Color(0x339B5DE5)])
                      : const LinearGradient(colors: [Color(0x339B5DE5), Color(0x33F15BB5)]),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(child: Text(iconText, style: const TextStyle(fontSize: 18))),
          ),
          const SizedBox(width: 12),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tx.description,
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppTheme.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Text(
                      AppHelpers.formatDate(tx.date),
                      style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textMuted),
                    ),
                    if (isTransfer && fromWalletName != null) ...[
                      const SizedBox(width: 6),
                      Text(
                        '$fromWalletName → $toWalletName',
                        style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textMuted),
                      ),
                    ] else if (!isTransfer) ...[
                      const SizedBox(width: 6),
                      Text(
                        walletName,
                        style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.primary),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          // Amount + delete
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '$prefix${AppHelpers.formatCurrency(tx.amount)}$adminStr',
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: amountColor,
                ),
              ),
            ],
          ),
          if (onDelete != null) ...[
            const SizedBox(width: 8),
            GestureDetector(
              onTap: onDelete,
              child: Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppTheme.danger.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(
                  child: Text('🗑️', style: TextStyle(fontSize: 14)),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
