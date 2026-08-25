import type { StoragePort } from './storage-port';

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
};

export class BrowserStorageAdapter implements StoragePort {
  async getItem(key: string): Promise<string | null> {
    return getStorage()?.getItem(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    getStorage()?.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    getStorage()?.removeItem(key);
  }
}
