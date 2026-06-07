import { generateId } from '@/utils/id';
import {
  getStoredFavorites,
  initializeStorage,
  saveStoredFavorites,
} from '@/services/storageService';
import type { Favorite } from '@/types/favorite';
import type { Recipe } from '@/types/recipe';

function hasSameSnapshot(currentSnapshot: Favorite['recipeSnapshot'], nextSnapshot: Recipe) {
  if (!currentSnapshot) {
    return false;
  }

  return JSON.stringify(currentSnapshot) === JSON.stringify(nextSnapshot);
}

export async function getUserFavorites(userId: number) {
  await initializeStorage();
  const favorites = await getStoredFavorites();
  return favorites.filter((favorite) => favorite.userId === userId);
}

export async function syncFavoriteSnapshots(userId: number, recipes: Recipe[]) {
  await initializeStorage();
  const favorites = await getStoredFavorites();
  const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  let hasChanges = false;

  const nextFavorites = favorites.map((favorite) => {
    if (favorite.userId !== userId) {
      return favorite;
    }

    const recipe = recipesById.get(favorite.recipeId);
    if (!recipe || hasSameSnapshot(favorite.recipeSnapshot, recipe)) {
      return favorite;
    }

    hasChanges = true;
    return {
      ...favorite,
      recipeSnapshot: recipe,
    };
  });

  if (hasChanges) {
    await saveStoredFavorites(nextFavorites);
  }

  return nextFavorites.filter((favorite) => favorite.userId === userId);
}

export async function toggleFavorite(userId: number, recipeId: number, recipeSnapshot?: Recipe | null) {
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
      recipeSnapshot: recipeSnapshot ?? undefined,
    },
  ];

  await saveStoredFavorites(nextFavorites);
  return {
    favorited: true,
    favorites: nextFavorites,
  };
}

export async function removeFavorite(userId: number, recipeId: number) {
  await initializeStorage();
  const favorites = await getStoredFavorites();
  const nextFavorites = favorites.filter(
    (favorite) => !(favorite.userId === userId && favorite.recipeId === recipeId)
  );
  await saveStoredFavorites(nextFavorites);
  return nextFavorites;
}
