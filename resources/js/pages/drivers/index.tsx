import { FormEvent, useEffect, useMemo, useState } from "react";
import {
    createDriver,
    deleteDriver,
    getDrivers,
    toggleDriver,
    updateDriver,
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
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setIsSubmitting(true);

        try {
            if (editingDriverId) {
                await updateDriver(editingDriverId, formData);
            } else {
                await createDriver(formData);
            }

            resetForm();
            await loadDrivers();
        } finally {
            setIsSubmitting(false);
        }
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

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleToggle(id: number) {
        const confirmToggle = confirm("Deseja alterar o status deste motorista?");
        if (!confirmToggle) return;

        await toggleDriver(id);
        await loadDrivers();
    }

    async function handleDelete(id: number) {
        const confirmDelete = confirm("Deseja realmente excluir este motorista?");
        if (!confirmDelete) return;

        await deleteDriver(id);
        await loadDrivers();
    }

    const filteredDrivers = useMemo(() => {
        return drivers.filter((driver) => {
            const matchesSearch =
                driver.name.toLowerCase().includes(search.toLowerCase()) ||
                driver.cpf.includes(search) ||
                driver.phone?.includes(search);

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && driver.is_active) ||
                (statusFilter === "inactive" && !driver.is_active);

            return matchesSearch && matchesStatus;
        });
    }, [drivers, search, statusFilter]);

    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter((driver) => driver.is_active).length;
    const inactiveDrivers = drivers.filter((driver) => !driver.is_active).length;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl px-6 py-10">
                <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-red-500 to-emerald-500 px-8 py-10 text-white shadow-xl">
                    <div className="max-w-3xl">
                        <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-sm font-medium backdrop-blur">
                            Painel de motoristas
                        </span>

                        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                            Gerencie os motoristas da sua transportadora com mais controle
                        </h1>

                        <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg">
                            Cadastre, edite, ative, inative e acompanhe rapidamente os
                            motoristas em uma interface mais organizada e moderna.
                        </p>
                    </div>
                </section>

                <section className="mt-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <p className="text-sm font-medium text-slate-500">
                            Total de motoristas
                        </p>
                        <h2 className="mt-2 text-3xl font-bold text-slate-900">
                            {totalDrivers}
                        </h2>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <p className="text-sm font-medium text-slate-500">Motoristas ativos</p>
                        <h2 className="mt-2 text-3xl font-bold text-emerald-600">
                            {activeDrivers}
                        </h2>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <p className="text-sm font-medium text-slate-500">
                            Motoristas inativos
                        </p>
                        <h2 className="mt-2 text-3xl font-bold text-red-500">
                            {inactiveDrivers}
                        </h2>
                    </div>
                </section>

                <section className="mt-8 grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {editingDriverId ? "Editar motorista" : "Novo motorista"}
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Preencha os dados para cadastrar ou atualizar um motorista.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Nome
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Digite o nome completo"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="cpf"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    CPF
                                </label>
                                <input
                                    id="cpf"
                                    type="text"
                                    name="cpf"
                                    placeholder="000.000.000-00"
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="cnh_category"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Categoria da CNH
                                </label>
                                <select
                                    id="cnh_category"
                                    name="cnh_category"
                                    value={formData.cnh_category}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                                >
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                    <option value="E">E</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Telefone
                                </label>
                                <input
                                    id="phone"
                                    type="text"
                                    name="phone"
                                    placeholder="(11) 99999-9999"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                                />
                            </div>

                            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="h-4 w-4 rounded border-slate-300"
                                />
                                Motorista ativo
                            </label>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting
                                        ? "Salvando..."
                                        : editingDriverId
                                          ? "Atualizar motorista"
                                          : "Cadastrar motorista"}
                                </button>

                                {editingDriverId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    Lista de motoristas
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Visualize e gerencie os registros cadastrados.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 md:flex-row">
                                <input
                                    type="text"
                                    placeholder="Buscar por nome, CPF ou telefone"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 md:w-72"
                                />

                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                                >
                                    <option value="all">Todos</option>
                                    <option value="active">Ativos</option>
                                    <option value="inactive">Inativos</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full border-separate border-spacing-y-3">
                                <thead>
                                    <tr className="text-left text-sm text-slate-500">
                                        <th className="px-4 py-2 font-semibold">ID</th>
                                        <th className="px-4 py-2 font-semibold">Nome</th>
                                        <th className="px-4 py-2 font-semibold">CPF</th>
                                        <th className="px-4 py-2 font-semibold">Categoria</th>
                                        <th className="px-4 py-2 font-semibold">Telefone</th>
                                        <th className="px-4 py-2 font-semibold">Status</th>
                                        <th className="px-4 py-2 font-semibold">Ações</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredDrivers.length > 0 ? (
                                        filteredDrivers.map((driver) => (
                                            <tr
                                                key={driver.id}
                                                className="rounded-2xl bg-slate-50 text-sm text-slate-700 shadow-sm"
                                            >
                                                <td className="rounded-l-2xl px-4 py-4 font-semibold text-slate-900">
                                                    {driver.id}
                                                </td>
                                                <td className="px-4 py-4 font-medium">
                                                    {driver.name}
                                                </td>
                                                <td className="px-4 py-4">{driver.cpf}</td>
                                                <td className="px-4 py-4">
                                                    <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                                                        {driver.cnh_category}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {driver.phone || "-"}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                            driver.is_active
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-red-100 text-red-700"
                                                        }`}
                                                    >
                                                        {driver.is_active ? "Ativo" : "Inativo"}
                                                    </span>
                                                </td>
                                                <td className="rounded-r-2xl px-4 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() => handleEdit(driver)}
                                                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white"
                                                        >
                                                            Editar
                                                        </button>

                                                        <button
                                                            onClick={() => handleToggle(driver.id)}
                                                            className={`rounded-lg px-3 py-2 text-xs font-semibold text-white transition ${
                                                                driver.is_active
                                                                    ? "bg-amber-500 hover:bg-amber-600"
                                                                    : "bg-emerald-500 hover:bg-emerald-600"
                                                            }`}
                                                        >
                                                            {driver.is_active
                                                                ? "Inativar"
                                                                : "Ativar"}
                                                        </button>

                                                        {!driver.is_active && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(driver.id)
                                                                }
                                                                className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
                                                            >
                                                                Excluir
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-4 py-10 text-center text-sm text-slate-500"
                                            >
                                                Nenhum motorista encontrado com os filtros atuais.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}