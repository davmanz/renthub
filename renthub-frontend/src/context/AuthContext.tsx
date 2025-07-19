import { createContext, useState, useEffect, ReactNode } from "react";
import api from "../api/api";
import endpoints from "../api/endpoints";
import { UserInterface } from "../types/types";

interface AuthContextType {
  user: UserInterface | null;
  login: (email: string, password: string) => Promise<{ access: string; refresh: string; user: UserInterface }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ access: '', refresh: '', user: {} as UserInterface }),
  logout: () => {},
  isLoading: true, // Iniciar como true para esperar la verificación inicial
  isAuthenticated: false
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Iniciar en true
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        clearAuthData();
        setIsLoading(false);
        return;
      }

      try {
        const { data: userData } = await api.get(endpoints.auth.me, {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        const refreshed = await refreshToken();
        if (refreshed) {
          // Si el token se refrescó, re-intentamos obtener el usuario
          try {
            const { data: userData } = await api.get(endpoints.auth.me); // El interceptor ya tiene el nuevo token
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
            setIsAuthenticated(true);
          } catch (e) {
            clearAuthData();
          }
        } else {
          clearAuthData();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (!refresh) return false;

      const response = await api.post(endpoints.auth.refresh, { refresh });
      localStorage.setItem("access", response.data.access);
      return true;
    } catch (error) {
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loginResponse = await api.post(endpoints.auth.login, { email, password });
      
      localStorage.setItem("access", loginResponse.data.access);
      localStorage.setItem("refresh", loginResponse.data.refresh);

      const userResponse = await api.get(endpoints.auth.me, {
        headers: { Authorization: `Bearer ${loginResponse.data.access}` }
      });
      
      localStorage.setItem("user", JSON.stringify(userResponse.data));
      setUser(userResponse.data);
      setIsAuthenticated(true);
      
      return {
        access: loginResponse.data.access,
        refresh: loginResponse.data.refresh,
        user: userResponse.data
      };
    } catch (error) {
      clearAuthData(); // Limpiar en caso de error de login
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };