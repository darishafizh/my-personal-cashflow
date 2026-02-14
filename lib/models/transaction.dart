import 'dart:convert';

class CashTransaction {
  final String id;
  final String type; // 'income', 'expense', 'transfer'
  final double amount;
  final String description;
  final String? wallet;
  final String? fromWallet;
  final String? toWallet;
  final double adminFee;
  final String? category;
  final String? budgetItemId;
  final String? budgetItemName;
  final String date;
  final String createdAt;

  CashTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.description,
    this.wallet,
    this.fromWallet,
    this.toWallet,
    this.adminFee = 0,
    this.category,
    this.budgetItemId,
    this.budgetItemName,
    required this.date,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'type': type,
    'amount': amount,
    'description': description,
    'wallet': wallet,
    'fromWallet': fromWallet,
    'toWallet': toWallet,
    'adminFee': adminFee,
    'category': category,
    'budgetItemId': budgetItemId,
    'budgetItemName': budgetItemName,
    'date': date,
    'createdAt': createdAt,
  };

  factory CashTransaction.fromJson(Map<String, dynamic> json) => CashTransaction(
    id: json['id'] as String,
    type: json['type'] as String,
    amount: (json['amount'] as num).toDouble(),
    description: json['description'] as String? ?? '',
    wallet: json['wallet'] as String?,
    fromWallet: json['fromWallet'] as String?,
    toWallet: json['toWallet'] as String?,
    adminFee: (json['adminFee'] as num?)?.toDouble() ?? 0,
    category: json['category'] as String?,
    budgetItemId: json['budgetItemId'] as String?,
    budgetItemName: json['budgetItemName'] as String?,
    date: json['date'] as String,
    createdAt: json['createdAt'] as String,
  );

  static String encode(List<CashTransaction> items) =>
      json.encode(items.map((e) => e.toJson()).toList());

  static List<CashTransaction> decode(String data) =>
      (json.decode(data) as List).map((e) => CashTransaction.fromJson(e)).toList();
}
