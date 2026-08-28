import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@techenglish/contracts';
import { BrowserStorageAdapter } from '@/shared/storage';
import { getSession } from '../application/use-cases/get-session';
import { login } from '../application/use-cases/login';
import { logout } from '../application/use-cases/logout';
import { ApiAuthRepository } from '../infrastructure/api/api-auth-repository';

export interface LoginFormState {
  email: string;
  password: string;
}

export function useAuth() {
  const repository = useMemo(() => new ApiAuthRepository(new BrowserStorageAdapter()), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const currentSession = await getSession(repository);
      setSession(currentSession);
      setLoading(false);
    })();
  }, [repository]);

  const submitLogin = async (state: LoginFormState) => {
    setSubmitting(true);
    setError(null);

    try {
      const nextSession = await login(repository, state);
      setSession(nextSession);
      return nextSession;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const signOut = async () => {
    await logout(repository);
    setSession(null);
  };

  return {
    session,
    loading,
    submitting,
    error,
    submitLogin,
    signOut
  };
}
