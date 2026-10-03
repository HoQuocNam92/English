import { mutationSuccessMessage } from './mutation-feedback';
import { localizeLevelFields } from '@/shared/lib/level-label';
/**
 * Shared API client — tự động đính kèm JWT từ localStorage session.
 * Dùng cho mọi API call từ client components.
 */

import { sessionStorageTarget, clearAuthSession } from "@/shared/storage";
import { API_BASE_URL } from "@/shared/config/env";
import { toVietnameseErrorMessage } from "@/shared/lib/error-message";

const SESSION_KEY = "techenglish.web.session";
const API_BASE = API_BASE_URL;

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorageTarget().getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.accessToken ?? null;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    // Read the body within the same timeout, even if only headers arrived.
    const body = await response.arrayBuffer();
    return new Response(response.status === 204 ? null : body, {
      status: response.status, statusText: response.statusText, headers: response.headers,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Máy chủ phản hồi quá lâu. Vui lòng thử lại.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const raw = sessionStorageTarget().getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!session?.refreshToken) return null;

      const response = await fetchWithTimeout(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
      if (!response.ok) return null;

      const data = await response.json();
      if (!data?.accessToken) return null;
      sessionStorageTarget().setItem(
        SESSION_KEY,
        JSON.stringify({ ...session, accessToken: data.accessToken }),
      );
      return data.accessToken as string;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

interface ApiError {
  message: string;
  statusCode?: number;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}, canRetry = true): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(!(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetchWithTimeout(`${API_BASE}${path}`, { ...options, headers });
  } catch (error) {
    throw new ApiClientError(toVietnameseErrorMessage(error instanceof Error ? error.message : error), 0);
  }

  if (res.status === 401 && canRetry && token && path !== "/auth/refresh") {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) return request<T>(path, options, false);

    clearAuthSession();
    if (window.location.pathname !== "/login") window.location.assign("/login");
  }

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ message: "Lỗi không xác định" }));
    throw new ApiClientError(
      toVietnameseErrorMessage((err as any).message ?? err.message, res.status),
      res.status,
    );
  }

  const data = res.status === 204 ? undefined : localizeLevelFields(await res.json() as T, /^\/levels(?:[/?]|$)/.test(path));
  let body: unknown;
  try { body = typeof options.body === 'string' ? JSON.parse(options.body) : undefined; } catch { body = undefined; }
  const message = mutationSuccessMessage(path, options.method ?? 'GET', body);
  if (message && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('techenglish:toast', { detail: { message, kind: 'success', title: message.startsWith('Đã lưu') ? 'Lưu thành công' : 'Thành công', automatic: true } }));
  }
  return data as T;
}

// ============================================================
// API methods
// ============================================================

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  postWithHeaders: <T>(path: string, body: unknown, extraHeaders: Record<string, string>) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body), headers: extraHeaders }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, body: FormData) => request<T>(path, { method: "POST", body }),
};

// ============================================================
// Typed API helpers
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}



// Vocabulary
export interface VocabularyItem {
  id: string;
  term: string;
  pronunciationIpa: string | null;
  partOfSpeech: string | null;
  partsOfSpeech?: string[];
  domains?: Array<{ domainId: string; domain: { id: string; code: string; name: string } }>;
  definitionEn: string;
  definitionVi: string | null;
  tags: string[];
  status: string;
  createdAt: string;
  domain: { code: string; name: string } | null;
  level: { code: string; name: string } | null;
  examples: Array<{ id: string; sentenceEn: string; translationVi: string | null; order: number }>;
}

// Questions
export interface QuestionItem {
  id: string;
  type: string;
  skill: string;
  prompt: string;
  context: string | null;
  explanation: string | null;
  points: number;
  status: string;
  topics: string[];
  createdAt: string;
  domain: { code: string; name: string } | null;
  level: { code: string; name: string } | null;
  options: Array<{
    id: string;
    key: string;
    text: string;
    isCorrect: boolean;
    explanation: string | null;
  }>;
  certificationTopics?: Array<{ topic: { id: string; name: string; certificateDomain?: { certificate?: { id: string; code: string; name: string } } } }>;
  examQuestions?: Array<{ order: number; exam: { id: string; title: string } }>;
}

// Exams
export interface ExamItem {
  id: string;
  kind: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  passingScorePercent: number;
  maxAttempts: number | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  topics: string[];
  domain: { code: string; name: string } | null;
  level: { code: string; name: string } | null;
  createdBy: { userDetail: { displayName: string } | null } | null;
  _count?: { questions: number; attempts: number };
}

// Users
export interface UserItem {
  id: string;
  email: string;
  status: string;
  displayName: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  level?: string;
  domains?: string[];
  certGoals?: string[];
}

// Roles
export interface RoleItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissions: Array<{ id: string; code: string; name: string }>;
  userCount: number;
}

export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
}

// Dashboard stats
export interface TeacherDashboardStats {
  groupCount: number;
  activeExamCount: number;
}
