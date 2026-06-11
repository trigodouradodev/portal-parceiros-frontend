import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { authService, type LoginRequest } from '@/services/authService';
import { AuthContext, type User } from '@/contexts/auth-context';
import {
  AUTH_LOGOUT_EVENT,
  AUTH_TOKEN_REFRESHED_EVENT,
  type AuthTokenRefreshedDetail,
} from '@/lib/api/auth-events';

const readStoredUser = (): User | null => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem('access_token'),
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    localStorage.getItem('refresh_token'),
  );
  const [loading, setLoading] = useState(true);

  const authenticated = !!user && !!accessToken;

  const login = async (data: LoginRequest) => {
    try {
      const response = await authService.login(data);

      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(response.user);

      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }, []);

  // Valida a sessão na inicialização: confirma o token via /auth/me.
  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      if (!localStorage.getItem('access_token')) {
        if (active) setLoading(false);
        return;
      }

      try {
        const profile = await authService.getProfile();
        if (!active) return;
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (error) {
        // Se o token (e o refresh) forem inválidos, encerra a sessão.
        console.error('Session validation error:', error);
        if (active) logout();
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [logout]);

  // Mantém o estado do contexto sincronizado com o interceptor do axios.
  useEffect(() => {
    const handleTokenRefreshed = (event: Event) => {
      const { accessToken: newAccess, refreshToken: newRefresh } = (
        event as CustomEvent<AuthTokenRefreshedDetail>
      ).detail;
      setAccessToken(newAccess);
      setRefreshToken(newRefresh);
    };

    window.addEventListener(AUTH_TOKEN_REFRESHED_EVENT, handleTokenRefreshed);
    window.addEventListener(AUTH_LOGOUT_EVENT, logout);

    return () => {
      window.removeEventListener(AUTH_TOKEN_REFRESHED_EVENT, handleTokenRefreshed);
      window.removeEventListener(AUTH_LOGOUT_EVENT, logout);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        loading,
        authenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
