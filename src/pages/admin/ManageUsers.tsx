// src/pages/admin/ManageUsers.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Star, Edit3, Trash2, ArchiveRestore, Download, Plus, Mail, Calendar, UserCircle } from "lucide-react";
import api from "@/lib/api";
import { PageHeader } from "@/components/admin/PageHeader";
import { TableFilters } from "@/components/admin/TableFilters";
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface User {
  id: number;
  name: string;
  type: 'client' | 'company' | 'admin';
  email: string;
  cpf: string;
  points: number;
  reputation: number;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  deleted_at: string | null;
}

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [paginationMeta, setPaginationMeta] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const typeOptions = [
    { value: "client", label: "Cliente" },
    { value: "company", label: "Empresa" },
    { value: "admin", label: "Administrador" }
  ];

  const statusOptions = [
    { value: "active", label: "Ativo" },
    { value: "inactive", label: "Inativo" },
    { value: "suspended", label: "Suspenso" }
  ];

  useEffect(() => {
    fetchUsers();
  }, [search, filterType, filterStatus]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = { page };
      if (search) params.search = search;
      if (filterType !== "all") params.type = filterType;
      if (filterStatus !== "all") params.status = filterStatus;

      const response = await api.get("/admin/users", { params });
      setUsers(response.data.data || []);
      setPaginationMeta(response.data.meta);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    try {
      if (user.deleted_at) {
        await api.post(`admin/users/revertDeleted/${user.id}`);
      } else {
        await api.delete(`admin/users/${user.id}`);
      }
      fetchUsers();
    } catch (error) {
      console.error("Erro ao deletar/restaurar usuário:", error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get("/admin/users/export", {
        params: { search, type: filterType, status: filterStatus },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao exportar:", error);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      client: "bg-blue-100 text-blue-700",
      company: "bg-purple-100 text-purple-700",
      admin: "bg-red-100 text-red-700"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100";
  };

  const getStatusBadge = (status: string, deletedAt?: string | null) => {
    if (deletedAt) {
      return <Badge variant="secondary">Excluído</Badge>;
    }

    const variants = {
      active: { variant: "default" as const, label: "Ativo" },
      inactive: { variant: "secondary" as const, label: "Inativo" },
      suspended: { variant: "destructive" as const, label: "Suspenso" }
    };
    const config = variants[status as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase();
  };

  const columns = [
    { key: "name", header: "Usuário", className: "min-w-[200px]" },
    { key: "type", header: "Tipo", className: "w-24" },
    { key: "points", header: "Pontos", className: "w-20" },
    { key: "reputation", header: "Reputação", className: "w-24" },
    { key: "status", header: "Status", className: "w-24" },
    { key: "created_at", header: "Cadastro", className: "w-32" },
    { key: "actions", header: "Ações", className: "w-24 text-right" }
  ];

  const renderDesktopRow = (user: User) => ({
    name: (
      <div>
        <p className="font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
    ),
    type: <Badge variant="outline" className={getTypeColor(user.type)}>{user.type === 'client' ? 'Cliente' : user.type === 'company' ? 'Empresa' : 'Admin'}</Badge>,
    points: user.type === 'client' ? user.points.toLocaleString() : '-',
    reputation: (
      <div className="flex items-center gap-1">
        <Star className="w-3 h-3 fill-secondary text-secondary" />
        <span>{user.reputation}</span>
      </div>
    ),
    status: getStatusBadge(user.status, user.deleted_at),
    created_at: new Date(user.created_at).toLocaleDateString('pt-BR'),
    actions: (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" disabled={!!user.deleted_at} onClick={() => navigate(`/admin/users/edit/${user.id}`)} className="h-8 w-8">
          <Edit3 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(user)} className="h-8 w-8 text-destructive hover:text-destructive">
          {user.deleted_at ? <ArchiveRestore className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </div>
    )
  });

  const renderMobileCard = (user: User) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedUser(user)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className={getTypeColor(user.type)}>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold truncate">{user.name}</p>
                <Badge variant="outline" className={getTypeColor(user.type)}>
                  {user.type === 'client' ? 'Cliente' : user.type === 'company' ? 'Empresa' : 'Admin'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                {user.type === 'client' && (
                  <>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-secondary text-secondary" />
                      <span className="text-sm font-medium">{user.reputation}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{user.points.toLocaleString()} pts</span>
                  </>
                )}
                {getStatusBadge(user.status, user.deleted_at)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="Gerenciar Usuários"
        subtitle="Gerencie todos os usuários da plataforma"
        actions={[
          { label: "Exportar", icon: <Download className="w-4 h-4 sm:mr-2" />, onClick: handleExport, variant: "outline" },
          { label: "Novo Usuário", icon: <Plus className="w-4 h-4 sm:mr-2" />, onClick: () => navigate('/admin/users/new') }
        ]}
      />

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <TableFilters
            searchPlaceholder="Buscar por nome ou email..."
            searchValue={search}
            onSearchChange={setSearch}
            filters={[
              {
                key: "type",
                placeholder: "Tipo de usuário",
                value: filterType,
                onChange: setFilterType,
                options: typeOptions
              },
              {
                key: "status",
                placeholder: "Status",
                value: filterStatus,
                onChange: setFilterStatus,
                options: statusOptions
              }
            ]}
          />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Usuários ({paginationMeta?.total || users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveTable
            columns={columns}
            data={users}
            loading={loading}
            emptyMessage="Nenhum usuário encontrado"
            renderMobileCard={renderMobileCard}
          />
        </CardContent>
      </Card>

      <Sheet open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <SheetContent side="bottom" className="h-[90vh] sm:h-auto sm:max-w-lg sm:right-0 sm:top-0 sm:bottom-auto rounded-t-2xl sm:rounded-none">
          <SheetHeader>
            <SheetTitle>Detalhes do Usuário</SheetTitle>
          </SheetHeader>
          {selectedUser && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className={getTypeColor(selectedUser.type)}>{getInitials(selectedUser.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <Badge variant="outline" className={getTypeColor(selectedUser.type)}>
                    {selectedUser.type === 'client' ? 'Cliente' : selectedUser.type === 'company' ? 'Empresa' : 'Administrador'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedUser.email}</span>
                </div>
                {selectedUser.cpf && (
                  <div className="flex items-center gap-3 text-sm">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    <span>CPF: {selectedUser.cpf}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Cadastro: {new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {selectedUser.type === 'client' && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Pontos</p>
                        <p className="text-2xl font-bold">{selectedUser.points.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Reputação</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-secondary text-secondary" />
                          <span className="text-2xl font-bold">{selectedUser.reputation}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="border-t pt-4 flex gap-2">
                <Button className="flex-1" onClick={() => navigate(`/admin/users/edit/${selectedUser.id}`)} disabled={!!selectedUser.deleted_at}>
                  <Edit3 className="w-4 h-4 mr-2" /> Editar
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleDelete(selectedUser)}>
                  {selectedUser.deleted_at ? <ArchiveRestore className="w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  {selectedUser.deleted_at ? "Restaurar" : "Excluir"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}