import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Plus, Minus, Heart, MapPin, DollarSign } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import { CustomPagination } from "@/components/oiai_ui/CustomPagination";

interface Product {
  id: number;
  name: string;
  img: string;
  average_price: number;
  category: string;
  mentioned_quantity: number;
  companies_count: number;
  mentioned_quantity_variant: string;
  isFavorite: boolean;
  unit: string;
  unity_quantity: number;
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

interface NewShoppingListProps {
  listId?: number;
  isEditMode?: boolean;
}

export default function NewShoppingList({ isEditMode = false, listId }: NewShoppingListProps) {
  const navigate = useNavigate();
  const params = useParams();
  const actualListId = listId || (params.listId ? parseInt(params.listId) : undefined);

  const [listName, setListName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [listProducts, setListProducts] = useState<Product[]>([]);


  useEffect(() => {
    fetchProducts();
    if (isEditMode && actualListId) {
      fetchListData(actualListId);
    }
  }, [isEditMode, actualListId]);

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

  const fetchListData = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/lists/${id}`);

      const listData = response.data.list.products || response.data;
      setListName(response.data.list.name || "");

      // Converter os itens da API para o formato SelectedItem
      if (listData && listData.length > 0) {
        const formattedItems: SelectedItem[] = listData.map((item: any) => ({
          product: {
            id: item.id || item.product?.id,
            name: item.product?.name || item.name || "Produto",
            average_price: item.price || item.product?.average_price || 0,
            category: item.product?.category || item.category || "",
            isFavorite: item.product?.isFavorite || false,
            unit: item.unity || item.product?.unit || "un",
            unity_quantity: item.product?.unity_quantity || 0,
            unity: item.unity || item.product?.unity || "un",
            unity_id: item.unity_id || item.product?.unity_id || 1
          },
          quantity: item.quantity || 1,
          unity: item.unity || 'un'
        }));

        setSelectedItems(formattedItems);
      }
    } catch (error) {
      console.error('Erro ao carregar lista:', error);
    } finally {
      setLoading(false);
    }
  };

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
    console.log(selectedItems);
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

  const setProductQuantity = (addQuantity, product: Product) => {
    const existingItem = selectedItems.find(item => item.product.id === product.id);
    console.log(selectedItems);
    if (existingItem) {
      setSelectedItems(selectedItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: addQuantity }
          : item
      ));
    } else {
      setSelectedItems([...selectedItems, { product, quantity: 1, unity: product.unity }]);
    }
  };

  const handleFavorite = async (product: Product) => {
    const favorite = product.isFavorite ? 'unfavorite' : 'favorite';
    try {
      await api.post(`/products/${product.id}/favorite`);
      fetchProducts();
    } catch (error) {
      console.log(error)
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

  const totalValue = selectedItems.reduce((total, item) => total + (item.product.average_price * item.quantity), 0);

  const saveList = async () => {
    if (!listName.trim() || selectedItems.length === 0) return;

    setIsSaving(true);

    try {
      const formattedItems = selectedItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unity: item.unity
      }));

      let response;

      if (isEditMode && actualListId) {

        response = await api.put(`/lists/${actualListId}`, {
          name: listName,
          items: formattedItems
        });

      } else {
        response = await api.post("/lists", {
          products: selectedItems,
          name: listName
        });
      }

    } catch (error) {
      console.log(error);
    } finally {
      navigate("/");
    }
  };

  const buttonText = isEditMode ? "Atualizar Lista" : "Salvar Lista";

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
            {isSaving ? "Salvando..." : buttonText}
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
                {loading ? (<div className="text-center py-8">Carregando produtos...</div>
                ) : (
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
                            <div className="flex items-center gap-2 mt-1">
                              <img
                                src={product.img}
                                alt={product.img}
                                className="w-8 h-8"
                              />

                              <h3 className="font-semibold">{product.name}</h3>
                            </div>
                            <span className="text-slate-400">{product.unity_quantity + " " + product.unity}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">Empresas: {product.companies_count > 99 ? '99+' : product.companies_count}</Badge>
                              <Badge variant="outline">{product.category}</Badge>
                              <Badge variant={product.mentioned_quantity_variant ?? "destructive"}>Precisão: {product.mentioned_quantity}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="font-bold text-primary">R$ {product.average_price.toFixed(2)}</span>
                            </div>
                          </div>
                          <Button onClick={() => handleFavorite(product)} size="sm"
                            className={`mr-1 ${!product.isFavorite ? 'bg-slate-200' : 'bg-secondary'}`}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
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
                            <div className="flex items-center gap-2 mt-1">
                              <img
                                src={product.img}
                                alt={product.img}
                                className="w-8 h-8"
                              />

                              <h3 className="font-semibold">{product.name}</h3>
                            </div>

                            <span className="text-slate-400">{product.unity_quantity + " " + product.unity}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">Empresas: {product.companies_count > 99 ? '99+' : product.companies_count}</Badge>
                              <Badge variant="outline">{product.category}</Badge>
                              <Badge variant={product.mentioned_quantity_variant ?? "destructive"}>Precisão: {product.mentioned_quantity}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="font-bold text-primary">R$ {product.average_price.toFixed(2)}</span>
                            </div>
                          </div>
                          <Button onClick={() => handleFavorite(product)} size="sm"
                            className={`mr-1 ${!product.isFavorite ? 'bg-slate-200' : 'bg-secondary'}`}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => addToList(product)} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                )}
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

                            <Input
                              placeholder="1,00"
                              value={item.quantity.toFixed(2).replace('.', ',')}
                              type="text"
                              onChange={(e) => setProductQuantity(
                                parseFloat(e.target.value.replace(',', '.')) || 0,
                                item.product
                              )}
                              className="text-lg font-semibold border-1 bg-slate-200 p-auto m-auto focus-visible:ring-0"
                            />
                            <span className="text-gray-600">{item.unity}</span>

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

                        <div className=" text-xs text-muted-foreground">
                          <div className="text-xs text-muted-foreground">
                            R$ {(item.product.average_price).toFixed(2)}
                          </div>
                          <b>Total</b>: R$ {(item.product.average_price * item.quantity).toFixed(2)}
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
    </div >
  );
}