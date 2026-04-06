/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User, UserRole } from "../types";
import { loginUser, registerUser } from "../api/auth";
import toast from "react-hot-toast";

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

  const saveSession = (nextUser: User, nextToken: string) => {
    localStorage.setItem("session", JSON.stringify({ user: nextUser, token: nextToken }));
    setUser(nextUser);
    setToken(nextToken);
  };

  const login = async (email: string, password: string): Promise<"ADMIN" | "USER"> => {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await loginUser({ email: normalizedEmail, password });

    if (!response.token) {
      throw new Error("No token received");
    }

    saveSession(response.user, response.token);
    toast.success(response.user.role === "ADMIN" ? "Welcome back, Admin!" : "Welcome back!");

    return response.user.role === "ADMIN" ? "ADMIN" : "USER";
  };

  const register = async (_name: string, email: string, password: string): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    await registerUser({ email: normalizedEmail, password });

    const loginResponse = await loginUser({ email: normalizedEmail, password });
    if (!loginResponse.token) {
      throw new Error("Registration succeeded but login failed");
    }

    saveSession(loginResponse.user, loginResponse.token);
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
