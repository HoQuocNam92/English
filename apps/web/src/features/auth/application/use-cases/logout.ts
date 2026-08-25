import type { AuthRepository } from '../ports/auth-repository';

export const logout = async (repository: AuthRepository): Promise<void> => {
  await repository.logout();
};
