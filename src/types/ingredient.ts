export type IngredientUnit = 'g' | 'ml' | 'un' | 'kg' | 'l';

export interface Ingredient {
  id: string;
  nome: string;
  unidade: IngredientUnit;
}

export interface AvailableIngredient {
  ingredientId: string;
  quantity: number;
  unit: IngredientUnit;
}
