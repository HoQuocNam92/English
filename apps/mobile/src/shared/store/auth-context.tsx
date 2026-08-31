import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../api/api-client';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  roles: string[];
  permissions: string[];
  avatarUrl?: string;
  bio?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithTokens: (data: { accessToken: string; refreshToken?: string; user: any }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, accessToken: null, isLoggedIn: false, isLoading: true
  });

  useEffect(() => {
    // Restore session
    (async () => {
      const [token, userRaw] = await Promise.all([
        AsyncStorage.getItem('access_token'),
        AsyncStorage.getItem('user'),
      ]);
      if (token && userRaw) {
        try {
          const user = JSON.parse(userRaw) as User;
          setState({ user, accessToken: token, isLoggedIn: true, isLoading: false });
        } catch {
          setState(s => ({ ...s, isLoading: false }));
        }
      } else {
        setState(s => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api/v1';
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as any;
      throw new Error(body?.message ?? 'Email hoặc mật khẩu không đúng');
    }
    const data = await res.json() as any;
    const user: User = {
      id: data.user.id,
      email: data.user.email,
      displayName: data.user.displayName ?? data.user.email.split('@')[0],
      role: data.user.roles?.[0] ?? 'learner',
      roles: data.user.roles ?? ['learner'],
      permissions: data.user.permissions ?? [],
    };
    await Promise.all([
      AsyncStorage.setItem('access_token', data.accessToken),
      AsyncStorage.setItem('refresh_token', data.refreshToken ?? ''),
      AsyncStorage.setItem('user', JSON.stringify(user)),
    ]);
    setState({ user, accessToken: data.accessToken, isLoggedIn: true, isLoading: false });
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem('access_token'),
      AsyncStorage.removeItem('refresh_token'),
      AsyncStorage.removeItem('user'),
    ]);
    setState({ user: null, accessToken: null, isLoggedIn: false, isLoading: false });
  };

  const updateUser = (updates: Partial<User>) => {
    setState(s => s.user ? { ...s, user: { ...s.user, ...updates } } : s);
  };

  const loginWithTokens = async (data: { accessToken: string; refreshToken?: string; user: any }) => {
    const user: User = {
      id: data.user.id,
      email: data.user.email,
      displayName: data.user.displayName ?? data.user.email.split('@')[0],
      role: data.user.roles?.[0] ?? 'learner',
      roles: data.user.roles ?? ['learner'],
      permissions: data.user.permissions ?? [],
    };
    await Promise.all([
      AsyncStorage.setItem('access_token', data.accessToken),
      AsyncStorage.setItem('refresh_token', data.refreshToken ?? ''),
      AsyncStorage.setItem('user', JSON.stringify(user)),
    ]);
    setState({ user, accessToken: data.accessToken, isLoggedIn: true, isLoading: false });
  };

  const fetchUser = async () => {
    try {
      const data: any = await apiRequest('/auth/me');
      if (data) {
        setState(s => {
          if (!s.user) return s;
          const updatedUser: User = {
            ...s.user,
            displayName: data.displayName ?? s.user.displayName,
            avatarUrl: data.avatarUrl ?? data.userDetail?.avatarUrl ?? s.user.avatarUrl,
            bio: data.bio ?? s.user.bio,
            phone: data.phone ?? s.user.phone,
          };
          AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          return { ...s, user: updatedUser };
        });
      }
    } catch (e) {
      console.error('fetchUser error', e);
    }
  };

  return <AuthContext.Provider value={{ ...state, login, loginWithTokens, logout, updateUser, fetchUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
