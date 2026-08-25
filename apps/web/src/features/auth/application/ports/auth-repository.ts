import type { Session } from '@techenglish/contracts';

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthRepository {
  login(input: LoginInput): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
}
