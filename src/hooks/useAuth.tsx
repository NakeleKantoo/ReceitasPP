import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as authService from '@/services/authService';
import { initializeStorage } from '@/services/storageService';
import type { User } from '@/types/user';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const sessionUser = await authService.restoreSessionUser();
    setUser(sessionUser);
  };

  useEffect(() => {
    async function bootstrap() {
      await initializeStorage();
      await refreshUser();
      setIsLoading(false);
    }

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email, password) => {
        const loggedUser = await authService.login(email, password);
        setUser(loggedUser);
        return loggedUser;
      },
      register: async (name, email, password) => {
        const createdUser = await authService.register(name, email, password);
        setUser(createdUser);
        return createdUser;
      },
      logout: async () => {
        await authService.logout();
        setUser(null);
      },
      refreshUser,
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.');
  }

  return context;
}
