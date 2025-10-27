"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";

type User = {
  id: string;
  role: "USER" | "TENANT";
  verified: boolean;
  email: string;
  username?: string;
  avatar?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
};

type DecodedToken = {
  id: string;
  role: "USER" | "TENANT";
  username?: string;
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setInitialized(true);
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const now = Date.now() / 1000;

      if (!decoded.exp || decoded.exp > now) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(async (res) => {
            if (!res.ok) throw new Error("Failed to fetch user");
            const data = await res.json();
            const u = data.user;

            setUser({
              id: u.id || decoded.id,
              role: u.role || decoded.role,
              verified:
                u.verified || u.isEmailVerified || u.emailVerified || false,
              email: u.email || decoded.email,
              username: u.userName || decoded.username || "",
              avatar: u.avatar || u.profileImg || "/default-avatar.png",
              phoneNumber: u.phoneNumber || "",
              birthDate: u.birthDate || "",
              gender: u.gender || "",
            });
          })
          .catch((err) => {
            console.error("Error fetching user:", err);

            setUser({
              id: decoded.id,
              role: decoded.role,
              verified: decoded.verified === true,
              email: decoded.email,
              username: decoded.username || "",
            });
          })
          .finally(() => setInitialized(true));
      } else {
        localStorage.removeItem("token");
        setUser(null);
        setInitialized(true);
      }
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      setUser(null);
      setInitialized(true);
    }
  }, []);

  const login = (newUser: User, token?: string) => {
    setUser(newUser);
    if (token) localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("verifyToken");
    toast.success("Berhasil logout!");

    setTimeout(() => {
      window.location.reload();
      router.push("/");
    }, 1500);
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
