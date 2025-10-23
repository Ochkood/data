import 'package:datanews/screens/settings_screen.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../services/auth_service.dart';
import 'edit_profile_screen.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? user;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final auth = AuthService();
    final data = await auth.getProfile();
    setState(() => user = data);
  }

  Future<void> _logout() async {
    final auth = AuthService();
    await auth.logout();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  Future<void> _pickAndUploadImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);

    if (picked == null) return;

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return;

    final request = http.MultipartRequest(
      'POST',
      Uri.parse('${AuthService().baseUrl}/users/upload'),
    );
    request.files.add(await http.MultipartFile.fromPath('image', picked.path));
    request.headers['Authorization'] = 'Bearer $token';

    final res = await request.send();

    if (res.statusCode == 200) {
      final responseBody = await res.stream.bytesToString();
      print("✅ Upload success: $responseBody");
      _loadProfile(); // зураг шинэчлэгдэх
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Профайл зураг шинэчлэгдлээ ✅')),
        );
      }
    } else {
      print("❌ Upload failed: ${res.statusCode}");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Зураг upload амжилтгүй ❌')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = user?['user'];

    return Scaffold(
      appBar: AppBar(
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.white),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsScreen()),
              );
            },
          ),
          IconButton(onPressed: _logout, icon: const Icon(Icons.logout, color: Colors.white)),
          IconButton(
            icon: const Icon(Icons.edit, color: Colors.white),
            onPressed: () async {
              final updated = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => EditProfileScreen(user: user!['user']),
                ),
              );
              if (updated == true) {
                _loadProfile(); // Шинэчилсэн мэдээллээ дахин ачаална
              }
            },
          ),
        ],
      ),
      body: user == null
          ? const Center(child: CircularProgressIndicator())
          : Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF4FC3F7), Color(0xFF0288D1)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // 🔹 Logout icon + Title
              Padding(
                padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Миний профайл',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.logout, color: Colors.white),
                      onPressed: _logout,
                    )
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 🔹 Avatar with edit button
              Stack(
                alignment: Alignment.bottomRight,
                children: [
                  CircleAvatar(
                    radius: 55,
                    backgroundColor: Colors.white.withOpacity(0.3),
                    child: CircleAvatar(
                      radius: 50,
                      backgroundImage: NetworkImage(
                        profile?['profileImage'] ??
                            'https://via.placeholder.com/150',
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 4,
                    right: 4,
                    child: GestureDetector(
                      onTap: _pickAndUploadImage,
                      child: Container(
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                        padding: const EdgeInsets.all(6),
                        child: const Icon(Icons.camera_alt, color: Colors.teal, size: 20),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 15),

              // 🔹 Нэр
              Text(
                '${profile?['firstName'] ?? ''} ${profile?['lastName'] ?? ''}',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),

              Text(
                profile?['profession'] ?? '',
                style: const TextStyle(color: Colors.white70),
              ),

              const SizedBox(height: 25),

              // 🔹 Info Card
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(25),
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _infoTile(Icons.email, 'Имэйл',
                              profile?['email'] ?? '-'),
                          _infoTile(Icons.person, 'Хэрэглэгчийн нэр',
                              profile?['username'] ?? '-'),
                          _infoTile(Icons.phone, 'Утас',
                              profile?['contact']?['phone'] ?? '-'),
                          _infoTile(Icons.language, 'Вебсайт',
                              profile?['contact']?['website'] ?? '-'),
                          _infoTile(Icons.location_on, 'Хаяг',
                              profile?['contact']?['address'] ?? '-'),
                          const SizedBox(height: 20),
                          Center(
                            child: Text(
                              '🧑‍💻 Experience: ${profile?['experience'] ?? '-'}',
                              style: const TextStyle(
                                fontWeight: FontWeight.w500,
                                color: Colors.black87,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoTile(IconData icon, String title, String value) {
    return Card(
      elevation: 3,
      margin: const EdgeInsets.symmetric(vertical: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, color: Colors.teal),
        title: Text(title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(value, style: const TextStyle(fontSize: 14)),
      ),
    );
  }
}