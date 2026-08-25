import type { Session } from '@techenglish/contracts';
import type { AuthRepository, LoginInput } from '../ports/auth-repository';

export const login = async (repository: AuthRepository, input: LoginInput): Promise<Session> => {
  return repository.login(input);
};
