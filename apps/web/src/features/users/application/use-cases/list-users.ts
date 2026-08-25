import type { UserListItem } from '../ports/user-repository';
import type { ListUsersInput, UserRepository } from '../ports/user-repository';

export const listUsers = async (repository: UserRepository, input: ListUsersInput): Promise<UserListItem[]> => {
  return repository.list(input);
};
