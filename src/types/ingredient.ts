export type IngredientUnit = 'g' | 'ml' | 'un';

export interface Ingredient {
  id: string;
  name: string;
  unit: IngredientUnit;
}

export interface AvailableIngredient {
  ingredientId: string;
  quantity: number;
  unit: IngredientUnit;
}
