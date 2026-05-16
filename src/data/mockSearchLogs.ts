import type { SearchLog } from '@/types/favorite';

export const mockSearchLogs: SearchLog[] = [
  {
    id: 'log-1',
    userId: 'user-ana',
    ingredients: [
      { ingredientId: 'ovo', quantity: 4, unit: 'un' },
      { ingredientId: 'queijo', quantity: 100, unit: 'g' },
      { ingredientId: 'oleo', quantity: 20, unit: 'ml' },
    ],
    createdAt: '2026-04-17T19:30:00.000Z',
  },
  {
    id: 'log-2',
    userId: 'user-bruna',
    ingredients: [
      { ingredientId: 'arroz', quantity: 300, unit: 'g' },
      { ingredientId: 'ovo', quantity: 2, unit: 'un' },
      { ingredientId: 'sal', quantity: 10, unit: 'g' },
    ],
    createdAt: '2026-04-18T12:10:00.000Z',
  },
  {
    id: 'log-3',
    userId: 'user-ana',
    ingredients: [
      { ingredientId: 'farinha', quantity: 300, unit: 'g' },
      { ingredientId: 'leite', quantity: 400, unit: 'ml' },
      { ingredientId: 'ovo', quantity: 3, unit: 'un' },
    ],
    createdAt: '2026-04-18T18:25:00.000Z',
  },
];
