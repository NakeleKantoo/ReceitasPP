import { getStoredSession, saveStoredSession, saveStoredUser } from "@/services/storageService";
import { Recipe } from "@/types/recipe";
import { User } from "@/types/user";
import { RECEITAS_API } from "@/utils/api";

export async function registerOnline(username: string, email: string, password: string) {
    const endpoint = RECEITAS_API.base_url + 'register';
    console.log("Executando requisição para: ", endpoint);

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password })
    });

    if (res.ok) {
        const obj = await res.json();
        saveStoredSession({ userId: 'Bearer ' + obj.token });
        saveStoredUser(obj.usuario as User);
        return obj.usuario as User;
    }
    return null;
}

export async function loginOnline(email: string, password: string) {
    const endpoint = RECEITAS_API.base_url + 'login';
    console.log("Executando requisição para: ", endpoint);

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        const obj = await res.json();
        saveStoredSession({ userId: 'Bearer ' + obj.token });
        saveStoredUser(obj.usuario as User);
        return obj.usuario as User;
    }
    return null;
}

export async function fetchReceitas() {
    const endpoint = RECEITAS_API.base_url + 'receitas';
    console.log("Executando requisição para: ", endpoint);

    const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer' + (await getStoredSession())?.userId
        },
    });

    if (res.ok) {
        const obj = await res.json();
        
        
        return obj as Recipe[];
    }
    return null;
}

export async function fetchReceitaById(id: string) {
    const endpoint = RECEITAS_API.base_url + 'receitas/' + id;
    console.log("Executando requisição para: ", endpoint);

    const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer' + (await getStoredSession())?.userId
        },
    });

    if (res.ok) {
        const obj = await res.json();
        return obj as Recipe;
    }
    return null;
}