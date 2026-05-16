import type { RecipeStatus } from '@/types/recipe';

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDuration(minutes: number) {
  return `${minutes} min`;
}

export function formatServings(servings: number) {
  return `${servings} porcao${servings > 1 ? 'es' : ''}`;
}

export function formatStatus(status: RecipeStatus) {
  const labels: Record<RecipeStatus, string> = {
    pending: 'Pendente',
    approved: 'Aprovada',
    rejected: 'Rejeitada',
  };

  return labels[status];
}

export function formatUnit(unit: string) {
  const labels: Record<string, string> = {
    g: 'g',
    ml: 'ml',
    un: 'un',
  };

  return labels[unit] ?? unit;
}
