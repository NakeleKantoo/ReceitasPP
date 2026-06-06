export type UserRole = 'normal' | 'superadmin';

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  account_type: UserRole;
}

export interface User {
  id: number;
  username: string;
  email: string;
  account_type: UserRole;
  createdAt: string;
}

export interface Session {
  token: string;
}
