import type { SearchLog } from '@/types/favorite';

export const mockSearchLogs: SearchLog[] = [
  {
    id: 'log-1',
    userId: 2,
    ingredients: [
      { ingredientId: 3, quantity: 4, unit: 'un' },
      { ingredientId: 7, quantity: 100, unit: 'g' },
      { ingredientId: 12, quantity: 20, unit: 'ml' },
    ],
    createdAt: '2026-04-17T19:30:00.000Z',
  },
  {
    id: 'log-2',
    userId: 3,
    ingredients: [
      { ingredientId: 1, quantity: 300, unit: 'g' },
      { ingredientId: 3, quantity: 2, unit: 'un' },
      { ingredientId: 11, quantity: 10, unit: 'g' },
    ],
    createdAt: '2026-04-18T12:10:00.000Z',
  },
  {
    id: 'log-3',
    userId: 2,
    ingredients: [
      { ingredientId: 5, quantity: 300, unit: 'g' },
      { ingredientId: 4, quantity: 400, unit: 'ml' },
      { ingredientId: 3, quantity: 3, unit: 'un' },
    ],
    createdAt: '2026-04-18T18:25:00.000Z',
  },
];
