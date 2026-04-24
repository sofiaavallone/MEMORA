const API_URL = "http://localhost:3001/api";

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
};

type AuthResponse = {
    user: AuthUser;
    token: string;
};

export async function registerUser(data: {
    name: string;
    email: string;
    password: string;
}) : Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Erro ao criar conta.");
    }

    return result;
}

export async function loginUser(data: {
    email: string;
    password: string;
}) : Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Erro ao fazer login.");
    }

    return result;
}