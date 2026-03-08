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

type FormErrors = {
    name?: string;
    cpf?: string;
    cnh_category?: string;
    phone?: string;
    general?: string;
};

type ConfirmModalData = {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    type: 'toggle' | 'delete';
};

const initialFormData: DriverFormData = {
    name: "",
    cpf: "",
    cnh_category: "C",
    phone: "",
    is_active: true,
};

function formatCpf(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    return digits
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 10) {
        return digits
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return digits
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
}

function validateForm(data: DriverFormData): FormErrors {
    const errors: FormErrors = {};
    const cpfDigits = data.cpf.replace(/\D/g, "");
    const phoneDigits = data.phone.replace(/\D/g, "");

    if (!data.name.trim()) {
        errors.name = "O nome é obrigatório.";
    } else if (data.name.trim().length < 3) {
        errors.name = "O nome deve ter pelo menos 3 caracteres.";
    }

    if (!data.cpf.trim()) {
        errors.cpf = "O CPF é obrigatório.";
    } else if (cpfDigits.length !== 11) {
        errors.cpf = "O CPF deve ter exatamente 11 números.";
    }

    if (!["A", "B", "C", "D", "E"].includes(data.cnh_category)) {
        errors.cnh_category = "A categoria da CNH deve ser A, B, C, D ou E.";
    }

    if (data.phone.trim() && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
        errors.phone = "O telefone deve ter entre 10 e 11 números.";
    }

    return errors;
}

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [formData, setFormData] = useState<DriverFormData>(initialFormData);
    const [editingDriverId, setEditingDriverId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [confirmModal, setConfirmModal] = useState<ConfirmModalData>({
        isOpen: false,
        title: "",
        message: "",
        confirmText: "",
        cancelText: "",
        onConfirm: () => {},
        type: 'toggle',
    });

    async function loadDrivers() {
        try {
            const data = await getDrivers();
            setDrivers(data);
        } catch {
            setErrorMessage("Não foi possível carregar os motoristas.");
        }
    }

    useEffect(() => {
        loadDrivers();
    }, []);

    function handleChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        const { name, value, type } = event.target;

        let finalValue: string | boolean =
            type === "checkbox"
                ? (event.target as HTMLInputElement).checked
                : value;

        if (name === "cpf" && typeof finalValue === "string") {
            finalValue = formatCpf(finalValue);
        }

        if (name === "phone" && typeof finalValue === "string") {
            finalValue = formatPhone(finalValue);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: finalValue,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
            general: "",
        }));

        setErrorMessage("");
        setSuccessMessage("");
    }

    function resetForm() {
        setFormData(initialFormData);
        setEditingDriverId(null);
        setErrors({});
        setErrorMessage("");
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const validationErrors = validateForm(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setErrorMessage("Corrija os campos destacados antes de continuar.");
            setSuccessMessage("");
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = editingDriverId
                ? await updateDriver(editingDriverId, formData)
                : await createDriver(formData);

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    const apiErrors: FormErrors = {};

                    if (data.errors.name) {
                        apiErrors.name = data.errors.name[0];
                    }

                    if (data.errors.cpf) {
                        apiErrors.cpf = data.errors.cpf[0];
                    }

                    if (data.errors.cnh_category) {
                        apiErrors.cnh_category = data.errors.cnh_category[0];
                    }

                    if (data.errors.phone) {
                        apiErrors.phone = data.errors.phone[0];
                    }

                    setErrors(apiErrors);
                    setErrorMessage("Existem campos inválidos. Revise os dados informados.");
                } else {
                    setErrorMessage(data.message || "Não foi possível salvar o motorista.");
                }

                return;
            }

            const wasEditing = editingDriverId !== null;

            resetForm();
            await loadDrivers();

            setSuccessMessage(
                wasEditing
                    ? "Motorista atualizado com sucesso."
                    : "Motorista cadastrado com sucesso."
            );
        } catch {
            setErrorMessage("Não foi possível conectar com a API. Verifique o servidor.");
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
        setErrors({});
        setErrorMessage("");
        setSuccessMessage("");
    }

    function openToggleModal(id: number) {
        const driver = drivers.find(d => d.id === id);
        if (!driver) return;

        const action = driver.is_active ? "inativar" : "ativar";
        
        setConfirmModal({
            isOpen: true,
            title: `${action === "inativar" ? "Inativar" : "Ativar"} motorista`,
            message: `Deseja realmente ${action} o motorista "${driver.name}"?`,
            confirmText: action === "inativar" ? "Sim, inativar" : "Sim, ativar",
            cancelText: "Cancelar",
            onConfirm: () => executeToggle(id),
            type: 'toggle',
        });
    }

    function openDeleteModal(id: number) {
        const driver = drivers.find(d => d.id === id);
        if (!driver) return;

        setConfirmModal({
            isOpen: true,
            title: "Excluir motorista",
            message: `Deseja realmente excluir o motorista "${driver.name}"? Esta ação não pode ser desfeita.`,
            confirmText: "Sim, excluir",
            cancelText: "Cancelar",
            onConfirm: () => executeDelete(id),
            type: 'delete',
        });
    }

    function closeModal() {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }

    async function executeToggle(id: number) {
        const driver = drivers.find(d => d.id === id);
        if (!driver) return;

        const action = driver.is_active ? "inativar" : "ativar";
        
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await toggleDriver(id);
            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(
                    data.message || `Não foi possível ${action} o motorista.`
                );
                closeModal();
                return;
            }

            await loadDrivers();
            setSuccessMessage(
                data.message || `Motorista ${action}do com sucesso.`
            );
            closeModal();
        } catch {
            setErrorMessage("Não foi possível conectar com a API. Verifique o servidor.");
            closeModal();
        }
    }

    async function executeDelete(id: number) {
        const driver = drivers.find(d => d.id === id);
        if (!driver) return;

        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await deleteDriver(id);
            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.message || "Não foi possível excluir o motorista.");
                closeModal();
                return;
            }

            await loadDrivers();
            setSuccessMessage(data.message || "Motorista excluído com sucesso.");
            closeModal();
        } catch {
            setErrorMessage("Não foi possível conectar com a API. Verifique o servidor.");
            closeModal();
        }
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
            {/* Modal de confirmação */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-fade-in">
                        <div className={`p-6 ${
                            confirmModal.type === 'delete' 
                                ? 'border-b border-red-100' 
                                : 'border-b border-amber-100'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${
                                    confirmModal.type === 'delete'
                                        ? 'bg-red-100'
                                        : confirmModal.title.includes('Inativar')
                                            ? 'bg-amber-100'
                                            : 'bg-emerald-100'
                                }`}>
                                    {confirmModal.type === 'delete' ? (
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    ) : confirmModal.title.includes('Inativar') ? (
                                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    {confirmModal.title}
                                </h3>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <p className="text-slate-600">
                                {confirmModal.message}
                            </p>
                        </div>

                        <div className="flex gap-3 p-6 pt-0">
                            <button
                                onClick={closeModal}
                                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                {confirmModal.cancelText}
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className={`flex-1 rounded-xl px-4 py-3 font-semibold text-white transition ${
                                    confirmModal.type === 'delete'
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : confirmModal.title.includes('Inativar')
                                            ? 'bg-amber-500 hover:bg-amber-600'
                                            : 'bg-emerald-500 hover:bg-emerald-600'
                                }`}
                            >
                                {confirmModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

                        <div className="mb-4 space-y-3">
                            {successMessage && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    {successMessage}
                                </div>
                            )}

                            {errorMessage && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {errorMessage}
                                </div>
                            )}
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
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${
                                        errors.name
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-200 focus:border-red-400 focus:ring-red-100"
                                    }`}
                                />
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-500">{errors.name}</p>
                                )}
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
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${
                                        errors.cpf
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-200 focus:border-red-400 focus:ring-red-100"
                                    }`}
                                />
                                {errors.cpf && (
                                    <p className="mt-2 text-sm text-red-500">{errors.cpf}</p>
                                )}
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
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${
                                        errors.cnh_category
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-200 focus:border-red-400 focus:ring-red-100"
                                    }`}
                                >
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                    <option value="E">E</option>
                                </select>
                                {errors.cnh_category && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {errors.cnh_category}
                                    </p>
                                )}
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
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${
                                        errors.phone
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-200 focus:border-red-400 focus:ring-red-100"
                                    }`}
                                />
                                {errors.phone && (
                                    <p className="mt-2 text-sm text-red-500">{errors.phone}</p>
                                )}
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
                                                            onClick={() => openToggleModal(driver.id)}
                                                            className={`rounded-lg px-3 py-2 text-xs font-semibold text-white transition ${
                                                                driver.is_active
                                                                    ? "bg-amber-500 hover:bg-amber-600"
                                                                    : "bg-emerald-500 hover:bg-emerald-600"
                                                            }`}
                                                        >
                                                            {driver.is_active ? "Inativar" : "Ativar"}
                                                        </button>

                                                        {!driver.is_active && (
                                                            <button
                                                                onClick={() => openDeleteModal(driver.id)}
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

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>  
        </div>
    );
}