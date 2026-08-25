import type { Session } from '@techenglish/contracts';
import type { StoragePort } from '@/shared/storage';
import type { AuthRepository, LoginInput } from '../../application/ports/auth-repository';

const SESSION_KEY = 'techenglish.web.session';

const demoAccounts: Record<string, Session> = {
  'admin@techenglish.pro': {
    accessToken: 'mock-admin-token',
    user: {
      id: 'admin-1',
      email: 'admin@techenglish.pro',
      displayName: 'Admin Demo',
      role: 'admin'
    }
  },
  'teacher@techenglish.pro': {
    accessToken: 'mock-teacher-token',
    user: {
      id: 'teacher-1',
      email: 'teacher@techenglish.pro',
      displayName: 'Teacher Demo',
      role: 'teacher'
    }
  }
};

export class MockAuthRepository implements AuthRepository {
  constructor(private readonly storage: StoragePort) {}

  async login(input: LoginInput): Promise<Session> {
    const account = demoAccounts[input.email.trim().toLowerCase()];

    if (!account || input.password.trim().length < 6) {
      throw new Error('Invalid email or password.');
    }

    await this.storage.setItem(SESSION_KEY, JSON.stringify(account));
    return account;
  }

  async logout(): Promise<void> {
    await this.storage.removeItem(SESSION_KEY);
  }

  async getSession(): Promise<Session | null> {
    const value = await this.storage.getItem(SESSION_KEY);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as Session;
    } catch {
      await this.storage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
