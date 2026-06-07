import type { Recipe } from '@/types/recipe';
import type { AvailableIngredient } from '@/types/ingredient';

export interface Favorite {
  id: string;
  userId: number;
  recipeId: number;
  createdAt: string;
  recipeSnapshot?: Recipe;
}

export interface SearchLog {
  id: string;
  userId: number;
  ingredients: AvailableIngredient[];
  createdAt: string;
}
