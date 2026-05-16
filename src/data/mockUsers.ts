import type { User } from '@/types/user';

export const DEMO_USER_EMAIL = 'ana@receitaspp.com';
export const DEMO_USER_PASSWORD = '123456';
export const DEMO_ADMIN_EMAIL = 'admin@receitaspp.com';
export const DEMO_ADMIN_PASSWORD = 'admin123';

export const mockUsers: User[] = [
  {
    id: 'user-ana',
    name: 'Ana Souza',
    email: DEMO_USER_EMAIL,
    password: DEMO_USER_PASSWORD,
    role: 'user',
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'admin-root',
    name: 'Carlos Admin',
    email: DEMO_ADMIN_EMAIL,
    password: DEMO_ADMIN_PASSWORD,
    role: 'superadmin',
    createdAt: '2026-02-20T09:30:00.000Z',
  },
  {
    id: 'user-bruna',
    name: 'Bruna Lima',
    email: 'bruna@receitaspp.com',
    password: '123456',
    role: 'user',
    createdAt: '2026-03-12T08:15:00.000Z',
  },
];
