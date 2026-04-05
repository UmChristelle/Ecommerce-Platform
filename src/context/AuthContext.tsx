import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, UserRole } from "../types";
import { loginUser, registerUser } from "../api/auth";
import toast from "react-hot-toast";

const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "admin123";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<"ADMIN" | "USER">;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const session = localStorage.getItem("session");
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed?.user && parsed?.token) {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      }
    } catch {
      localStorage.removeItem("session");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = (user: User, token: string) => {
    const session = { user, token };
    localStorage.setItem("session", JSON.stringify(session));
    setUser(user);
    setToken(token);
  };

  const login = async (email: string, password: string): Promise<"ADMIN" | "USER"> => {
    
    if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        id: "admin-001",
        name: "Administrator",
        email: ADMIN_EMAIL,
        role: "ADMIN",
      };
      saveSession(adminUser, "admin-static-token");
      toast.success("Welcome back, Admin!");
      return "ADMIN";
    }

    // ── Regular user via API ─────────────────────────────
    const res = await loginUser({ email, password });
    
    if (!res.token) throw new Error("No token received");

    const loggedUser: User = {
      id: res.user?.id ?? crypto.randomUUID(),
      name: res.user?.email?.split("@")[0] ?? "User",
      email: res.user?.email ?? email,
      role: "USER",
    };

    saveSession(loggedUser, res.token);
    toast.success("Welcome back!");
    return "USER";
  };

  const register = async (_name: string, email: string, password: string): Promise<void> => {
    const res = await registerUser({ email, password });

    if (!res.token) throw new Error("Registration failed — no token");

    const newUser: User = {
      id: res.user?.id ?? crypto.randomUUID(),
      name: email.split("@")[0],
      email: res.user?.email ?? email,
      role: "USER",
    };

    saveSession(newUser, res.token);
    toast.success("Account created successfully!");
  };

  const logout = () => {
    localStorage.removeItem("session");
    setUser(null);
    setToken(null);
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        userRole: user?.role ?? null,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};