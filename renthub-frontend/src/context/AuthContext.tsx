import { createContext, useState, useEffect, ReactNode } from "react";
import api from "../api/api";
import endpoints from "../api/endpoints";

interface AuthContextType {
  user: string | null;
  login: (email: string, password: string) => Promise<{ access: string; refresh: string; user: any }>; 
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  login: async () => ({ access: '', refresh: '', user: null }), 
  logout: () => {},
  isLoading: false,
  isAuthenticated: false
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(localStorage.getItem("user") || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (!refresh) return false;

      const response = await api.post(endpoints.auth.refresh, { refresh });
      localStorage.setItem("access", response.data.access);
      return true;
    } catch (error) {
      clearAuthData();
      return false;
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        await api.get(endpoints.auth.me, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAuthenticated(true);
      } catch (error) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {

      console.log(endpoints.auth.login);
      const loginResponse = await api.post(endpoints.auth.login, { email, password });
      
      localStorage.setItem("access", loginResponse.data.access);
      localStorage.setItem("refresh", loginResponse.data.refresh);
      localStorage.setItem("user", email);

      const userResponse = await api.get(endpoints.auth.me, {
        headers: { Authorization: `Bearer ${loginResponse.data.access}` }
      });

      setUser(email);
      setIsAuthenticated(true);
      
      return {
        access: loginResponse.data.access,
        refresh: loginResponse.data.refresh,
        user: userResponse.data
      };
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };