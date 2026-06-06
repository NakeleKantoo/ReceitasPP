import type { Ingredient } from '@/types/ingredient';
import type { UserSummary } from '@/types/user';

export type RecipeStatus = 'pending' | 'approved' | 'rejected';

export interface RecipeIngredient {
  id: number;
  ingrediente: Ingredient;
  quantidade: number;
}

export interface Recipe {
  id: number;
  nome: string;
  refeicao: string;
  tempoPreparo: number;
  porcoes: number;
  ingredientes: RecipeIngredient[];
  passos: string;
  autor: UserSummary | null;
  status: RecipeStatus;
  createdAt: string;
}

export interface NewRecipeInput {
  nome: string;
  refeicao: string;
  tempoPreparo: number;
  porcoes: number;
  ingredientes: RecipeIngredient[];
  passos: string;
}

export interface CreateRecipePayload {
  nome: string;
  refeicao: string;
  tempoPreparo: number;
  porcoes: number;
  passos: string;
  ingredientes: Array<{
    ingredienteId: number;
    quantidade: number;
  }>;
}
