import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme_manager.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeManager = Provider.of<ThemeManager>(context);

    return Scaffold(
      appBar: AppBar(title: const Text("Тохиргоо")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            SwitchListTile(
              title: const Text("Dark Mode"),
              value: themeManager.isDarkMode,
              onChanged: (val) => themeManager.toggleTheme(),
              secondary: const Icon(Icons.brightness_6),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.info_outline),
              title: const Text("Апп-ын тухай"),
              subtitle: const Text("DataNews v1.0"),
            ),
          ],
        ),
      ),
    );
  }
}