// pages/admin/EditCompany.tsx
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CompanyForm } from "@/components/forms/CompanyForm";
import { useUser } from "@/contexts/UserContext";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { formatCNPJ } from "@/utils/formatters";

export default function EditCompany() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useUser();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompany();
    }, [id]);

    const fetchCompany = async () => {
        try {
            const response = await api.get(`/admin/companies/${id}`);
            setCompany({
                ...response.data,
                cnpj: formatCNPJ(response.data.cnpj) // Formata o CNPJ para exibição
            });
        } catch (error) {
            console.error('Erro ao carregar empresa:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.type !== 'admin') {
        navigate('/');
        return null;
    }

    const handleSubmit = async (formData: any) => {
        await api.put(`/admin/companies/${id}`, formData);
    };

    const handleSuccess = () => {
        navigate("/admin/companies", {
            state: { message: "Empresa atualizada com sucesso!" }
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="container mx-auto px-4 py-6">Carregando...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-6">
                <CompanyForm
                    initialData={company}
                    onSubmit={async (data) => {
                        await handleSubmit(data);
                        handleSuccess();
                    }}
                    onCancel={() => navigate("/admin/companies")}
                    isEditing={true}
                />
            </div>
        </DashboardLayout>
    );
}