import { createContext, useState, useEffect, ReactNode } from "react";
import api from "../api/api";
import endpoints from "../api/endpoints";

interface AuthContextType {
  user: string | null;
  login: (email: string, password: string) => Promise<{ access: string; refresh: string; user: any }>; 
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  login: async () => ({ access: '', refresh: '', user: null }), 
  logout: () => {},
  isLoading: false
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(localStorage.getItem("user") || null);
  const [isLoading, setIsLoading] = useState(false);

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
        if (!refreshed) window.location.href = "/login";
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Hacer login y obtener datos del usuario en una sola operación
      const loginResponse = await api.post(endpoints.auth.login, { email, password });
      
      // Guardar tokens
      localStorage.setItem("access", loginResponse.data.access);
      localStorage.setItem("refresh", loginResponse.data.refresh);
      localStorage.setItem("user", email);

      // Obtener datos del usuario
      const userResponse = await api.get(endpoints.auth.me, {
        headers: { Authorization: `Bearer ${loginResponse.data.access}` }
      });

      setUser(email);
      
      return {
        access: loginResponse.data.access,
        refresh: loginResponse.data.refresh,
        user: userResponse.data
      };
    } catch (error) {
      // Propagar el error para que Login.tsx pueda manejarlo
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };