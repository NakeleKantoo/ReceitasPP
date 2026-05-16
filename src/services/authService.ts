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
  await initializeStorage();

  if (!name.trim()) {
    throw new Error('Informe seu nome.');
  }

  if (!validateEmail(email)) {
    throw new Error('Informe um e-mail valido.');
  }

  if (!password.trim()) {
    throw new Error('Informe uma senha.');
  }

  const users = await getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw new Error('Ja existe uma conta com este e-mail.');
  }

  const newUser: User = {
    id: generateId('user'),
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  await saveStoredUsers([...users, newUser]);
  await saveStoredSession({ userId: newUser.id });

  return newUser;
}

export async function logout() {
  await clearStoredSession();
}
