import type { StoragePort } from './storage-port';

export const AUTH_SESSION_KEY = 'techenglish.web.session';

export function sessionStorageTarget(): Storage {
  return window.sessionStorage.getItem(AUTH_SESSION_KEY) !== null
    ? window.sessionStorage : window.localStorage;
}

export function clearAuthSession(): void {
  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export class BrowserStorageAdapter implements StoragePort {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return (key === AUTH_SESSION_KEY ? sessionStorageTarget() : window.localStorage).getItem(key);
  }

  async setItem(key: string, value: string, persistent = true): Promise<void> {
    if (typeof window === 'undefined') return;
    if (key === AUTH_SESSION_KEY) {
      clearAuthSession();
      (persistent ? window.localStorage : window.sessionStorage).setItem(key, value);
    } else {
      window.localStorage.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    if (key === AUTH_SESSION_KEY) clearAuthSession();
    else window.localStorage.removeItem(key);
  }
}
