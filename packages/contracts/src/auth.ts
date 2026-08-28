export type UserRole = 'admin' | 'teacher' | 'learner';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;        // primary role (first role)
  roles?: string[];      // all roles
  permissions?: string[]; // all permissions
}

export interface Session {
  accessToken: string;
  refreshToken?: string;
  user: AuthenticatedUser;
}
