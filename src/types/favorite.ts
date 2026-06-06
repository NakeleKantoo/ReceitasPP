import type { AvailableIngredient } from '@/types/ingredient';

export interface Favorite {
  id: string;
  userId: number;
  recipeId: number;
  createdAt: string;
}

export interface SearchLog {
  id: string;
  userId: number;
  ingredients: AvailableIngredient[];
  createdAt: string;
}
