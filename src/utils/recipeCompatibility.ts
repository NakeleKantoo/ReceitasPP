import type { AvailableIngredient, Ingredient } from '@/types/ingredient';
import type { Recipe } from '@/types/recipe';

export type MissingRequirementReason = 'missing' | 'insufficient';

export interface MissingRequirement {
  ingredientId: string;
  ingredientName: string;
  reason: MissingRequirementReason;
  requiredQuantity: number;
  availableQuantity: number;
  unit: string;
}

function getIngredientName(catalog: Ingredient[], ingredientId: string) {
  return catalog.find((ingredient) => ingredient.id === ingredientId)?.nome ?? ingredientId;
}

export function getRecipeMissingRequirements(
  recipe: Recipe,
  availableIngredients: AvailableIngredient[],
  ingredientCatalog: Ingredient[]
) {
  const issues: MissingRequirement[] = [];

  for (const required of recipe.ingredientes) {
    const available = availableIngredients.find(
      (ingredient) => ingredient.ingredientId === required.id
    );

    if (!available) {
      issues.push({
        ingredientId: required.id,
        ingredientName: getIngredientName(ingredientCatalog, required.id),
        reason: 'missing',
        requiredQuantity: required.quantidade,
        availableQuantity: 0,
        unit: required.unit,
      });
      continue;
    }

    if (available.unit !== required.unit || available.quantity < required.quantidade) {
      issues.push({
        ingredientId: required.id,
        ingredientName: getIngredientName(ingredientCatalog, required.id),
        reason: 'insufficient',
        requiredQuantity: required.quantidade,
        availableQuantity: available.quantity,
        unit: required.unit,
      });
    }
  }

  return issues;
}

export function canMakeRecipe(
  recipe: Recipe,
  availableIngredients: AvailableIngredient[],
  ingredientCatalog: Ingredient[]
) {
  return getRecipeMissingRequirements(recipe, availableIngredients, ingredientCatalog).length === 0;
}

export function getCompatibleRecipes(
  recipes: Recipe[],
  availableIngredients: AvailableIngredient[],
  ingredientCatalog: Ingredient[]
) {
  return recipes.filter((recipe) => canMakeRecipe(recipe, availableIngredients, ingredientCatalog));
}

export function describeMissingRequirement(requirement: MissingRequirement) {
  if (requirement.reason === 'missing') {
    return `${requirement.ingredientName} nao foi informado.`;
  }

  return `${requirement.ingredientName} insuficiente: precisa de ${requirement.requiredQuantity}${requirement.unit} e voce tem ${requirement.availableQuantity}${requirement.unit}.`;
}
