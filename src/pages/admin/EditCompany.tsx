import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CompanyForm } from "@/components/forms/CompanyForm";
import { useUser } from "@/contexts/UserContext";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { formatCNPJ } from "@/utils/formatters";
import { getFullImageUrl } from "@/utils/urlUtils";

export default function EditCompany() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useUser();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCompany();
    }, [id]);

    const fetchCompany = async () => {
        try {
            const response = await api.get(`/admin/companies/${id}`);

            const logoUrl = getFullImageUrl(response.data.data.img);

            setCompany({
                ...response.data.data,
                cnpj: formatCNPJ(response.data.data.cnpj),
                img: logoUrl // Sobrescreve com URL completa
            });

            console.log(logoUrl)

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
        console.log('📤 Dados para atualização:', formData);
        setIsSubmitting(true);

        try {
            if (formData.img instanceof File) {
                const formDataToSend = new FormData();

                Object.entries(formData).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        if (value instanceof File) {
                            formDataToSend.append(key, value);
                        } else {
                            formDataToSend.append(key, value.toString());
                        }
                    }
                });

                formDataToSend.append('_method', 'PUT');

                const response = await api.post(`/admin/companies/${id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                console.log('Empresa atualizada com imagem:', response.data);
            } else {
                // Sem imagem nova, envia JSON normal
                const response = await api.put(`/admin/companies/${id}`, formData);
                console.log('✅ Empresa atualizada:', response.data);
            }

            navigate("/admin/companies", {
                state: {
                    message: "Empresa atualizada com sucesso!",
                    type: "success"
                }
            });
        } catch (error) {
            console.error('❌ Erro ao atualizar empresa:', error);

            // Se for erro de validação, relança para o CompanyForm tratar
            if (error.response?.data?.errors) {
                throw error;
            } else {
                alert('Erro ao atualizar empresa. Tente novamente.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/companies');
    }

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
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isEditing={true}
                    isLoading={isSubmitting}
                />
            </div>
        </DashboardLayout>
    );
}