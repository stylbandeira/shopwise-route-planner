import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Search, Edit3, Trash2, Plus, ArrowLeft, Globe, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface Company {
    id: number;
    name: string;
    email: string;
    cnpj: string;
    website?: string;
    address: string;
    productsCount: number;
    webhookUrl?: string;
    plan: 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
}

export default function ManageCompanies() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterPlan, setFilterPlan] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            // Mock data for now
            setCompanies([
                {
                    id: 1,
                    name: "Supermercado Extra",
                    email: "contato@extra.com",
                    cnpj: "12.345.678/0001-90",
                    website: "https://extra.com.br",
                    address: "Av. Paulista, 1000 - São Paulo, SP",
                    productsCount: 2500,
                    webhookUrl: "https://api.extra.com.br/webhook",
                    plan: "premium",
                    status: "active",
                    createdAt: "2024-02-01"
                },
                {
                    id: 2,
                    name: "Mercado São José",
                    email: "contato@mercadosj.com",
                    cnpj: "98.765.432/0001-10",
                    address: "Rua das Flores, 123 - Rio de Janeiro, RJ",
                    productsCount: 850,
                    plan: "basic",
                    status: "active",
                    createdAt: "2024-01-20"
                }
            ]);
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(search.toLowerCase()) ||
            company.email.toLowerCase().includes(search.toLowerCase()) ||
            company.cnpj.includes(search);
        const matchesPlan = filterPlan === "all" || company.plan === filterPlan;
        const matchesStatus = filterStatus === "all" || company.status === filterStatus;

        return matchesSearch && matchesPlan && matchesStatus;
    });

    const getPlanLabel = (plan: string) => {
        const labels = {
            'basic': 'Básico',
            'premium': 'Premium',
            'enterprise': 'Enterprise'
        };
        return labels[plan as keyof typeof labels] || plan;
    };

    const getPlanBadge = (plan: string) => {
        const variants = {
            'basic': 'secondary',
            'premium': 'default',
            'enterprise': 'destructive'
        };

        return (
            <Badge variant={variants[plan as keyof typeof variants] as any}>
                {getPlanLabel(plan)}
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            'active': 'default',
            'inactive': 'secondary',
            'pending': 'outline'
        };
        const labels = {
            'active': 'Ativo',
            'inactive': 'Inativo',
            'pending': 'Pendente'
        };

        return (
            <Badge variant={variants[status as keyof typeof variants] as any}>
                {labels[status as keyof typeof labels]}
            </Badge>
        );
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/')}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Gerenciar Empresas</h1>
                            <p className="text-muted-foreground">
                                Gerencie todas as empresas cadastradas na plataforma
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/admin/companies/new')}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Empresa
                    </Button>
                </div>

                {/* Filtros */}
                <Card className="border-0 shadow-soft">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome, email ou CNPJ..."
                                    className="pl-10"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={filterPlan} onValueChange={setFilterPlan}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Plano" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os planos</SelectItem>
                                    <SelectItem value="basic">Básico</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                    <SelectItem value="enterprise">Enterprise</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os status</SelectItem>
                                    <SelectItem value="active">Ativo</SelectItem>
                                    <SelectItem value="inactive">Inativo</SelectItem>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabela de Empresas */}
                <Card className="border-0 shadow-soft">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Empresas ({filteredCompanies.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Empresa</TableHead>
                                    <TableHead>CNPJ</TableHead>
                                    <TableHead>Produtos</TableHead>
                                    <TableHead>Plano</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Cadastro</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCompanies.map((company) => (
                                    <TableRow key={company.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{company.name}</p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{company.email}</span>
                                                    {company.website && (
                                                        <>
                                                            <span>•</span>
                                                            <Globe className="w-3 h-3" />
                                                            <span>Site</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
                                                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                    <span>{company.address}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {company.cnpj}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{company.productsCount.toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell>{getPlanBadge(company.plan)}</TableCell>
                                        <TableCell>{getStatusBadge(company.status)}</TableCell>
                                        <TableCell>
                                            {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/companies/edit/${company.id}`)}>
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}