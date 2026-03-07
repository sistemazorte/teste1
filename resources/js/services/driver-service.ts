const API_URL = "http://127.0.0.1:8080/api/drivers";

export async function getDrivers() {
    const response = await fetch(API_URL);
    return response.json();
}

export async function createDriver(data: any) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return response.json();
}

export async function updateDriver(id: number, data: any) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return response.json();
}

export async function toggleDriver(id: number) {
    const response = await fetch(`${API_URL}/${id}/toggle`, {
        method: "PATCH",
    });

    return response.json();
}

export async function deleteDriver(id: number) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });

    return response.json();
}