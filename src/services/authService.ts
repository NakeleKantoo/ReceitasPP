import { generateId } from '@/utils/id';
import { validateEmail } from '@/utils/validators';
import {
  clearStoredSession,
  getStoredSession,
  getStoredUser,
  initializeStorage,
  saveStoredSession,
  saveStoredUser,
} from '@/services/storageService';
import type { User } from '@/types/user';
import { loginOnline, registerOnline } from '@/utils/endpoints';

export async function getUser() {
  await initializeStorage();
  const user = await getStoredUser();
  return user;
}

export async function restoreSessionUser() {
  return await getUser();
}

export async function login(email: string, password: string) {
  
  const normalizedEmail = email.trim();
  
  const matchedUser = await loginOnline(normalizedEmail, password);

  if (!matchedUser) {
    throw new Error('E-mail ou senha invalidos.');
  }

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
