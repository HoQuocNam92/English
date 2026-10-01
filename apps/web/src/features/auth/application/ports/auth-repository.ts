import type { Session } from '@techenglish/contracts';

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthRepository {
  login(input: LoginInput): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
}
