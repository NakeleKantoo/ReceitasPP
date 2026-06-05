import type { Ingredient, IngredientUnit } from '@/types/ingredient';

export interface RecipeIngredient {
  id: number;
  ingrediente: Ingredient;
  quantidade: number;
}

export interface Recipe {
  id: string;
  nome: string;
  refeicao: string;
  tempoPreparo: number;
  porcoes: number;
  ingredientes: RecipeIngredient[];
  passos: string;
  autor: string;
  createdAt: string;
}

export interface NewRecipeInput {
  nome: string;
  refeicao: string;
  tempoPreparo: number;
  porcoes: number;
  ingredientes: RecipeIngredient[];
  passos: string;
  autor: string;
  createdAt: string;
}
