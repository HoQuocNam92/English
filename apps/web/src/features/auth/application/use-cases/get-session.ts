import type { Session } from '@techenglish/contracts';
import type { AuthRepository } from '../ports/auth-repository';

export const getSession = async (repository: AuthRepository): Promise<Session | null> => {
  return repository.getSession();
};
