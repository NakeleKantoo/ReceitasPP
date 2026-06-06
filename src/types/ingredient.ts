export type IngredientUnit = 'g' | 'ml' | 'un' | 'kg' | 'l';

export interface Ingredient {
  id: number;
  nome: string;
  unidade: IngredientUnit;
}

export interface AvailableIngredient {
  ingredientId: number;
  quantity: number;
  unit: IngredientUnit;
}
