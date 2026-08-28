import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getCurrentUser,
  loginUser as loginApi,
  logoutUser as logoutApi,
  type AuthUser,
  type LoginData,
} from '../services/auth.service';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();

        setUser(response.data);
      } catch {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const login = useCallback(async (data: LoginData) => {
    const response = await loginApi(data);

    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, isLoading, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};