import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  filterRecipesByStatus,
  getAllIngredients,
  getAllRecipes,
  getCategories,
  getIngredientCatalogFallback,
  getUserRecipes as getRecipesForUser,
} from '@/services/recipeService';
import { useAuth } from '@/hooks/useAuth';
import { getCompatibleRecipes, getRecipeMissingRequirements } from '@/utils/recipeCompatibility';
import type { AvailableIngredient, Ingredient } from '@/types/ingredient';
import type { Recipe } from '@/types/recipe';

import * as recipeService from '@/services/recipeService';

interface RecipesContextValue {
  allRecipes: Recipe[];
  approvedRecipes: Recipe[];
  pendingRecipes: Recipe[];
  rejectedRecipes: Recipe[];
  categories: string[];
  ingredientCatalog: Ingredient[];
  latestAvailableIngredients: AvailableIngredient[];
  compatibleRecipes: Recipe[];
  isLoading: boolean;
  refreshRecipes: () => Promise<void>;
  getRecipeById: (recipeId: number | string) => Promise<Recipe>;
  getUserRecipes: (userId: number) => Recipe[];
  runCompatibilityCheck: (ingredients: AvailableIngredient[]) => Recipe[];
  clearCompatibilityResults: () => void;
  getMissingRequirements: (recipeId: number) => ReturnType<typeof getRecipeMissingRequirements>;
}

const RecipesContext = createContext<RecipesContextValue | undefined>(undefined);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [ingredientCatalog, setIngredientCatalog] = useState<Ingredient[]>(getIngredientCatalogFallback());
  const [latestAvailableIngredients, setLatestAvailableIngredients] = useState<AvailableIngredient[]>([]);
  const [compatibleRecipes, setCompatibleRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshRecipes = async () => {
    if (!user) {
      setAllRecipes([]);
      setIngredientCatalog(getIngredientCatalogFallback());
      setCompatibleRecipes([]);
      setLatestAvailableIngredients([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [recipes, ingredients] = await Promise.all([getAllRecipes(), getAllIngredients()]);
      setAllRecipes(recipes);
      setIngredientCatalog(ingredients);
    } catch (error) {
      console.warn('[RecipesProvider] Falha ao carregar receitas ou ingredientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshRecipes();
  }, [user?.id]);

  const approvedRecipes = useMemo(() => filterRecipesByStatus(allRecipes, 'approved'), [allRecipes]);
  const pendingRecipes = useMemo(() => filterRecipesByStatus(allRecipes, 'pending'), [allRecipes]);
  const rejectedRecipes = useMemo(() => filterRecipesByStatus(allRecipes, 'rejected'), [allRecipes]);
  const categories = useMemo(() => getCategories(approvedRecipes), [approvedRecipes]);

  const value = useMemo<RecipesContextValue>(
    () => ({
      allRecipes,
      approvedRecipes,
      pendingRecipes,
      rejectedRecipes,
      categories,
      ingredientCatalog,
      latestAvailableIngredients,
      compatibleRecipes,
      isLoading,
      refreshRecipes,
      getRecipeById: recipeService.getRecipeById,
      getUserRecipes: (userId) => getRecipesForUser(allRecipes, userId),
      runCompatibilityCheck: (ingredients) => {
        const results = getCompatibleRecipes(approvedRecipes, ingredients, ingredientCatalog);
        setLatestAvailableIngredients(ingredients);
        setCompatibleRecipes(results);
        return results;
      },
      clearCompatibilityResults: () => {
        setLatestAvailableIngredients([]);
        setCompatibleRecipes([]);
      },
      getMissingRequirements: (recipeId) => {
        const recipe = approvedRecipes.find((item) => item.id === recipeId);
        if (!recipe) {
          return [];
        }

        return getRecipeMissingRequirements(recipe, latestAvailableIngredients, ingredientCatalog);
      },
    }),
    [
      allRecipes,
      approvedRecipes,
      pendingRecipes,
      rejectedRecipes,
      categories,
      ingredientCatalog,
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
