import { generateId } from '@/utils/id';
import {
  getStoredFavorites,
  initializeStorage,
  saveStoredFavorites,
} from '@/services/storageService';

export async function getUserFavorites(userId: string) {
  await initializeStorage();
  const favorites = await getStoredFavorites();
  return favorites.filter((favorite) => favorite.userId === userId);
}

export async function toggleFavorite(userId: string, recipeId: string) {
  await initializeStorage();
  const favorites = await getStoredFavorites();
  const existingFavorite = favorites.find(
    (favorite) => favorite.userId === userId && favorite.recipeId === recipeId
  );

  if (existingFavorite) {
    const nextFavorites = favorites.filter((favorite) => favorite.id !== existingFavorite.id);
    await saveStoredFavorites(nextFavorites);
    return {
      favorited: false,
      favorites: nextFavorites,
    };
  }

  const nextFavorites = [
    ...favorites,
    {
      id: generateId('favorite'),
      userId,
      recipeId,
      createdAt: new Date().toISOString(),
    },
  ];

  await saveStoredFavorites(nextFavorites);
  return {
    favorited: true,
    favorites: nextFavorites,
  };
}

export async function removeFavorite(userId: string, recipeId: string) {
  await initializeStorage();
  const favorites = await getStoredFavorites();
  const nextFavorites = favorites.filter(
    (favorite) => !(favorite.userId === userId && favorite.recipeId === recipeId)
  );
  await saveStoredFavorites(nextFavorites);
  return nextFavorites;
}
