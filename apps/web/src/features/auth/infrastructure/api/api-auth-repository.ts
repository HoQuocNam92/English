import type { Session } from "@techenglish/contracts";
import { API_BASE_URL } from "@/shared/config/env";
import type { StoragePort } from "@/shared/storage";
import type { AuthRepository, LoginInput } from "../../application/ports/auth-repository";
import { toVietnameseErrorMessage } from '@/shared/lib/error-message';

const SESSION_KEY = "techenglish.web.session";
const API_BASE = API_BASE_URL;

function localizeLoginError(message: unknown, status: number): string {
  const raw = Array.isArray(message) ? message.join(', ') : String(message ?? '').trim();
  const normalized = raw.toLowerCase();
  if (!raw && status === 401) return 'Email hoặc mật khẩu không chính xác.';
  if (/invalid credentials|bad credentials|unauthorized/.test(normalized)) return 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
  if (/password.*incorrect|incorrect.*password/.test(normalized)) return 'Mật khẩu không chính xác. Vui lòng thử lại.';
  if (/user.*not found|account.*not found/.test(normalized)) return 'Không tìm thấy tài khoản với email này.';
  if (/suspended|locked/.test(normalized)) return 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.';
  if (/inactive|disabled|not activated/.test(normalized)) return 'Tài khoản chưa được kích hoạt hoặc đã bị vô hiệu hóa.';
  return toVietnameseErrorMessage(raw, status);
}

export class ApiAuthRepository implements AuthRepository {
  constructor(private readonly storage: StoragePort) {}

  async login(input: LoginInput): Promise<Session> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: input.email, password: input.password }),
      });
    } catch {
      throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend và địa chỉ API.");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(localizeLoginError((err as any)?.message, res.status));
    }

    const data = await res.json();

    // data: { accessToken, refreshToken, user: { id, email, roles[], permissions[] } }
    const role = (data.user?.roles?.[0] ?? "learner") as import("@techenglish/contracts").UserRole;
    const session: Session = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.displayName ?? data.user.email.split("@")[0],
        role,
        roles: data.user.roles ?? [role],
        permissions: data.user.permissions ?? [],
      },
    };

    await this.storage.setItem(SESSION_KEY, JSON.stringify(session), input.rememberMe ?? true);
    return session;
  }

  async logout(): Promise<void> {
    const raw = await this.storage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const session = JSON.parse(raw) as Session & { refreshToken?: string };
        if (session.refreshToken) {
          await fetch(`${API_BASE}/auth/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
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
