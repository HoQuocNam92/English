import type { UserRole } from '@techenglish/contracts';

export interface UserListItem {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: 'active' | 'disabled';
}

export interface ListUsersInput {
  search?: string;
  role?: UserRole | 'all';
}

export interface UserRepository {
  list(input: ListUsersInput): Promise<UserListItem[]>;
}
