import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Futuristic dark colors matching web CSS
  static const Color bgPrimary = Color(0xFF0A0A1A);
  static const Color bgSecondary = Color(0xFF12122A);
  static const Color bgCard = Color(0xB31A1A2E); // rgba(26,26,46,0.7)
  static const Color bgCardHover = Color(0xCC242442);

  static const Color primary = Color(0xFF00F5D4);
  static const Color primaryGlow = Color(0x4D00F5D4);
  static const Color secondary = Color(0xFF9B5DE5);
  static const Color secondaryGlow = Color(0x4D9B5DE5);
  static const Color accent = Color(0xFFF15BB5);

  static const Color success = Color(0xFF00FF87);
  static const Color successGlow = Color(0x4D00FF87);
  static const Color danger = Color(0xFFFF6B6B);
  static const Color dangerGlow = Color(0x4DFF6B6B);
  static const Color warning = Color(0xFFFFD93D);

  static const Color textPrimary = Colors.white;
  static const Color textSecondary = Color(0xB3FFFFFF);
  static const Color textMuted = Color(0x80FFFFFF);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgPrimary,
      primaryColor: primary,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: secondary,
        tertiary: accent,
        surface: bgSecondary,
        error: danger,
      ),
      textTheme: GoogleFonts.poppinsTextTheme(ThemeData.dark().textTheme),
      fontFamily: GoogleFonts.poppins().fontFamily,
      appBarTheme: AppBarTheme(
        backgroundColor: bgPrimary,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: textPrimary,
        ),
        iconTheme: const IconThemeData(color: textPrimary),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: bgSecondary,
        selectedItemColor: primary,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600),
        unselectedLabelStyle: GoogleFonts.poppins(fontSize: 11),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: primary,
        foregroundColor: bgPrimary,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withOpacity(0.05),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.15)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.15)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primary, width: 2),
        ),
        labelStyle: GoogleFonts.poppins(color: textSecondary),
        hintStyle: GoogleFonts.poppins(color: textMuted),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: bgPrimary,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),
      cardTheme: CardTheme(
        color: bgCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: Colors.white.withOpacity(0.1)),
        ),
      ),
      dialogTheme: DialogTheme(
        backgroundColor: bgSecondary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: bgCard,
        contentTextStyle: GoogleFonts.poppins(color: textPrimary),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  // Gradient decorations
  static BoxDecoration get glassmorphicDecoration => BoxDecoration(
    color: bgCard,
    borderRadius: BorderRadius.circular(20),
    border: Border.all(color: Colors.white.withOpacity(0.1)),
  );

  static BoxDecoration incomeCardDecoration({bool glow = false}) => BoxDecoration(
    color: bgCard,
    borderRadius: BorderRadius.circular(20),
    border: Border.all(color: Colors.white.withOpacity(0.1)),
    boxShadow: glow ? [BoxShadow(color: successGlow, blurRadius: 20)] : null,
  );

  static BoxDecoration expenseCardDecoration({bool glow = false}) => BoxDecoration(
    color: bgCard,
    borderRadius: BorderRadius.circular(20),
    border: Border.all(color: Colors.white.withOpacity(0.1)),
    boxShadow: glow ? [BoxShadow(color: dangerGlow, blurRadius: 20)] : null,
  );

  static LinearGradient get primaryGradient =>
      const LinearGradient(colors: [primary, secondary]);

  static LinearGradient get successGradient =>
      const LinearGradient(colors: [success, Color(0xFF00CC6A)]);

  static LinearGradient get dangerGradient =>
      const LinearGradient(colors: [danger, Color(0xFFFF4757)]);

  static LinearGradient get backgroundGradient => const LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [bgPrimary, bgSecondary, Color(0xFF1A0A2A)],
  );
}
