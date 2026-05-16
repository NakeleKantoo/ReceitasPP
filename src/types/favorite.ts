import type { AvailableIngredient } from '@/types/ingredient';

export interface Favorite {
  id: string;
  userId: string;
  recipeId: string;
  createdAt: string;
}

export interface SearchLog {
  id: string;
  userId: string;
  ingredients: AvailableIngredient[];
  createdAt: string;
}
