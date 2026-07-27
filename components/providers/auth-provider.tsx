"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  const refresh = React.useCallback(async () => {
    try {
      const { user } = await auth.currentUser();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = React.useCallback(async () => {
    try {
      await auth.logout();
    } catch {
      /* ignore — clear locally regardless */
    }
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
