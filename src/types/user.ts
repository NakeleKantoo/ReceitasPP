export type UserRole = 'normal' | 'superadmin';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  account_type: UserRole;
  createdAt: string;
}

export interface Session {
  userId: string;
}
