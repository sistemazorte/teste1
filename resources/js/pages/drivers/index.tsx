import { FormEvent, useEffect, useState } from "react";
import {
    getDrivers,
    createDriver,
    updateDriver,
    toggleDriver,
    deleteDriver,
} from "@/services/driver-service";

type Driver = {
    id: number;
    name: string;
    cpf: string;
    cnh_category: string;
    phone: string;
    is_active: boolean;
};

type DriverFormData = {
    name: string;
    cpf: string;
    cnh_category: string;
    phone: string;
    is_active: boolean;
};

const initialFormData: DriverFormData = {
    name: "",
    cpf: "",
    cnh_category: "C",
    phone: "",
    is_active: true,
};

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [formData, setFormData] = useState<DriverFormData>(initialFormData);
    const [editingDriverId, setEditingDriverId] = useState<number | null>(null);

    async function loadDrivers() {
        const data = await getDrivers();
        setDrivers(data);
    }

    useEffect(() => {
        loadDrivers();
    }, []);

    function handleChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        const { name, value, type } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (event.target as HTMLInputElement).checked
                    : value,
        }));
    }

    function resetForm() {
        setFormData(initialFormData);
        setEditingDriverId(null);
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (editingDriverId) {
            await updateDriver(editingDriverId, formData);
        } else {
            await createDriver(formData);
        }

        resetForm();
        loadDrivers();
    }

    function handleEdit(driver: Driver) {
        setEditingDriverId(driver.id);
        setFormData({
            name: driver.name,
            cpf: driver.cpf,
            cnh_category: driver.cnh_category,
            phone: driver.phone ?? "",
            is_active: driver.is_active,
        });
    }

    async function handleToggle(id: number) {
        const confirmToggle = confirm("Deseja alterar o status deste motorista?");
        if (!confirmToggle) return;

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

            <form
                onSubmit={handleSubmit}
                style={{
                    marginTop: "20px",
                    marginBottom: "30px",
                    display: "grid",
                    gap: "10px",
                    maxWidth: "500px",
                }}
            >
                <input
                    type="text"
                    name="name"
                    placeholder="Nome"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="cpf"
                    placeholder="CPF"
                    value={formData.cpf}
                    onChange={handleChange}
                    required
                />

                <select
                    name="cnh_category"
                    value={formData.cnh_category}
                    onChange={handleChange}
                    required
                >
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                </select>

                <input
                    type="text"
                    name="phone"
                    placeholder="Telefone"
                    value={formData.phone}
                    onChange={handleChange}
                />

                <label>
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                    />
                    Ativo
                </label>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit">
                        {editingDriverId ? "Atualizar motorista" : "Cadastrar motorista"}
                    </button>

                    {editingDriverId && (
                        <button type="button" onClick={resetForm}>
                            Cancelar edição
                        </button>
                    )}
                </div>
            </form>

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
                    {drivers.map((driver) => (
                        <tr key={driver.id}>
                            <td>{driver.id}</td>
                            <td>{driver.name}</td>
                            <td>{driver.cpf}</td>
                            <td>{driver.cnh_category}</td>
                            <td>{driver.phone}</td>
                            <td>{driver.is_active ? "Ativo" : "Inativo"}</td>

                            <td>
                                <button onClick={() => handleEdit(driver)}>Editar</button>

                                <button
                                    style={{ marginLeft: "10px" }}
                                    onClick={() => handleToggle(driver.id)}
                                >
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