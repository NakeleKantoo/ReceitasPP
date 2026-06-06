import { getStoredSession, saveStoredSession, saveStoredUser } from '@/services/storageService';
import type { AdminDashboardStats, AdminReports } from '@/types/admin';
import type { Ingredient } from '@/types/ingredient';
import type { CreateRecipePayload, Recipe, RecipeStatus } from '@/types/recipe';
import type { User } from '@/types/user';
import { RECEITAS_API } from '@/utils/api';

interface AuthApiResponse {
  token: string;
  usuario: User;
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  withAuth?: boolean;
  body?: unknown;
}

async function buildHeaders(withAuth = false) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (withAuth) {
    const session = await getStoredSession();

    if (session?.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }
  }

  return headers;
}

async function parseResponse<T>(response: Response) {
  if (!response.ok) {
    let message = 'Nao foi possivel concluir a requisicao.';

    try {
      const errorBody = (await response.json()) as { message?: string };
      if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Mantem a mensagem padrao quando o backend nao retorna JSON valido.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

async function persistAuthPayload(payload: AuthApiResponse) {
  await Promise.all([
    saveStoredSession({ token: payload.token }),
    saveStoredUser(payload.usuario),
  ]);
}

async function requestJson<T>(path: string, options: RequestOptions) {
  const url = `${RECEITAS_API.base_url}${path}`;

  try {
    const response = await fetch(url, {
      method: options.method,
      headers: await buildHeaders(options.withAuth),
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    return await parseResponse<T>(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Falha de rede ao acessar ${url}. Verifique se o backend esta ativo e se a URL da API esta acessivel a partir do Android.`
      );
    }

    throw error;
  }
}

export async function registerOnline(username: string, email: string, password: string) {
  const payload = await requestJson<AuthApiResponse>('register', {
    method: 'POST',
    body: { username, email, password },
  });
  await persistAuthPayload(payload);
  return payload.usuario;
}

export async function loginOnline(email: string, password: string) {
  const payload = await requestJson<AuthApiResponse>('login', {
    method: 'POST',
    body: { email, password },
  });
  await persistAuthPayload(payload);
  return payload.usuario;
}

export async function fetchCurrentUser() {
  return await requestJson<User>('auth/me', {
    method: 'GET',
    withAuth: true,
  });
}

export async function fetchReceitas() {
  return await requestJson<Recipe[]>('receitas', {
    method: 'GET',
    withAuth: true,
  });
}

export async function fetchReceitaById(id: number | string) {
  return await requestJson<Recipe>(`receitas/${id}`, {
    method: 'GET',
    withAuth: true,
  });
}

export async function createRecipeOnline(payload: CreateRecipePayload) {
  return await requestJson<Recipe>('receitas', {
    method: 'POST',
    withAuth: true,
    body: payload,
  });
}

export async function fetchIngredientes() {
  return await requestJson<Ingredient[]>('ingredientes', {
    method: 'GET',
    withAuth: true,
  });
}

export async function fetchAdminDashboard() {
  return await requestJson<AdminDashboardStats>('admin/dashboard', {
    method: 'GET',
    withAuth: true,
  });
}

export async function fetchAdminReports() {
  return await requestJson<AdminReports>('admin/reports', {
    method: 'GET',
    withAuth: true,
  });
}

export async function fetchAdminUsers() {
  return await requestJson<User[]>('admin/users', {
    method: 'GET',
    withAuth: true,
  });
}

export async function fetchAdminRecipes(status?: RecipeStatus) {
  const query = status ? `?status=${status}` : '';
  return await requestJson<Recipe[]>(`admin/recipes${query}`, {
    method: 'GET',
    withAuth: true,
  });
}

export async function updateAdminRecipeStatus(recipeId: number, status: RecipeStatus) {
  return await requestJson<Recipe>(`admin/recipes/${recipeId}/status`, {
    method: 'PATCH',
    withAuth: true,
    body: { status },
  });
}

export async function deleteAdminRecipe(recipeId: number) {
  return await requestJson<{ id: number; message: string }>(`admin/recipes/${recipeId}`, {
    method: 'DELETE',
    withAuth: true,
  });
}
