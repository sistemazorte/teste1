import { useEffect, useState } from "react";
import {
    getDrivers,
    toggleDriver,
    deleteDriver
} from "@/services/driver-service";

export default function DriversPage() {
    const [drivers, setDrivers] = useState([]);

    async function loadDrivers() {
        const data = await getDrivers();
        setDrivers(data);
    }

    useEffect(() => {
        loadDrivers();
    }, []);

    async function handleToggle(id: number) {
        await toggleDriver(id);
        loadDrivers();
    }

    async function handleDelete(id: number) {
        const confirmDelete = confirm("Deseja realmente excluir este motorista?");
        if (!confirmDelete) return;

        await deleteDriver(id);
        loadDrivers();
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Motoristas</h1>

            <table border={1} cellPadding={10} style={{ marginTop: "20px", width: "100%" }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Categoria</th>
                        <th>Telefone</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    {drivers.map((driver: any) => (
                        <tr key={driver.id}>
                            <td>{driver.id}</td>
                            <td>{driver.name}</td>
                            <td>{driver.cpf}</td>
                            <td>{driver.cnh_category}</td>
                            <td>{driver.phone}</td>
                            <td>{driver.is_active ? "Ativo" : "Inativo"}</td>

                            <td>
                                <button onClick={() => handleToggle(driver.id)}>
                                    {driver.is_active ? "Inativar" : "Ativar"}
                                </button>

                                {!driver.is_active && (
                                    <button
                                        style={{ marginLeft: "10px" }}
                                        onClick={() => handleDelete(driver.id)}
                                    >
                                        Excluir
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}