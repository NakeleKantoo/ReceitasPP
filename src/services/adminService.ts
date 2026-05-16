import { mockIngredients } from '@/data/mockIngredients';
import { getAllRecipes, getPendingRecipes } from '@/services/recipeService';
import {
  getStoredFavorites,
  getStoredSearchLogs,
  getStoredUsers,
  initializeStorage,
} from '@/services/storageService';

function sortEntries(entries: Record<string, number>) {
  return Object.entries(entries)
    .sort((first, second) => second[1] - first[1])
    .map(([label, value]) => ({ label, value }));
}

export async function getAllUsers() {
  await initializeStorage();
  return getStoredUsers();
}

export async function getDashboardStats() {
  await initializeStorage();
  const [users, favorites, searchLogs] = await Promise.all([
    getStoredUsers(),
    getStoredFavorites(),
    getStoredSearchLogs(),
  ]);
  const recipes = getAllRecipes();

  const categoryUsage: Record<string, number> = {};
  const usedIngredients: Record<string, number> = {};
  const searchedIngredients: Record<string, number> = {};

  for (const recipe of recipes) {
    categoryUsage[recipe.category] = (categoryUsage[recipe.category] ?? 0) + 1;

    for (const ingredient of recipe.ingredients) {
      const ingredientName =
        mockIngredients.find((item) => item.id === ingredient.ingredientId)?.name ??
        ingredient.ingredientId;
      usedIngredients[ingredientName] = (usedIngredients[ingredientName] ?? 0) + 1;
    }
  }

  for (const log of searchLogs) {
    for (const ingredient of log.ingredients) {
      const ingredientName =
        mockIngredients.find((item) => item.id === ingredient.ingredientId)?.name ??
        ingredient.ingredientId;
      searchedIngredients[ingredientName] = (searchedIngredients[ingredientName] ?? 0) + 1;
    }
  }

  return {
    totalUsers: users.length,
    totalRecipes: recipes.length,
    pendingRecipes: getPendingRecipes().length,
    approvedRecipes: recipes.filter((recipe) => recipe.status === 'approved').length,
    totalFavorites: favorites.length,
    topCategories: sortEntries(categoryUsage).slice(0, 5),
    topUsedIngredients: sortEntries(usedIngredients).slice(0, 5),
    topSearchedIngredients: sortEntries(searchedIngredients).slice(0, 5),
  };
}
