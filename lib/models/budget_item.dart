import 'dart:convert';

class BudgetItem {
  final String id;
  final String name;
  final double amount;
  final String? walletId;
  final String type; // 'expense' or 'transfer'
  final String? targetWalletId;

  BudgetItem({
    required this.id,
    required this.name,
    required this.amount,
    this.walletId,
    this.type = 'expense',
    this.targetWalletId,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'amount': amount,
    'walletId': walletId,
    'type': type,
    'targetWalletId': targetWalletId,
  };

  factory BudgetItem.fromJson(Map<String, dynamic> json) => BudgetItem(
    id: json['id'] as String,
    name: json['name'] as String,
    amount: (json['amount'] as num).toDouble(),
    walletId: json['walletId'] as String?,
    type: json['type'] as String? ?? 'expense',
    targetWalletId: json['targetWalletId'] as String?,
  );

  static String encode(List<BudgetItem> items) =>
      json.encode(items.map((e) => e.toJson()).toList());

  static List<BudgetItem> decode(String data) =>
      (json.decode(data) as List).map((e) => BudgetItem.fromJson(e)).toList();

  BudgetItem copyWith({
    String? id,
    String? name,
    double? amount,
    String? walletId,
    String? type,
    String? targetWalletId,
  }) => BudgetItem(
    id: id ?? this.id,
    name: name ?? this.name,
    amount: amount ?? this.amount,
    walletId: walletId ?? this.walletId,
    type: type ?? this.type,
    targetWalletId: targetWalletId ?? this.targetWalletId,
  );
}

class BudgetSummary {
  final BudgetItem budget;
  final double spent;
  final double remaining;
  final double percentage;

  BudgetSummary({
    required this.budget,
    required this.spent,
    required this.remaining,
    required this.percentage,
  });
}
