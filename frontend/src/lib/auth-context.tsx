"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";
import type { AuthResponse, User } from "./types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (companyName: string, email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Restore session from localStorage on page load/refresh
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  function saveSession(data: AuthResponse) {
    localStorage.setItem("token", data.token);
    const userData: User = { email: data.email, role: data.role, companyName: data.companyName };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  async function login(email: string, password: string) {
    const data = await api.post<AuthResponse>("/Auth/login", { email, password });
    saveSession(data);
    router.push("/dashboard");
  }

  async function register(companyName: string, email: string, password: string, fullName: string) {
    const data = await api.post<AuthResponse>("/Auth/register", {
      companyName,
      email,
      password,
      fullName,
    });
    saveSession(data);
    router.push("/dashboard");
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}