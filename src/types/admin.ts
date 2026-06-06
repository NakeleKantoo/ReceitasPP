import type { RecipeStatus } from '@/types/recipe';

export interface MetricEntry {
  label: string;
  value: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalRecipes: number;
  pendingRecipes: number;
  approvedRecipes: number;
  rejectedRecipes: number;
  topCategories: MetricEntry[];
  recipesByStatus: MetricEntry[];
}

export interface AdminReports {
  categories: MetricEntry[];
  authors: MetricEntry[];
  statuses: MetricEntry[];
}

export interface RecipeStatusUpdateInput {
  status: RecipeStatus;
}
