import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:io';

String getBaseUrl() {
  if (Platform.isAndroid) {
    return "http://10.0.2.2:4000/api";
  } else {
    return "http://127.0.0.1:4000/api";
  }
}

class AuthService {
  final String baseUrl = getBaseUrl();

  Future<bool> login(String email, String password) async {
    try {
      final url = Uri.parse('$baseUrl/auth/login');
      final res = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final token = data['token'];

        // SharedPreferences-д хадгалах
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);

        print('✅ Token хадгалагдлаа: $token');
        return true;
      } else {
        print('❌ Login error: ${res.body}');
        return false;
      }
    } catch (e) {
      print('⚠️ Login exception: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>?> getProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return null;

    final url = Uri.parse('$baseUrl/users/me');
    final res = await http.get(
      url,
      headers: {'Authorization': 'Bearer $token'},
    );

    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    } else {
      print('⚠️ Profile fetch failed: ${res.body}');
      return null;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }


  Future<bool> register(String fullname, String email, String username, String password) async {
    try {
      final url = Uri.parse('$baseUrl/auth/register');
      final res = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'fullname': fullname,
          'email': email,
          'username': username,
          'password': password,
        }),
      );

      if (res.statusCode == 201 || res.statusCode == 200) {
        print('✅ Бүртгэл амжилттай: ${res.body}');
        return true;
      } else {
        print('❌ Бүртгэлд алдаа: ${res.body}');
        return false;
      }
    } catch (e) {
      print('⚠️ Register exception: $e');
      return false;
    }
  }


}
