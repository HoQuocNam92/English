import type { UserRepository, ListUsersInput, UserListItem } from '../../application/ports/user-repository';

const mockUsers: UserListItem[] = [
  {
    id: 'admin-1',
    displayName: 'Admin Demo',
    email: 'admin@techenglish.pro',
    role: 'admin',
    status: 'active'
  },
  {
    id: 'teacher-1',
    displayName: 'Teacher Demo',
    email: 'teacher@techenglish.pro',
    role: 'teacher',
    status: 'active'
  },
  {
    id: 'learner-1',
    displayName: 'Lan Nguyen',
    email: 'lan.nguyen@techenglish.pro',
    role: 'learner',
    status: 'active'
  },
  {
    id: 'learner-2',
    displayName: 'Minh Tran',
    email: 'minh.tran@techenglish.pro',
    role: 'learner',
    status: 'disabled'
  }
];

export class MockUserRepository implements UserRepository {
  async list(input: ListUsersInput): Promise<UserListItem[]> {
    return mockUsers.filter((user) => {
      const matchesRole = !input.role || input.role === 'all' ? true : user.role === input.role;
      const keyword = input.search?.trim().toLowerCase();
      const matchesSearch = !keyword
        ? true
        : user.displayName.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword);

      return matchesRole && matchesSearch;
    });
  }
}
