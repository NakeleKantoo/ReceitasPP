import { mockRecipes } from '@/data/mockRecipes';

export function getAllRecipes() {
  return [...mockRecipes];
}

export function getApprovedRecipes() {
  return mockRecipes.filter((recipe) => recipe.status === 'approved');
}

export function getPendingRecipes() {
  return mockRecipes.filter((recipe) => recipe.status === 'pending');
}

export function getCategories() {
  return [...new Set(getApprovedRecipes().map((recipe) => recipe.category))];
}

export function getRecipeById(recipeId: string) {
  return mockRecipes.find((recipe) => recipe.id === recipeId);
}

export function getUserRecipes(userId: string) {
  return mockRecipes.filter((recipe) => recipe.createdBy === userId);
}
