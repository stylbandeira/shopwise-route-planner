import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Filter, Edit3, Trash2, Star, Plus, ArrowLeft, Trash, ArchiveRestore, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

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
  deleted_at: string;
}

type SortField = 'reputation' | 'points' | 'name' | 'created_at' | '';
type SortOrder = 'asc' | 'desc';

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [paginationMeta, setPaginationMeta] = useState<any>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [sortField, setSortField] = useState<SortField>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchUsers(1, search, filterStatus, filterType); // 🎯 BUSCA NOVAMENTE
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [search, filterStatus, filterType, sortField, sortOrder]);

  const fetchUsers = async (page: number = 1, searchTerm: string = search, status: string = filterStatus, type: string = filterType) => {
    try {
      setLoading(true);
      const params: any = { page };

      if (searchTerm) params.search = searchTerm;
      if (status !== "all") params.status = status;
      if (type !== "all") params.type = type;

      if (sortField) {
        params.sort_by = sortField;
        params.sort_order = sortOrder;
      }

      const response = await api.get("/admin/users", { params });
      if (response.data.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
      } else {
        setUsers([]);
      }

      setPaginationMeta(response.data.meta || {});

    } catch (error: any) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExport = async () => {
    try {

      const params: any = {};

      if (search) params.search = search;
      if (filterType !== "all") params.type = filterType;
      if (filterStatus !== "all") params.status = filterStatus;
      if (sortField) {
        params.sort_by = sortField;
        params.sort_order = sortOrder;
      }

      const response = await api.get("/admin/users/export", {
        responseType: 'blob',
        params: params
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar usuários:', error);
      alert('Erro ao exportar usuários');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const handleDelete = async (user: User) => {
    try {
      if (!(user.deleted_at === null || user.deleted_at === '')) {
        const response = await api.post(`admin/users/revertDeleted/${user.id}`);
      } else {
        const response = await api.delete(`admin/users/${user.id}`);
      }
      fetchUsers();
    } catch (error) {
      console.error('Erro ao deletar usuário', error);
    }
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      'client': 'Cliente',
      'company': 'Empresa',
      'admin': 'Administrador'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': 'default',
      'inactive': 'secondary',
      'suspended': 'destructive'
    };
    const labels = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'suspended': 'Suspenso'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
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
            <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie todos os usuários da plataforma
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>

          <Button
            onClick={() => navigate('/admin/users/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="client">Cliente</SelectItem>
                <SelectItem value="company">Empresa</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
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
                <SelectItem value="suspended">Suspenso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 hover:bg-transparent font-medium"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Usuário
                      {getSortIcon('name')}
                    </div>
                  </Button>
                </TableHead>
                <TableHead>

                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 hover:bg-transparent font-medium"
                    onClick={() => handleSort('points')}
                  >
                    <div className="flex items-center gap-1">
                      Pontos
                      {getSortIcon('points')}
                    </div>
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 hover:bg-transparent font-medium"
                    onClick={() => handleSort('reputation')}
                  >
                    <div className="flex items-center gap-1">
                      Reputação
                      {getSortIcon('reputation')}
                    </div>
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="p-0 hover:bg-transparent font-medium"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      Cadastro
                      {getSortIcon('created_at')}
                    </div>
                  </Button>
                </TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(user.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.type === 'client' ? user.points.toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-secondary text-secondary" />
                      <span>{user.reputation}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" disabled={user.deleted_at === null ? false : true}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" title={user.deleted_at === null ? "Excluir usuário" : "Restaurar usuário"}
                        size="icon"
                        onClick={() => handleDelete(user)}>
                        {user.deleted_at === null ? (
                          <Trash2 className="w-4 h-4" />
                        ) : (
                          <ArchiveRestore className="w-4 h-4" />
                        )}
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
  );
}