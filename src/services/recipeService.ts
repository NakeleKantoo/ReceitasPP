import { createRecipeOnline, fetchIngredientes, fetchReceitaById, fetchReceitas } from '@/utils/endpoints';
import type { Ingredient } from '@/types/ingredient';
import type { CreateRecipePayload, Recipe, RecipeStatus } from '@/types/recipe';

export async function getAllRecipes() {
  return await fetchReceitas();
}

export async function getAllIngredients() {
  return await fetchIngredientes();
}

export async function getRecipeById(recipeId: number | string) {
  return await fetchReceitaById(recipeId);
}

export async function createRecipe(payload: CreateRecipePayload) {
  return await createRecipeOnline(payload);
}

export function filterRecipesByStatus(recipes: Recipe[], status: RecipeStatus) {
  return recipes.filter((recipe) => recipe.status === status);
}

export function getCategories(recipes: Recipe[]) {
  return ['Todas', ...new Set(recipes.map((recipe) => recipe.refeicao))];
}

export function getUserRecipes(recipes: Recipe[], userId: number) {
  return recipes.filter((recipe) => recipe.autor?.id === userId);
}

export function getIngredientCatalogFallback() {
  return [] as Ingredient[];
}
