"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/User";

// 🧠 Context Interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;  
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// 🧩 Context Instance
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 1. App ачаалахад localStorage-д токен байгаа эсэхийг шалгах
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

// 🔹 2. Хэрэглэгчийн мэдээлэл татах (followers, following, contact гэх мэт)
const fetchUser = async (jwt: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    const data = await res.json();

    if (res.ok && data.user) {
      const u = data.user;

      setUser({
        _id: u._id,
        fullName: u.fullName || "", // ✅ шинэчилсэн талбар
        username: u.username,
        email: u.email,
        bio: u.bio || "",
        profession: u.profession || "",
        experience: u.experience || "",
        contact: {
          phone: u.contact?.phone || "",
          website: u.contact?.website || "",
          address: u.contact?.address || "",
          facebook: u.contact?.facebook || "",
          twitter: u.contact?.twitter || "",
          linkedin: u.contact?.linkedin || "",
        },
        profileImage: u.profileImage || "",
        followers: u.followers || [],
        following: u.following || [],
        role: u.role || "user",
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      });
    } else {
      console.warn("⚠️ No user data returned from /api/users/me");
    }
  } catch (err) {
    console.error("❌ Failed to fetch user:", err);
  }
};

  // 🔹 3. Login хийх
  const login = (jwt: string) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);
    fetchUser(jwt);
  };

  // 🔹 4. Logout хийх
  const logout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; Max-Age=0; path=/;";
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  // 🔹 5. Refresh — profile өөрчлөгдсөн үед дахин татах
  const refreshUser = async () => {
    if (token) await fetchUser(token);
  };

  // 🟢 Context Provider
  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
      loading, // ⬅ нэмэв
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🧩 Custom Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};