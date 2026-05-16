import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { mockIngredients } from '@/data/mockIngredients';
import {
  getAllRecipes,
  getApprovedRecipes,
  getCategories,
  getRecipeById as findRecipeById,
  getUserRecipes as listUserRecipes,
} from '@/services/recipeService';
import { getCompatibleRecipes, getRecipeMissingRequirements } from '@/utils/recipeCompatibility';
import type { AvailableIngredient, Ingredient } from '@/types/ingredient';
import type { Recipe } from '@/types/recipe';

interface RecipesContextValue {
  allRecipes: Recipe[];
  approvedRecipes: Recipe[];
  pendingRecipes: Recipe[];
  categories: string[];
  ingredientCatalog: Ingredient[];
  latestAvailableIngredients: AvailableIngredient[];
  compatibleRecipes: Recipe[];
  isLoading: boolean;
  getRecipeById: (recipeId: string) => Recipe | undefined;
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
    setAllRecipes(getAllRecipes());
    setIsLoading(false);
  }, []);

  const approvedRecipes = useMemo(() => getApprovedRecipes(), [allRecipes]);
  const pendingRecipes = useMemo(
    () => allRecipes.filter((recipe) => recipe.status === 'pending'),
    [allRecipes]
  );
  const categories = useMemo(() => ['Todas', ...getCategories()], [allRecipes]);

  const value = useMemo<RecipesContextValue>(
    () => ({
      allRecipes,
      approvedRecipes,
      pendingRecipes,
      categories,
      ingredientCatalog: mockIngredients,
      latestAvailableIngredients,
      compatibleRecipes,
      isLoading,
      getRecipeById: findRecipeById,
      getUserRecipes: listUserRecipes,
      runCompatibilityCheck: (ingredients) => {
        const results = getCompatibleRecipes(approvedRecipes, ingredients, mockIngredients);
        setLatestAvailableIngredients(ingredients);
        setCompatibleRecipes(results);
        return results;
      },
      clearCompatibilityResults: () => {
        setLatestAvailableIngredients([]);
        setCompatibleRecipes([]);
      },
      getMissingRequirements: (recipeId) => {
        const recipe = findRecipeById(recipeId);
        if (!recipe) {
          return [];
        }

        return getRecipeMissingRequirements(recipe, latestAvailableIngredients, mockIngredients);
      },
    }),
    [
      allRecipes,
      approvedRecipes,
      pendingRecipes,
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
