import { generateId } from '@/utils/id';
import { validateEmail } from '@/utils/validators';
import {
  clearStoredSession,
  getStoredSession,
  getStoredUsers,
  initializeStorage,
  saveStoredSession,
  saveStoredUsers,
} from '@/services/storageService';
import type { User } from '@/types/user';
import { registerOnline } from '@/utils/endpoints';

export async function getUserById(userId: string) {
  await initializeStorage();
  const users = await getStoredUsers();
  return users.find((user) => user.id === userId) ?? null;
}

export async function restoreSessionUser() {
  await initializeStorage();
  const session = await getStoredSession();

  if (!session) {
    return null;
  }

  return getUserById(session.userId);
}

export async function login(email: string, password: string) {
  await initializeStorage();
  const normalizedEmail = email.trim().toLowerCase();
  const users = await getStoredUsers();

  const matchedUser = users.find(
    (user) => user.email.toLowerCase() === normalizedEmail && user.password === password
  );

  if (!matchedUser) {
    throw new Error('E-mail ou senha invalidos.');
  }

  await saveStoredSession({ userId: matchedUser.id });
  return matchedUser;
}

export async function register(name: string, email: string, password: string) {
  if (!name.trim()) {
    throw new Error('Informe seu nome.');
  }

  if (!validateEmail(email)) {
    throw new Error('Informe um e-mail valido.');
  }

  if (!password.trim()) {
    throw new Error('Informe uma senha.');
  }


  const res = await registerOnline(name, email, password);

  if (!res) {
    throw new Error('Erro.')
  }

  return res;
}

export async function logout() {
  await clearStoredSession();
}
