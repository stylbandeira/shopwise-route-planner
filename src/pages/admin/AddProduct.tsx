import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useUser } from "@/contexts/UserContext";
import api from "@/lib/api";
import { useState } from "react";
import { ProductForm } from "@/components/forms/ProductForm";

export default function AddProduct() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: any) => {
        console.log('Dados do formulário:', formData);
        setIsSubmitting(true);
        try {
            console.log('Enviando para API...');
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

                await api.post("/admin/products", formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                const response = await api.post("/admin/products", formData);
                console.log('Resposta da API:', response);
            }

            navigate("/admin/products", {
                state: {
                    message: "Produto cadastrada com sucesso!",
                    type: "success"
                }
            });
        } catch (error) {
            console.error('Erro ao cadastrar produto:', error);
            console.error('Resposta do erro:', error.response);

            if (error.response?.data?.errors) {
                throw error;
            } else {
                alert('Erro ao cadastrar produto. Tente novamente.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuccess = () => {
        navigate("/admin/products", {
            state: { message: "Produto cadastrado com sucesso!" }
        });
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-6">
                <ProductForm
                    onSubmit={async (data) => {
                        await handleSubmit(data);
                        handleSuccess();
                    }}
                    onCancel={() => navigate("/admin/products")}
                />
            </div>
        </DashboardLayout>
    );
}