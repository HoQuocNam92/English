/**
 * Shared API client — tự động đính kèm JWT từ localStorage session.
 * Dùng cho mọi API call từ client components.
 */

const SESSION_KEY = 'techenglish.web.session';
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.accessToken ?? null;
  } catch {
    return null;
  }
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

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ message: 'Lỗi không xác định' }));
    throw new ApiClientError(
      Array.isArray((err as any).message)
        ? (err as any).message.join(', ')
        : err.message ?? `HTTP ${res.status}`,
      res.status,
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ============================================================
// API methods
// ============================================================

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
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

// Lessons
export interface LessonItem {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  type: string;
  status: string;
  estimatedMinutes: number | null;
  publishedAt: string | null;
  createdAt: string;
  domain: { code: string; name: string } | null;
  level: { code: string; name: string } | null;
  createdBy: { userDetail: { displayName: string } | null } | null;
}

export interface LessonDetail extends LessonItem {
  sections: Array<{
    id: string;
    type: string;
    order: number;
    title: string | null;
    content: Record<string, unknown>;
  }>;
}

// Vocabulary
export interface VocabularyItem {
  id: string;
  term: string;
  pronunciationIpa: string | null;
  partOfSpeech: string | null;
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
  prompt: string;
  context: string | null;
  explanation: string | null;
  points: number;
  status: string;
  topics: string[];
  createdAt: string;
  domain: { code: string; name: string } | null;
  level: { code: string; name: string } | null;
  options: Array<{ id: string; key: string; text: string; isCorrect: boolean; explanation: string | null }>;
}

// Exams
export interface ExamItem {
  id: string;
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
  lessonCount: number;
  groupCount: number;
  activeExamCount: number;
  recentLessons: LessonItem[];
}
