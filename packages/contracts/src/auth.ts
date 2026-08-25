export type UserRole = 'admin' | 'teacher' | 'learner';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface Session {
  accessToken: string;
  user: AuthenticatedUser;
}
