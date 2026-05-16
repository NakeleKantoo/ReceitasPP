import AsyncStorage from '@react-native-async-storage/async-storage';

import { mockFavorites } from '@/data/mockFavorites';
import { mockSearchLogs } from '@/data/mockSearchLogs';
import { mockUsers } from '@/data/mockUsers';
import type { Favorite, SearchLog } from '@/types/favorite';
import type { Session, User } from '@/types/user';

const storageKeys = {
  users: '@receitaspp/users',
  favorites: '@receitaspp/favorites',
  session: '@receitaspp/session',
  searchLogs: '@receitaspp/search-logs',
} as const;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const rawValue = await AsyncStorage.getItem(key);
  if (!rawValue) {
    return fallback;
  }

  return JSON.parse(rawValue) as T;
}

async function writeJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function seedCollection<T>(key: string, initialValue: T) {
  const existingValue = await AsyncStorage.getItem(key);
  if (!existingValue) {
    await writeJson(key, initialValue);
  }
}

export async function initializeStorage() {
  await seedCollection(storageKeys.users, mockUsers);
  await seedCollection(storageKeys.favorites, mockFavorites);
  await seedCollection(storageKeys.searchLogs, mockSearchLogs);
}

export function getStoredUsers() {
  return readJson<User[]>(storageKeys.users, []);
}

export function saveStoredUsers(users: User[]) {
  return writeJson(storageKeys.users, users);
}

export function getStoredFavorites() {
  return readJson<Favorite[]>(storageKeys.favorites, []);
}

export function saveStoredFavorites(favorites: Favorite[]) {
  return writeJson(storageKeys.favorites, favorites);
}

export function getStoredSession() {
  return readJson<Session | null>(storageKeys.session, null);
}

export function saveStoredSession(session: Session) {
  return writeJson(storageKeys.session, session);
}

export function clearStoredSession() {
  return AsyncStorage.removeItem(storageKeys.session);
}

export function getStoredSearchLogs() {
  return readJson<SearchLog[]>(storageKeys.searchLogs, []);
}

export function saveStoredSearchLogs(searchLogs: SearchLog[]) {
  return writeJson(storageKeys.searchLogs, searchLogs);
}
