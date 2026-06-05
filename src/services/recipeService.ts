import { fetchReceitaById, fetchReceitas } from "@/utils/endpoints";

export async function getAllRecipes() {
  return await fetchReceitas();
}

export function getCategories() {
  return ['Café da manhã', 'Almoço', 'Janta', 'Lanche', 'Lanche rápido'];
}

export async function getRecipeById(recipeId: string) {
  return await fetchReceitaById(recipeId); //implementar
}

export function getUserRecipes(userId: string) {
  return null; //implementar
}
