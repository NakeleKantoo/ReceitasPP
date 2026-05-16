import type { IngredientUnit } from '@/types/ingredient';

export type RecipeStatus = 'pending' | 'approved' | 'rejected';
export type RecipeSource = 'seed' | 'user';

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: IngredientUnit;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  preparationTime: number;
  servings: number;
  ingredients: RecipeIngredient[];
  preparationMode: string[];
  createdBy: string;
  status: RecipeStatus;
  source: RecipeSource;
  createdAt: string;
}

export interface NewRecipeInput {
  title: string;
  description: string;
  category: string;
  preparationTime: number;
  servings: number;
  ingredients: RecipeIngredient[];
  preparationMode: string[];
}

export interface UpdateRecipeInput extends Partial<NewRecipeInput> {
  status?: RecipeStatus;
}
