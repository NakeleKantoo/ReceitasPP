import type { NewRecipeInput, RecipeIngredient } from '@/types/recipe';

export function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export function validatePositiveNumber(value: number) {
  return Number.isFinite(value) && value > 0;
}

export function hasDuplicateIngredientIds(ingredients: RecipeIngredient[]) {
  const ids = ingredients.map((ingredient) => ingredient.ingrediente.id);
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

  if (!input.nome.trim()) {
    errors.push('Informe o nome da receita.');
  }

  if (!input.refeicao.trim()) {
    errors.push('Informe a categoria da receita.');
  }

  if (!validatePositiveNumber(input.tempoPreparo)) {
    errors.push('O tempo de preparo precisa ser maior que zero.');
  }

  if (!validatePositiveNumber(input.porcoes)) {
    errors.push('O numero de porcoes precisa ser maior que zero.');
  }

  if (input.ingredientes.length === 0) {
    errors.push('Adicione pelo menos um ingrediente.');
  }

  if (hasDuplicateIngredientIds(input.ingredientes)) {
    errors.push('Nao e permitido repetir o mesmo ingrediente na receita.');
  }

  if (input.ingredientes.some((ingredient) => !validatePositiveNumber(ingredient.quantidade))) {
    errors.push('Todas as quantidades de ingredientes precisam ser maiores que zero.');
  }

  if (normalizePreparationMode(input.passos).length === 0) {
    errors.push('Informe o modo de preparo em pelo menos uma etapa.');
  }

  return errors;
}
