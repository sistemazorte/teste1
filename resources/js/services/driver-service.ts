const API_URL = "http://127.0.0.1:8080/api/drivers";

export async function getDrivers() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Erro ao buscar motoristas.");
    }

    return response.json();
}

export async function createDriver(data: any) {
    return fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

export async function updateDriver(id: number, data: any) {
    return fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

export async function toggleDriver(id: number) {
    return fetch(`${API_URL}/${id}/toggle`, {
        method: "PATCH",
    });
}

export async function deleteDriver(id: number) {
    return fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });
}   