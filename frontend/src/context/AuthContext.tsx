import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/authApi';
import type { RegisterRequest } from '../api/authApi';
import { TOKEN_KEY, USER_KEY } from '../api/client';
import type { AuthResponse, AuthUser, Role } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasRole: (...roles: Role[]) => boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterRequest) => Promise<AuthUser>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function saveSession(resp: AuthResponse): AuthUser {
  localStorage.setItem(TOKEN_KEY, resp.token);
  localStorage.setItem(USER_KEY, JSON.stringify(resp.user));
  return resp.user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);

  const login = useCallback(async (email: string, password: string) => {
    const resp = await authApi.login(email, password);
    const u = saveSession(resp);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const resp = await authApi.register(data);
    const u = saveSession(resp);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((u: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => !!user && roles.includes(user.role),
    [user],
  );

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, hasRole, login, register, logout, updateUser }),
    [user, hasRole, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return ctx;
}
