import 'package:intl/intl.dart';

class AppHelpers {
  static final _currencyFormat = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );

  static String formatCurrency(double amount) => _currencyFormat.format(amount);

  static String formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('d MMM yyyy', 'id_ID').format(date);
    } catch (_) {
      return dateStr;
    }
  }

  static String formatCompactCurrency(double amount) {
    if (amount >= 1000000) {
      return '${(amount / 1000000).toStringAsFixed(1)}jt';
    } else if (amount >= 1000) {
      return '${(amount / 1000).toStringAsFixed(0)}rb';
    }
    return amount.toStringAsFixed(0);
  }

  static String generateId() {
    final now = DateTime.now().millisecondsSinceEpoch;
    final rand = (now * 31 + 17) % 100000;
    return '${now.toRadixString(36)}_${rand.toRadixString(36)}';
  }

  static String getCategoryIcon(String? category) {
    switch (category) {
      case 'kost': return '🏠';
      case 'kebutuhan': return '🛒';
      case 'harian': return '☕';
      case 'ortu': return '👨‍👩‍👧';
      case 'zakat': return '🕌';
      default: return '📦';
    }
  }

  static String todayString() {
    return DateFormat('yyyy-MM-dd').format(DateTime.now());
  }
}
