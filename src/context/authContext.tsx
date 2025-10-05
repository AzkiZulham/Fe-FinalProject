"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

type User = {
  id: string;
  role: "USER" | "TENANT";
  verified: boolean;
  email: string; // tambahkan email
};

type DecodedToken = {
  id: string;
  role: "USER" | "TENANT";
  email: string;
  verified?: boolean;
  exp?: number;
};

type AuthContextType = {
  user: User | null;
  login: (user: User, token?: string) => void;
  logout: () => void;
  initialized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  // Load user dari token di localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        const now = Date.now() / 1000;
        if (!decoded.exp || decoded.exp > now) {
          setUser({
            id: decoded.id,
            role: decoded.role,
            verified: decoded.verified ?? true,
            email: decoded.email,
          });
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setInitialized(true);
  }, []);

  const login = (newUser: User, token?: string) => {
    setUser(newUser);
    if (token) localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");  
    localStorage.removeItem("verifyToken"); 

    console.log("After logout", localStorage);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, initialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
