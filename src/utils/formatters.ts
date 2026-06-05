export function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDuration(minutes: number) {
  return `${minutes}min`;
}

export function formatServings(servings: number) {
  return `${servings} porç${servings > 1 ? 'ões' : 'ão'}`;
}

export function formatUnit(unit: string) {
  return unit;
}
