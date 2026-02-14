import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';
import '../theme/app_theme.dart';
import '../services/storage_service.dart';
import '../utils/helpers.dart';

class ChartsScreen extends StatelessWidget {
  final StorageService storage;

  const ChartsScreen({super.key, required this.storage});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      children: [
        Text(
          '📊 Statistik Keuangan',
          style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 20),
        _buildExpenseChart(),
        const SizedBox(height: 24),
        _buildTrendChart(),
      ],
    );
  }

  Widget _buildExpenseChart() {
    final transactions = storage.getTransactions();
    final expenses = transactions.where((t) => t.type == 'expense').toList();

    // Group by category
    final Map<String, double> categories = {};
    for (final t in expenses) {
      final cat = t.category ?? 'lainnya';
      categories[cat] = (categories[cat] ?? 0) + t.amount;
    }

    final colors = <String, Color>{
      'kost': const Color(0xFFFF9F40),
      'kebutuhan': const Color(0xFF36A2EB),
      'harian': const Color(0xFFFFCD56),
      'ortu': const Color(0xFF4BC0C0),
      'zakat': const Color(0xFF9966FF),
      'lainnya': const Color(0xFFC9CBCF),
      'custom': const Color(0xFFF15BB5),
      'budget': const Color(0xFF00F5D4),
    };

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('📊 Breakdown Pengeluaran', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 20),
          if (expenses.isEmpty)
            Center(
              child: Column(
                children: [
                  const SizedBox(height: 20),
                  Text('📝', style: const TextStyle(fontSize: 40)),
                  const SizedBox(height: 8),
                  Text('Belum ada data pengeluaran', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
                  const SizedBox(height: 20),
                ],
              ),
            )
          else
            SizedBox(
              height: 240,
              child: Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: PieChart(
                      PieChartData(
                        sectionsSpace: 2,
                        centerSpaceRadius: 45,
                        sections: categories.entries.map((e) {
                          final total = categories.values.fold(0.0, (s, v) => s + v);
                          final pct = (e.value / total * 100);
                          return PieChartSectionData(
                            color: colors[e.key] ?? const Color(0xFF888888),
                            value: e.value,
                            title: '${pct.toStringAsFixed(0)}%',
                            titleStyle: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                            radius: 55,
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    flex: 2,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: categories.entries.map((e) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            children: [
                              Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  color: colors[e.key] ?? const Color(0xFF888888),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  _catLabel(e.key),
                                  style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTrendChart() {
    final transactions = storage.getTransactions();

    // Last 6 months
    final now = DateTime.now();
    final months = <Map<String, dynamic>>[];
    for (int i = 5; i >= 0; i--) {
      final d = DateTime(now.year, now.month - i, 1);
      final monthTx = transactions.where((t) {
        final td = DateTime.tryParse(t.date);
        return td != null && td.year == d.year && td.month == d.month;
      });

      double income = 0;
      double expense = 0;
      for (final t in monthTx) {
        if (t.type == 'income') income += t.amount;
        if (t.type == 'expense') expense += t.amount;
      }

      final monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
      months.add({'label': monthNames[d.month - 1], 'income': income, 'expense': expense});
    }

    final maxVal = months.fold(0.0, (max, m) {
      final v = (m['income'] as double) > (m['expense'] as double) ? m['income'] as double : m['expense'] as double;
      return v > max ? v : max;
    });

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('📈 Trend Bulanan', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              _legendDot(AppTheme.success, 'Cuan Masuk'),
              const SizedBox(width: 14),
              _legendDot(AppTheme.danger, 'Duit Keluar'),
            ],
          ),
          const SizedBox(height: 16),
          if (transactions.isEmpty)
            Center(
              child: Column(
                children: [
                  const SizedBox(height: 20),
                  Text('💪', style: const TextStyle(fontSize: 40)),
                  const SizedBox(height: 8),
                  Text('Belum ada data transaksi', style: GoogleFonts.poppins(color: AppTheme.textMuted)),
                  const SizedBox(height: 20),
                ],
              ),
            )
          else
            SizedBox(
              height: 220,
              child: BarChart(
                BarChartData(
                  maxY: maxVal * 1.2,
                  barTouchData: BarTouchData(
                    touchTooltipData: BarTouchTooltipData(
                      getTooltipItem: (group, groupIndex, rod, rodIndex) {
                        final label = rodIndex == 0 ? 'Cuan' : 'Keluar';
                        return BarTooltipItem(
                          '$label\n${AppHelpers.formatCompactCurrency(rod.toY)}',
                          GoogleFonts.poppins(color: Colors.white, fontSize: 11),
                        );
                      },
                    ),
                  ),
                  titlesData: FlTitlesData(
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 45,
                        getTitlesWidget: (v, meta) => Text(
                          AppHelpers.formatCompactCurrency(v),
                          style: GoogleFonts.poppins(fontSize: 10, color: AppTheme.textMuted),
                        ),
                      ),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (v, meta) {
                          final idx = v.toInt();
                          if (idx < 0 || idx >= months.length) return const SizedBox();
                          return Padding(
                            padding: const EdgeInsets.only(top: 6),
                            child: Text(
                              months[idx]['label'] as String,
                              style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary, fontWeight: FontWeight.w500),
                            ),
                          );
                        },
                      ),
                    ),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  ),
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: false,
                    getDrawingHorizontalLine: (v) => FlLine(
                      color: Colors.white.withOpacity(0.05),
                      strokeWidth: 1,
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  barGroups: List.generate(months.length, (i) {
                    final income = months[i]['income'] as double;
                    final expense = months[i]['expense'] as double;
                    return BarChartGroupData(
                      x: i,
                      barRods: [
                        BarChartRodData(
                          toY: income,
                          color: AppTheme.success.withOpacity(0.7),
                          width: 14,
                          borderRadius: BorderRadius.circular(6),
                          borderSide: const BorderSide(color: AppTheme.success, width: 1.5),
                        ),
                        BarChartRodData(
                          toY: expense,
                          color: AppTheme.danger.withOpacity(0.7),
                          width: 14,
                          borderRadius: BorderRadius.circular(6),
                          borderSide: const BorderSide(color: AppTheme.danger, width: 1.5),
                        ),
                      ],
                    );
                  }),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _legendDot(Color color, String label) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: GoogleFonts.poppins(fontSize: 11, color: AppTheme.textSecondary)),
      ],
    );
  }

  String _catLabel(String cat) {
    switch (cat) {
      case 'kost': return '🏠 Kost';
      case 'kebutuhan': return '🛒 Kebutuhan';
      case 'harian': return '☕ Harian';
      case 'ortu': return '👨‍👩‍👧 Ortu';
      case 'zakat': return '🕌 Zakat';
      case 'custom': return '🏷️ Custom';
      case 'budget': return '📊 Budget';
      default: return '📦 Lainnya';
    }
  }
}
