import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Package, Search, Edit3, Trash2, Plus, ArrowLeft,
  Upload, Download, CheckCircle, XCircle, Image as ImageIcon,
  CheckCheck, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CustomPagination } from "@/components/oiai_ui/CustomPagination";
import { CSVUploader } from "@/components/oiai_ui/CSVUploader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  brand?: string;
  description?: string;
  average_price: number;
  img?: string;
  validated: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  description: string;
}

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

interface ProductCounts {
  total: number;
  pendentes: number;
  validados: number;
}

export default function ManageProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [counts, setCounts] = useState<ProductCounts>({
    total: 0,
    pendentes: 0,
    validados: 0
  });

  // Estado para abas
  const [activeTab, setActiveTab] = useState<string>("todos");

  // Estado para seleção em massa
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Estado para diálogo de confirmação
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationAction, setValidationAction] = useState<"validate" | "invalidate">("validate");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchProducts(1, search, filterCategory, filterStatus);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [search, filterCategory, filterStatus, activeTab]);

  // Efeito para resetar seleção quando mudar de aba
  useEffect(() => {
    setSelectedProducts([]);
    setSelectAll(false);
  }, [activeTab]);

  const fetchProducts = async (
    page: number = 1,
    searchTerm: string = search,
    category: string = filterCategory,
    status: string = filterStatus,
    statusTab: string = activeTab
  ) => {
    try {
      setLoading(true);
      const params: any = { page };

      if (searchTerm) params.search = searchTerm;
      if (category !== "all") params.category = category;
      if (status !== "all") params.validated = status;

      if (statusTab === "pendentes") {
        params.validated = false;
      } else if (statusTab === "validados") {
        params.validated = true;
      }

      const response = await api.get("/admin/products", { params });
      setProducts(response.data.data);
      setPaginationMeta(response.data.meta);
      setCounts(response.data.counts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handlePageChange = (page: number, searchTerm: string, status: string, category: string) => {
    fetchProducts(page, searchTerm, category, status, activeTab);
    window.scrollTo(0, 0);
  };

  const handlePaginationChange = (page: number, searchTerm: string, status: string) => {
    handlePageChange(page, searchTerm, status, filterCategory);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await api.delete(`/admin/products/${productId}`);
      fetchProducts();
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      alert('Erro ao excluir produto');
    }
  };

  const handleBulkUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("admin/products/import", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    return response.data;
  };

  const handleExport = async () => {
    try {
      const response = await api.get("/admin/products/export", {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'produtos.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao exportar produtos:', error);
    }
  };

  // Funções para seleção em massa
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => {
      const newSelected = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];

      // Verifica se todos estão selecionados
      setSelectAll(newSelected.length === products.length);

      return newSelected;
    });
  };

  // Função para validar/invalidar produtos selecionados
  const handleBulkValidation = async (validate: boolean) => {
    if (selectedProducts.length === 0) return;

    try {
      await api.post("/admin/products/bulk-validate", {
        product_ids: selectedProducts,
        validated: validate
      });

      // Recarrega os produtos
      fetchProducts();

      // Limpa seleção
      setSelectedProducts([]);
      setSelectAll(false);

      // Fecha o diálogo
      setShowValidationDialog(false);

    } catch (error) {
      console.error('Erro ao validar produtos:', error);
      alert('Erro ao processar validação');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Função para obter URL da imagem
  const getImageUrl = (img: string | undefined) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${import.meta.env.VITE_API_URL}/storage/${img}`;
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
              <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
              <p className="text-muted-foreground">
                Gerencie todos os produtos cadastrados na plataforma
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

            <CSVUploader
              onFileSubmit={handleBulkUpload}
              buttonText="Importar em Massa"
              accept=".csv"
            />

            <Button
              onClick={() => navigate('/admin/products/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="space-y-4">

          {/* Filtros */}
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, código de barras ou marca..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeTab === "todos" && (
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="validados">Validados</SelectItem>
                      <SelectItem value="pendentes">Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ações em massa */}
          {selectedProducts.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-primary" />
                <span className="font-medium">
                  {selectedProducts.length} produto{selectedProducts.length > 1 ? 's' : ''} selecionado{selectedProducts.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setValidationAction("validate");
                    setShowValidationDialog(true);
                  }}
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Validar Selecionados
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setValidationAction("invalidate");
                    setShowValidationDialog(true);
                  }}
                  className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Invalidar Selecionados
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedProducts([]);
                    setSelectAll(false);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>
          )}

          {/* Tabela de Produtos */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Produtos {paginationMeta ? `(${paginationMeta.total})` : ''}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectAll}
                              onCheckedChange={handleSelectAll}
                              aria-label="Selecionar todos"
                            />
                          </TableHead>
                          <TableHead className="w-20">Imagem</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Código de Barras</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Preço Médio</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Última Atualização</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id} className={selectedProducts.includes(product.id) ? "bg-primary/5" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={() => handleSelectProduct(product.id)}
                                aria-label={`Selecionar ${product.name}`}
                              />
                            </TableCell>

                            <TableCell>
                              <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 border">
                                {product.img ? (
                                  <img
                                    src={getImageUrl(product.img) || ''}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                {product.brand && (
                                  <p className="text-sm text-muted-foreground">
                                    {product.brand}
                                  </p>
                                )}
                                {product.description && (
                                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                                    {product.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {product.sku || 'N/A'}
                              </code>
                            </TableCell>

                            <TableCell>
                              <span className="text-sm">{product.category}</span>
                            </TableCell>

                            <TableCell>
                              <span className="font-medium">
                                {formatPrice(product.average_price)}
                              </span>
                            </TableCell>

                            <TableCell>
                              {product.validated ? (
                                <Badge variant="success" className="bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Validado
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell>
                              {new Date(product.updated_at).toLocaleDateString('pt-BR')}
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(product.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {products.length === 0 && !loading && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum produto encontrado</p>
                    </div>
                  )}

                  {paginationMeta && paginationMeta.last_page > 1 && (
                    <CustomPagination
                      paginationMeta={paginationMeta}
                      search={search}
                      filterStatus={filterStatus}
                      onPageChange={handlePaginationChange}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>

      {/* Dialog de confirmação para validação em massa */}
      <AlertDialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {validationAction === "validate" ? "Validar Produtos" : "Invalidar Produtos"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja {validationAction === "validate" ? "validar" : "invalidar"} {selectedProducts.length} produto{selectedProducts.length > 1 ? 's' : ''}?
              {validationAction === "invalidate" && (
                <span className="block mt-2 text-yellow-600">
                  Produtos invalidados não aparecerão para clientes até serem validados novamente.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkValidation(validationAction === "validate")}
              className={validationAction === "validate" ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"}
            >
              {validationAction === "validate" ? "Validar" : "Invalidar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}