import type { NewRecipeInput, RecipeIngredient } from '@/types/recipe';

export function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export function validatePositiveNumber(value: number) {
  return Number.isFinite(value) && value > 0;
}

export function hasDuplicateIngredientIds(ingredients: RecipeIngredient[]) {
  const ids = ingredients.map((ingredient) => ingredient.ingredientId);
  return new Set(ids).size !== ids.length;
}

export function normalizePreparationMode(value: string) {
  return value
    .split('\n')
    .map((step) => step.trim())
    .filter(Boolean);
}

export function validateRecipeInput(input: NewRecipeInput) {
  const errors: string[] = [];

  if (!input.title.trim()) {
    errors.push('Informe o titulo da receita.');
  }

  if (!input.description.trim()) {
    errors.push('Informe uma descricao curta.');
  }

  if (!input.category.trim()) {
    errors.push('Informe a categoria da receita.');
  }

  if (!validatePositiveNumber(input.preparationTime)) {
    errors.push('O tempo de preparo precisa ser maior que zero.');
  }

  if (!validatePositiveNumber(input.servings)) {
    errors.push('O numero de porcoes precisa ser maior que zero.');
  }

  if (input.ingredients.length === 0) {
    errors.push('Adicione pelo menos um ingrediente.');
  }

  if (hasDuplicateIngredientIds(input.ingredients)) {
    errors.push('Nao e permitido repetir o mesmo ingrediente na receita.');
  }

  if (input.ingredients.some((ingredient) => !validatePositiveNumber(ingredient.quantity))) {
    errors.push('Todas as quantidades de ingredientes precisam ser maiores que zero.');
  }

  if (input.preparationMode.length === 0) {
    errors.push('Informe o modo de preparo em pelo menos uma etapa.');
  }

  return errors;
}
