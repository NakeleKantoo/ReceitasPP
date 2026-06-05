import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { mockIngredients } from '@/data/mockIngredients';
import { getAllRecipes } from '@/services/recipeService';
import { getCompatibleRecipes, getRecipeMissingRequirements } from '@/utils/recipeCompatibility';
import type { AvailableIngredient, Ingredient } from '@/types/ingredient';
import type { Recipe } from '@/types/recipe';

import * as recipeService from '@/services/recipeService';

interface RecipesContextValue {
  allRecipes: Recipe[];
  categories: string[];
  ingredientCatalog: Ingredient[];
  latestAvailableIngredients: AvailableIngredient[];
  compatibleRecipes: Recipe[];
  isLoading: boolean;
  getRecipeById: (recipeId: string) => Promise<Recipe | null>;
  getUserRecipes: (userId: string) => Recipe[];
  runCompatibilityCheck: (ingredients: AvailableIngredient[]) => Recipe[];
  clearCompatibilityResults: () => void;
  getMissingRequirements: (recipeId: string) => ReturnType<typeof getRecipeMissingRequirements>;
}

const RecipesContext = createContext<RecipesContextValue | undefined>(undefined);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [latestAvailableIngredients, setLatestAvailableIngredients] = useState<AvailableIngredient[]>([]);
  const [compatibleRecipes, setCompatibleRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllRecipes().then((v) => {
      if (v) {
        setAllRecipes(v);
      }
    });
    setIsLoading(false);
  }, []);
  const categories = useMemo(
    () => ['Todas', ...new Set(allRecipes.map((recipe) => recipe.refeicao))],
    [allRecipes]
  );

  const value = useMemo<RecipesContextValue>(
    () => ({
      allRecipes,
      categories,
      ingredientCatalog: mockIngredients,
      latestAvailableIngredients,
      compatibleRecipes,
      isLoading,
      getRecipeById: recipeService.getRecipeById,
      getUserRecipes: (userId) => allRecipes.filter((recipe) => recipe.autor === userId),
      runCompatibilityCheck: (ingredients) => {
        const results = getCompatibleRecipes(allRecipes, ingredients, mockIngredients);
        setLatestAvailableIngredients(ingredients);
        setCompatibleRecipes(results);
        return results;
      },
      clearCompatibilityResults: () => {
        setLatestAvailableIngredients([]);
        setCompatibleRecipes([]);
      },
      getMissingRequirements: (recipeId) => {
        const recipe = allRecipes.find((item) => item.id === recipeId);
        if (!recipe) {
          return [];
        }

        return getRecipeMissingRequirements(recipe, latestAvailableIngredients, mockIngredients);
      },
    }),
    [
      allRecipes,
      categories,
      latestAvailableIngredients,
      compatibleRecipes,
      isLoading,
    ]
  );

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipes() {
  const context = useContext(RecipesContext);

  if (!context) {
    throw new Error('useRecipes precisa ser usado dentro de RecipesProvider.');
  }

  return context;
}
