import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';

export const API_BASE = API_BASE_URL;

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('access_token');
}

export async function getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  const [accessToken, refreshToken] = await Promise.all([
    AsyncStorage.getItem('access_token'),
    AsyncStorage.getItem('refresh_token'),
  ]);
  return { accessToken, refreshToken };
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (!refreshToken) return false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal,
      });
      if (!response.ok) return false;
      const data = await response.json();
      if (!data.accessToken) return false;
      // Do not restore a session that was signed out while refreshing.
      if (await AsyncStorage.getItem('refresh_token') !== refreshToken) return false;
      await AsyncStorage.setItem('access_token', data.accessToken);
      if (data.refreshToken) await AsyncStorage.setItem('refresh_token', data.refreshToken);
      return true;
    } finally {
      clearTimeout(timeout);
    }
  })();
  try { return await refreshPromise; }
  finally { refreshPromise = null; }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retryOnUnauth = true
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.status === 401 && token && retryOnUnauth && !path.startsWith('/auth/')) {
      if (await refreshSession()) return apiRequest<T>(path, options, false);
      throw new ApiError(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as any;
      throw new ApiError(res.status, Array.isArray(body?.message) ? body.message.join('\n') : body?.message ?? `HTTP ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, 'Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng.');
  }
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) => apiRequest<T>(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, options?: RequestInit) => apiRequest<T>(path, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, options?: RequestInit) => apiRequest<T>(path, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: RequestInit) => apiRequest<T>(path, { ...options, method: 'DELETE' }),
};
