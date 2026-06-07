import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useRecipes } from '@/hooks/useRecipes';
import * as favoriteService from '@/services/favoriteService';
import type { Recipe } from '@/types/recipe';

interface FavoritesContextValue {
  favoriteRecipeIds: number[];
  favoriteRecipes: Recipe[];
  isLoading: boolean;
  toggleFavorite: (recipeId: number, recipeSnapshot?: Recipe) => Promise<boolean>;
  removeFavorite: (recipeId: number) => Promise<void>;
  isFavorite: (recipeId: number) => boolean;
  refreshFavorites: () => Promise<void>;
  getFavoriteRecipe: (recipeId: number) => Recipe | null;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { allRecipes } = useRecipes();
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<number[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteRecipeIds([]);
      setFavoriteRecipes([]);
      setIsLoading(false);
      return;
    }

    const favorites =
      allRecipes.length > 0
        ? await favoriteService.syncFavoriteSnapshots(user.id, allRecipes)
        : await favoriteService.getUserFavorites(user.id);

    setFavoriteRecipeIds(favorites.map((favorite) => favorite.recipeId));
    setFavoriteRecipes(
      favorites
        .map((favorite) => favorite.recipeSnapshot ?? null)
        .filter((recipe): recipe is Recipe => recipe !== null)
    );
    setIsLoading(false);
  }, [allRecipes, user]);

  useEffect(() => {
    setIsLoading(true);
    void refreshFavorites();
  }, [refreshFavorites, user?.id]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteRecipeIds,
      favoriteRecipes,
      isLoading,
      toggleFavorite: async (recipeId, recipeSnapshot) => {
        if (!user) {
          throw new Error('Faça login para favoritar receitas.');
        }

        const resolvedRecipeSnapshot =
          recipeSnapshot ??
          allRecipes.find((recipe) => recipe.id === recipeId) ??
          favoriteRecipes.find((recipe) => recipe.id === recipeId);

        const resolvedRecipeSnapshot =
          recipeSnapshot ??
          allRecipes.find((recipe) => recipe.id === recipeId) ??
          favoriteRecipes.find((recipe) => recipe.id === recipeId);

        const result = await favoriteService.toggleFavorite(user.id, recipeId, resolvedRecipeSnapshot);
        const userFavorites = result.favorites.filter((favorite) => favorite.userId === user.id);

        setFavoriteRecipeIds(userFavorites.map((favorite) => favorite.recipeId));
        setFavoriteRecipes(
          userFavorites
            .map((favorite) => favorite.recipeSnapshot ?? null)
            .filter((recipe): recipe is Recipe => recipe !== null)
        );

        return result.favorited;
      },
      removeFavorite: async (recipeId) => {
        if (!user) {
          return;
        }

        const favorites = await favoriteService.removeFavorite(user.id, recipeId);
        const userFavorites = favorites.filter((favorite) => favorite.userId === user.id);

        setFavoriteRecipeIds(userFavorites.map((favorite) => favorite.recipeId));
        setFavoriteRecipes(
          userFavorites
            .map((favorite) => favorite.recipeSnapshot ?? null)
            .filter((recipe): recipe is Recipe => recipe !== null)
        );
      },
      isFavorite: (recipeId) => favoriteRecipeIds.includes(recipeId),
      refreshFavorites,
      getFavoriteRecipe: (recipeId) => favoriteRecipes.find((recipe) => recipe.id === recipeId) ?? null,
    }),
    [allRecipes, favoriteRecipeIds, favoriteRecipes, isLoading, refreshFavorites, user]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites precisa ser usado dentro de FavoritesProvider.');
  }

  return context;
}
