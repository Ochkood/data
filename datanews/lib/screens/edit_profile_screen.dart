import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../services/auth_service.dart';

class EditProfileScreen extends StatefulWidget {
  final Map<String, dynamic> user;

  const EditProfileScreen({super.key, required this.user});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _professionController;
  late TextEditingController _experienceController;
  late TextEditingController _phoneController;
  late TextEditingController _websiteController;
  late TextEditingController _addressController;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    final user = widget.user;
    _professionController =
        TextEditingController(text: user['profession'] ?? '');
    _experienceController =
        TextEditingController(text: user['experience'] ?? '');
    _phoneController =
        TextEditingController(text: user['contact']?['phone']?.toString() ?? '');
    _websiteController =
        TextEditingController(text: user['contact']?['website'] ?? '');
    _addressController =
        TextEditingController(text: user['contact']?['address'] ?? '');
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return;

    final url = Uri.parse('${AuthService().baseUrl}/users/me');
    final body = {
      'profession': _professionController.text,
      'experience': _experienceController.text,
      'contact': {
        'phone': _phoneController.text,
        'website': _websiteController.text,
        'address': _addressController.text,
      }
    };

    final res = await http.put(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );

    setState(() => _loading = false);

    if (res.statusCode == 200) {
      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Профайл амжилттай шинэчлэгдлээ ✅')),
        );
      }
    } else {
      print('❌ Update failed: ${res.body}');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Шинэчлэх үед алдаа гарлаа ❌')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Профайл засах")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _professionController,
                decoration: const InputDecoration(labelText: "Мэргэжил"),
              ),
              TextFormField(
                controller: _experienceController,
                decoration: const InputDecoration(labelText: "Туршлага"),
              ),
              const SizedBox(height: 10),
              const Divider(),
              const Text("Холбоо барих мэдээлэл",
                  style: TextStyle(fontWeight: FontWeight.bold)),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(labelText: "Утас"),
              ),
              TextFormField(
                controller: _websiteController,
                decoration: const InputDecoration(labelText: "Вебсайт"),
              ),
              TextFormField(
                controller: _addressController,
                decoration: const InputDecoration(labelText: "Хаяг"),
              ),
              const SizedBox(height: 30),
              ElevatedButton.icon(
                onPressed: _loading ? null : _saveProfile,
                icon: const Icon(Icons.save),
                label: Text(_loading ? "Хадгалж байна..." : "Хадгалах"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 50),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}