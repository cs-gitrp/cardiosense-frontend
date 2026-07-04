"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getMe, clearToken, getToken, login as apiLogin, register as apiRegister } from "./api";

interface User { id: string; email: string; full_name: string | null; }
interface AuthCtx {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  logout: () => {},
  refresh: async () => {},
  login: async () => {},
  register: async () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!getToken()) { setUser(null); setLoading(false); return; }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await apiLogin(email, password);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      await apiRegister(email, password, fullName);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => { clearToken(); setUser(null); };

  useEffect(() => { refresh(); }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refresh, login, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
