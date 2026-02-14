import 'dart:convert';

class Wallet {
  final String id;
  final String name;
  final String type; // 'bank', 'ewallet', 'cash', 'other'
  final String createdAt;

  Wallet({
    required this.id,
    required this.name,
    required this.type,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'type': type,
    'createdAt': createdAt,
  };

  factory Wallet.fromJson(Map<String, dynamic> json) => Wallet(
    id: json['id'] as String,
    name: json['name'] as String,
    type: json['type'] as String,
    createdAt: json['createdAt'] as String? ?? '',
  );

  static String encode(List<Wallet> items) =>
      json.encode(items.map((e) => e.toJson()).toList());

  static List<Wallet> decode(String data) =>
      (json.decode(data) as List).map((e) => Wallet.fromJson(e)).toList();

  String get icon {
    switch (type) {
      case 'bank': return '🏦';
      case 'ewallet': return '💳';
      case 'cash': return '💵';
      default: return '📦';
    }
  }
}
