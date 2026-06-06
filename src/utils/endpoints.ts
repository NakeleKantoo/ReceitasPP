import { getStoredSession, saveStoredSession, saveStoredUser } from '@/services/storageService';
import type { AdminDashboardStats, AdminReports } from '@/types/admin';
import type { Ingredient } from '@/types/ingredient';
import type { Recipe, RecipeStatus } from '@/types/recipe';
import type { User } from '@/types/user';
import { RECEITAS_API } from '@/utils/api';

interface AuthApiResponse {
  token: string;
  usuario: User;
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

export async function registerOnline(username: string, email: string, password: string) {
  const response = await fetch(`${RECEITAS_API.base_url}register`, {
    method: 'POST',
    headers: await buildHeaders(),
    body: JSON.stringify({ username, email, password }),
  });

  const payload = await parseResponse<AuthApiResponse>(response);
  await persistAuthPayload(payload);
  return payload.usuario;
}

export async function loginOnline(email: string, password: string) {
  const response = await fetch(`${RECEITAS_API.base_url}login`, {
    method: 'POST',
    headers: await buildHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const payload = await parseResponse<AuthApiResponse>(response);
  await persistAuthPayload(payload);
  return payload.usuario;
}

export async function fetchReceitas() {
  const response = await fetch(`${RECEITAS_API.base_url}receitas`, {
    method: 'GET',
    headers: await buildHeaders(true),
  });

  return parseResponse<Recipe[]>(response);
}

export async function fetchReceitaById(id: number | string) {
  const response = await fetch(`${RECEITAS_API.base_url}receitas/${id}`, {
    method: 'GET',
    headers: await buildHeaders(true),
  });

  return parseResponse<Recipe>(response);
}

export async function fetchIngredientes() {
  const response = await fetch(`${RECEITAS_API.base_url}ingredientes`, {
    method: 'GET',
    headers: await buildHeaders(true),
  });

  return parseResponse<Ingredient[]>(response);
}

export async function fetchAdminDashboard() {
  const response = await fetch(`${RECEITAS_API.base_url}admin/dashboard`, {
    method: 'GET',
    headers: await buildHeaders(true),
  });

  return parseResponse<AdminDashboardStats>(response);
}

export async function fetchAdminReports() {
  const response = await fetch(`${RECEITAS_API.base_url}admin/reports`, {
    method: 'GET',
    headers: await buildHeaders(true),
  });

  return parseResponse<AdminReports>(response);
}

export async function fetchAdminUsers() {
  const response = await fetch(`${RECEITAS_API.base_url}admin/users`, {
    method: 'GET',
    headers: await buildHeaders(true),
  });

  return parseResponse<User[]>(response);
}

export async function fetchAdminRecipes(status?: RecipeStatus) {
  const query = status ? `?status=${status}` : '';
  const response = await fetch(`${RECEITAS_API.base_url}admin/recipes${query}`, {
    method: 'GET',
    headers: await buildHeaders(true),
  });

  return parseResponse<Recipe[]>(response);
}

export async function updateAdminRecipeStatus(recipeId: number, status: RecipeStatus) {
  const response = await fetch(`${RECEITAS_API.base_url}admin/recipes/${recipeId}/status`, {
    method: 'PATCH',
    headers: await buildHeaders(true),
    body: JSON.stringify({ status }),
  });

  return parseResponse<Recipe>(response);
}

export async function deleteAdminRecipe(recipeId: number) {
  const response = await fetch(`${RECEITAS_API.base_url}admin/recipes/${recipeId}`, {
    method: 'DELETE',
    headers: await buildHeaders(true),
  });

  return parseResponse<{ id: number; message: string }>(response);
}
