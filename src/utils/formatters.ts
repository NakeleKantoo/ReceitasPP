export function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export const recipeCategoryOptions = [
  { label: 'Café da manhã', value: 'Cafe da manha' },
  { label: 'Almoço', value: 'Almoco' },
  { label: 'Jantar', value: 'Jantar' },
  { label: 'Lanche', value: 'Lanche' },
  { label: 'Sobremesa', value: 'Sobremesa' },
  { label: 'Bebida', value: 'Bebida' },
] as const;

const recipeCategoryLabels = Object.fromEntries(
  recipeCategoryOptions.map((option) => [option.value, option.label])
);

export function formatDuration(minutes: number) {
  return `${minutes} min`;
}

export function formatServings(servings: number) {
  return `${servings} ${servings > 1 ? 'porções' : 'porção'}`;
}

export function formatMealCategory(category: string) {
  return recipeCategoryLabels[category] ?? category;
}

export function formatUnit(unit: string) {
  return unit;
}
