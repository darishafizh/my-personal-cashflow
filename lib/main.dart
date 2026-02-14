import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'theme/app_theme.dart';
import 'services/storage_service.dart';
import 'screens/home_screen.dart';
import 'screens/charts_screen.dart';
import 'screens/wallet_screen.dart';
import 'screens/budget_screen.dart';
import 'screens/add_transaction_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('id_ID', null);

  // Set system UI overlay style for dark theme
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: AppTheme.bgSecondary,
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  final storage = StorageService();
  await storage.init();

  runApp(CashFlowApp(storage: storage));
}

class CashFlowApp extends StatelessWidget {
  final StorageService storage;

  const CashFlowApp({super.key, required this.storage});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CashFlow Tracker',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: MainShell(storage: storage),
    );
  }
}

class MainShell extends StatefulWidget {
  final StorageService storage;

  const MainShell({super.key, required this.storage});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final _homeKey = GlobalKey<State>();
  final _chartsKey = GlobalKey();
  final _walletKey = GlobalKey<State>();
  final _budgetKey = GlobalKey<State>();

  void _refresh() => setState(() {});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(gradient: AppTheme.backgroundGradient),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: IndexedStack(
            index: _currentIndex,
            children: [
              HomeScreen(key: _homeKey, storage: widget.storage, onRefresh: _refresh),
              ChartsScreen(key: _chartsKey, storage: widget.storage),
              WalletScreen(key: _walletKey, storage: widget.storage, onRefresh: _refresh),
              BudgetScreen(key: _budgetKey, storage: widget.storage, onRefresh: _refresh),
            ],
          ),
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => AddTransactionScreen(
                storage: widget.storage,
                onSaved: _refresh,
              ),
            ),
          ),
          child: const Icon(Icons.add, size: 28),
        ),
        floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
        bottomNavigationBar: Container(
          decoration: BoxDecoration(
            color: AppTheme.bgSecondary,
            border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1))),
          ),
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (i) => setState(() => _currentIndex = i),
            items: const [
              BottomNavigationBarItem(icon: Text('🏠', style: TextStyle(fontSize: 22)), label: 'Home'),
              BottomNavigationBarItem(icon: Text('📊', style: TextStyle(fontSize: 22)), label: 'Charts'),
              BottomNavigationBarItem(icon: Text('💳', style: TextStyle(fontSize: 22)), label: 'Wallets'),
              BottomNavigationBarItem(icon: Text('📋', style: TextStyle(fontSize: 22)), label: 'Budget'),
            ],
          ),
        ),
      ),
    );
  }
}
