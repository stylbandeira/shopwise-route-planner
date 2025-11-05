// components/forms/CompanyForm.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormLayout } from "./FormLayout";
import { FormInput, FormSelect } from "./FormFields";
import { Building2 } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { FormSearchSelect } from "./FormSearchSelect";
import api from "@/lib/api";
import { MultiSelectSearch } from "../oiai_ui/MultiSelectSearch";

interface UserFormData {
    name: string;
    type: "client" | "admin" | "company";
    email: string;
    cpf: string;
    status: "active" | "inactive" | "suspended";
    companies: number[];
}

interface UserFormProps {
    initialData?: UserFormData;
    onSubmit: (data: UserFormData) => Promise<void>;
    onCancel?: () => void;
    isEditing?: boolean;
    isLoading?: boolean;
}

const defaultUserData: UserFormData = {
    name: "",
    type: "client",
    email: "",
    cpf: "",
    status: "active",
    companies: [],
};

export function UserForm({
    initialData = defaultUserData,
    onSubmit,
    onCancel,
    isEditing = false,
    isLoading = false
}: UserFormProps) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<UserFormData>(initialData);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

    const statusOptions = [
        { value: "active", label: "Ativo" },
        { value: "inactive", label: "Inativo" },
        { value: "suspended", label: "Suspenso" },
    ];

    const typeOptions = [
        { value: "client", label: "Usuário Comum" },
        { value: "company", label: "Empresa" },
        { value: "admin", label: "Administrador" },
    ];

    const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);

    const isCompanyType = formData.type === 'company';

    useEffect(() => {

        if (isEditing) {
            const companyIds = formData.companies.map(comp => comp.id);
            handleCompaniesChange(companyIds);
        }

        const loadData = async () => {
            setIsLoadingCompanies(true);

            try {
                const [companiesRes] = await Promise.all([
                    api.get("/admin/companies"),
                ]);

                setCompanies(companiesRes.data.data);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setIsLoadingCompanies(false);
            }
        };

        loadData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCompaniesChange = (companyIds: number[]) => {
        setFormData(prev => ({ ...prev, companies: companyIds }));
    };

    const handleTypeChange = (type: string) => {
        const newType = type as "client" | "admin" | "company";

        setFormData(prev => ({
            ...prev,
            type: newType,
            companies: newType === 'company' ? prev.companies : []
        }));
    };

    const handleStatusChange = (status: string) => {
        setFormData(prev => ({
            ...prev,
            status: status as "active" | "inactive" | "suspended"
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const submitData = { ...formData };
            if (!isCompanyType) {
                submitData.companies = [];
            }

            await onSubmit(submitData);
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormLayout
            title={isEditing ? "Editar Usuário" : "Novo Usuário"}
            subtitle={isEditing ? "Atualize os dados da usuário" : "Cadastre uma novo usuário no sistema"}
            icon={<Building2 className="w-6 h-6" />}
            onSave={handleSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
            saveButtonText={isEditing ? "Atualizar Usuário" : "Cadastrar Usuário"}
        >
            {errors.general && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                    <p className="text-destructive text-sm">{errors.general[0]}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coluna 1 */}
                <div className="space-y-4">

                    <FormInput
                        label="Nome do Usuário"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Digite o nome do produto"
                        required
                        disabled={isLoading}
                        error={errors.name?.[0]}
                    />

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <FormInput
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                                error={errors.email?.[0]}
                            />
                        </div>
                    </div>

                    <FormInput
                        label="CPF"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        error={errors.cpf?.[0]}
                    />
                </div>

                {/* Coluna 2 */}
                <div className="space-y-4">

                    <FormSelect
                        label="Tipo de Usuário"
                        name="type"
                        value={formData.type}
                        onValueChange={handleTypeChange}
                        options={typeOptions}
                        placeholder="Selecione o tipo"
                        required
                        disabled={isLoading}
                        error={errors.type?.[0]}
                    />

                    <FormSelect
                        label="Status"
                        name="status"
                        value={formData.status}
                        onValueChange={handleStatusChange}
                        options={statusOptions}
                        placeholder="Selecione o status"
                        required
                        disabled={isLoading}
                        error={errors.status?.[0]}
                    />

                    {isCompanyType && (
                        <MultiSelectSearch
                            label="Empresas"
                            value={formData.companies}
                            onChange={handleCompaniesChange}
                            options={companies}
                            isLoading={isLoadingCompanies}
                            error={errors.companies?.[0]}
                            placeholder="Digite para buscar empresas..."
                            disabled={isLoading}
                        />
                    )}
                </div>
            </div>
        </FormLayout >
    );
}