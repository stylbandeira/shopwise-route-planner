import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Plus, Minus, Heart, MapPin, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { CustomPagination } from "@/components/oiai_ui/CustomPagination";

interface Product {
  id: number;
  name: string;
  average_price: number;
  category: string;
  isFavorite: boolean;
  unit: string;
  quantity: number;
  unity: string;
  unity_id: number;
}

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

interface SelectedItem {
  product: Product;
  quantity: number;
  unity: string;
}

export default function NewShoppingList() {
  const navigate = useNavigate();
  const [listName, setListName] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [listProducts, setListProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
    // fetchDashData();
  }, []);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchProducts(1, search);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [search]);

  const fetchProducts = async (
    page: number = 1,
    searchTerm: string = search
  ) => {
    try {
      setLoading(true);
      const params: any = { page };

      if (searchTerm) params.search = searchTerm;

      const response = await api.get("/products", { params });
      setProducts(response.data.data);
      setPaginationMeta(response.data.meta);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number, searchTerm: string) => {
    fetchProducts(page, searchTerm);
    window.scrollTo(0, 0);
  };

  const handlePaginationChange = (page: number, searchTerm: string) => {
    handlePageChange(page, searchTerm);
  };

  const favoriteProducts = products.filter(product => product.isFavorite);

  const addToList = (product: Product) => {
    const existingItem = selectedItems.find(item => item.product.id === product.id);
    if (existingItem) {
      setSelectedItems(selectedItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedItems([...selectedItems, { product, quantity: 1, unity: product.unity }]);
    }
  };

  const removeFromList = (productId: number) => {
    const existingItem = selectedItems.find(item => item.product.id === productId);
    if (existingItem && existingItem.quantity > 1) {
      setSelectedItems(selectedItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setSelectedItems(selectedItems.filter(item => item.product.id !== productId));
    }
  };

  const updateUnit = (productId: number, newUnit: string) => {
    setSelectedItems(selectedItems.map(item =>
      item.product.id === productId
        ? { ...item, unit: newUnit }
        : item
    ));
  };

  const totalValue = selectedItems.reduce((total, item) => total + (item.product.average_price * item.quantity), 0);

  const saveList = async () => {
    // Aqui seria feita a chamada para a API
    try {
      const response = await api.post("/lists", { products: selectedItems, listName: listName });
    } catch (error) {
      console.log(error);
    } finally {
      navigate("/");
    }
    // console.log("Salvando lista:", { name: listName, items: selectedItems });
    // navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <Input
              placeholder="Nome da lista..."
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="text-lg font-semibold border-0 bg-transparent p-0 focus-visible:ring-0"
            />
          </div>
          <Button
            onClick={saveList}
            disabled={!listName || selectedItems.length === 0}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            Salvar Lista
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">Todos os Produtos</TabsTrigger>
                    <TabsTrigger value="favorites">
                      <Heart className="w-4 h-4 mr-2" />
                      Favoritos
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-3 mt-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          <span className="text-slate-400">{product.quantity + " " + product.unity}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{product.category}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="font-bold text-primary">R$ {product.average_price.toFixed(2)}</span>
                          </div>
                        </div>
                        <Button onClick={() => addToList(product)} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </TabsContent>

                  {paginationMeta && paginationMeta.last_page > 1 && (
                    < CustomPagination
                      paginationMeta={paginationMeta}
                      search={search}
                      filterStatus='all'
                      onPageChange={handlePaginationChange}
                    />
                  )}

                  <TabsContent value="favorites" className="space-y-3 mt-4">
                    {favoriteProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{product.category}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="font-bold text-primary">R$ {product.average_price.toFixed(2)}</span>
                          </div>
                        </div>
                        <Button onClick={() => addToList(product)} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Compras */}
          <div>
            <Card className="border-0 shadow-soft sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Minha Lista</span>
                  <Badge variant="secondary">{selectedItems.length} itens</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum item adicionado
                  </p>
                ) : (
                  <>
                    {selectedItems.map((item) => (
                      <div key={item.product.id} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{item.product.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromList(item.product.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromList(item.product.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="min-w-[2rem] text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addToList(item.product)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          R$ {(item.product.average_price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3 mt-4">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total:</span>
                        <span className="text-primary">R$ {totalValue.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}