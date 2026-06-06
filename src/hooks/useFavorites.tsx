import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/hooks/useAuth';
import * as favoriteService from '@/services/favoriteService';

interface FavoritesContextValue {
  favoriteRecipeIds: number[];
  isLoading: boolean;
  toggleFavorite: (recipeId: number) => Promise<boolean>;
  removeFavorite: (recipeId: number) => Promise<void>;
  isFavorite: (recipeId: number) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshFavorites = async () => {
    if (!user) {
      setFavoriteRecipeIds([]);
      setIsLoading(false);
      return;
    }

    const favorites = await favoriteService.getUserFavorites(user.id);
    setFavoriteRecipeIds(favorites.map((favorite) => favorite.recipeId));
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    void refreshFavorites();
  }, [user?.id]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteRecipeIds,
      isLoading,
      toggleFavorite: async (recipeId) => {
        if (!user) {
          throw new Error('Faca login para favoritar receitas.');
        }

        const result = await favoriteService.toggleFavorite(user.id, recipeId);
        const userFavoriteIds = result.favorites
          .filter((favorite) => favorite.userId === user.id)
          .map((favorite) => favorite.recipeId);

        setFavoriteRecipeIds(userFavoriteIds);
        return result.favorited;
      },
      removeFavorite: async (recipeId) => {
        if (!user) {
          return;
        }

        const favorites = await favoriteService.removeFavorite(user.id, recipeId);
        setFavoriteRecipeIds(
          favorites
            .filter((favorite) => favorite.userId === user.id)
            .map((favorite) => favorite.recipeId)
        );
      },
      isFavorite: (recipeId) => favoriteRecipeIds.includes(recipeId),
      refreshFavorites,
    }),
    [favoriteRecipeIds, isLoading, user]
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
