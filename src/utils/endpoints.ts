import { saveStoredSession } from "@/services/storageService";
import { User } from "@/types/user";
import { RECEITAS_API } from "@/utils/api";

export async function registerOnline(username:string, email:string, password:string) {
    const endpoint = RECEITAS_API.base_url + 'register';
    console.log("Executando requisição para: ", endpoint);

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username, email, password})
    });

    if (res.ok) {
        const obj = await res.json();
        saveStoredSession({userId: 'Bearer ' + obj.token});
        console.log(obj)
        return obj.usuario as User;
    }
    return null;
}