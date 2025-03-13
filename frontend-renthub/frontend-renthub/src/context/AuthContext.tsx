import { createContext, useState, useEffect, ReactNode } from "react";
import api from "../api/api";
import endpoints from "../api/endpoints";

interface AuthContextType {
  user: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, login: async () => false, logout: () => {} });

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(localStorage.getItem("user") || null);

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (!refresh) return false;

      const response = await api.post(endpoints.auth.refresh, { refresh });
      localStorage.setItem("access", response.data.access);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;

      try {
        await api.get(endpoints.auth.me, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        const refreshed = await refreshToken();
        if (!refreshed) window.location.href = "/login"; // Redirección segura
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post(endpoints.auth.login, { email, password });

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      localStorage.setItem("user", email);

      setUser(email);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login"; // Redirección manual sin useNavigate()
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
