import type { Session } from '@techenglish/contracts';
import type { StoragePort } from '@/shared/storage';
import type { AuthRepository, LoginInput } from '../../application/ports/auth-repository';

const SESSION_KEY = 'techenglish.web.session';
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export class ApiAuthRepository implements AuthRepository {
  constructor(private readonly storage: StoragePort) {}

  async login(input: LoginInput): Promise<Session> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: input.email, password: input.password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any)?.message ?? 'Email hoặc mật khẩu không đúng.');
    }

    const data = await res.json();

    // data: { accessToken, refreshToken, user: { id, email, roles[], permissions[] } }
    const role = (data.user?.roles?.[0] ?? 'learner') as import('@techenglish/contracts').UserRole;
    const session: Session = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.displayName ?? data.user.email.split('@')[0],
        role,
        roles: data.user.roles ?? [role],
        permissions: data.user.permissions ?? [],
      },
    };

    await this.storage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  async logout(): Promise<void> {
    const raw = await this.storage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const session = JSON.parse(raw) as Session & { refreshToken?: string };
        if (session.refreshToken) {
          await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({ refreshToken: session.refreshToken }),
          }).catch(() => {}); // best-effort
        }
      } catch {
        /* ignore */
      }
    }
    await this.storage.removeItem(SESSION_KEY);
  }

  async getSession(): Promise<Session | null> {
    const value = await this.storage.getItem(SESSION_KEY);
    if (!value) return null;
    try {
      return JSON.parse(value) as Session;
    } catch {
      await this.storage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
