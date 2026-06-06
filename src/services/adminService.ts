import {
  deleteAdminRecipe,
  fetchAdminDashboard,
  fetchAdminRecipes,
  fetchAdminReports,
  fetchAdminUsers,
  updateAdminRecipeStatus,
} from '@/utils/endpoints';
import type { RecipeStatus } from '@/types/recipe';

export async function getAllUsers() {
  return await fetchAdminUsers();
}

export async function getDashboardStats() {
  return await fetchAdminDashboard();
}

export async function getAdminReports() {
  return await fetchAdminReports();
}

export async function getAllAdminRecipes(status?: RecipeStatus) {
  return await fetchAdminRecipes(status);
}

export async function moderateRecipe(recipeId: number, status: RecipeStatus) {
  return await updateAdminRecipeStatus(recipeId, status);
}

export async function removeRecipeAsAdmin(recipeId: number) {
  return await deleteAdminRecipe(recipeId);
}
