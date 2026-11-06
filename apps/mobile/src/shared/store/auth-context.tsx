import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, subscribeSessionExpired } from '../api/api-client';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { AppState } from 'react-native';
import { ApiError } from '../api/api-client';

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
  const router = useRouter();
  const segments = useSegments();
  const navigation = useRootNavigationState();
  const [state, setState] = useState<AuthState>({
    user: null, accessToken: null, isLoggedIn: false, isLoading: true
  });
  useEffect(() => {
    if (!navigation?.key || state.isLoading || state.isLoggedIn) return;
    if (segments.length && String(segments[0]) !== '(auth)') router.replace('/(auth)/login');
  }, [navigation?.key, state.isLoading, state.isLoggedIn, segments.join('/'), router]);
  useEffect(() => subscribeSessionExpired(() => {
    setState({ user: null, accessToken: null, isLoggedIn: false, isLoading: false });
    router.replace('/(auth)/login');
  }), [router]);
  useEffect(() => {
    if (!state.isLoggedIn) return;
    let active = true, checking = false;
    const check = async () => {
      if (!active || checking || AppState.currentState !== 'active') return;
      checking = true;
      try { await apiRequest('/auth/me'); }
      catch (error) {
        if (active && error instanceof ApiError && error.statusCode === 401) {
          await Promise.all(['access_token', 'refresh_token', 'user'].map(key => AsyncStorage.removeItem(key)));
          if (active) setState({ user: null, accessToken: null, isLoggedIn: false, isLoading: false });
          if (active) router.replace('/(auth)/login');
        }
      } finally { checking = false; }
    };
    void check();
    const timer = setInterval(() => { void check(); }, 5000);
    const subscription = AppState.addEventListener('change', next => { if (next === 'active') void check(); });
    return () => { active = false; clearInterval(timer); subscription.remove(); };
  }, [state.isLoggedIn]);

  useEffect(() => {
    // Restore session
    (async () => {
      try {
        const [token, userRaw] = await Promise.all([
          AsyncStorage.getItem('access_token'),
          AsyncStorage.getItem('user'),
        ]);
        if (token && userRaw) {
          const user = JSON.parse(userRaw) as User;
          if (!user || typeof user.id !== 'string' || typeof user.email !== 'string') throw new Error('Invalid stored session');
          if (await AsyncStorage.getItem('access_token') === token) setState({ user, accessToken: token, isLoggedIn: true, isLoading: false });
        } else {
          setState(s => ({ ...s, isLoading: false }));
        }
      } catch {
        setState(s => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
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
