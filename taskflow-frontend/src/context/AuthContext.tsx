import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, signupUser, getProfile, logoutUser } from "../utils/api";

type User = { id: string; name: string; email: string } | null;

interface AuthContextType {
  user: User;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("tf_token")
  );

  // Auto-fetch profile if token exists
  useEffect(() => {
    if (token) {
      getProfile()
        .then((res) => setUser(res.user))
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("tf_token");
        });
    }
  }, [token]);

  async function login(email: string, password: string) {
    const res = await loginUser(email, password);
    setUser(res.user);
    setToken(res.accessToken);
    localStorage.setItem("tf_token", res.accessToken);
  }

  async function signup(name: string, email: string, password: string) {
    const res = await signupUser(name, email, password);
    setUser(res.user);
    setToken(res.accessToken);
    localStorage.setItem("tf_token", res.accessToken);
  }

  function logout() {
    logoutUser();
    setUser(null);
    setToken(null);
    localStorage.removeItem("tf_token");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
