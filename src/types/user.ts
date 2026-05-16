export type UserRole = 'user' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface Session {
  userId: string;
}
