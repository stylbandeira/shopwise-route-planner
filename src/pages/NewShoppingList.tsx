import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Plus, Minus, Heart, MapPin, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  store: string;
  distance: number;
  isFavorite: boolean;
  unit: string;
}

interface SelectedItem {
  product: Product;
  quantity: number;
  unit: string;
}

const UNITS = [
  { value: "kg", label: "Kg" },
  { value: "g", label: "g" },
  { value: "units", label: "Unidades" },
  { value: "liters", label: "Litros" },
  { value: "ml", label: "ml" },
  { value: "packages", label: "Pacotes" }
];

export default function NewShoppingList() {
  const navigate = useNavigate();
  const [listName, setListName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "distance">("price");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const [products] = useState<Product[]>([
    { id: 1, name: "Arroz Tio João 5kg", price: 18.90, category: "Grãos", store: "Supermercado ABC", distance: 1.2, isFavorite: true, unit: "kg" },
    { id: 2, name: "Feijão Preto 1kg", price: 7.50, category: "Grãos", store: "Supermercado XYZ", distance: 2.1, isFavorite: false, unit: "kg" },
    { id: 3, name: "Açúcar Cristal 1kg", price: 4.20, category: "Açúcar", store: "Supermercado ABC", distance: 1.2, isFavorite: true, unit: "kg" },
    { id: 4, name: "Óleo de Soja 900ml", price: 5.80, category: "Óleos", store: "Mercado Local", distance: 0.8, isFavorite: false, unit: "ml" },
    { id: 5, name: "Leite Integral 1L", price: 4.50, category: "Laticínios", store: "Supermercado XYZ", distance: 2.1, isFavorite: true, unit: "liters" },
  ]);

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price") {
        return a.price - b.price;
      }
      return a.distance - b.distance;
    });

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
      setSelectedItems([...selectedItems, { product, quantity: 1, unit: product.unit }]);
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

  const totalValue = selectedItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  const saveList = () => {
    // Aqui seria feita a chamada para a API
    console.log("Salvando lista:", { name: listName, items: selectedItems });
    navigate("/");
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={(value: "price" | "distance") => setSortBy(value)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Preço
                        </div>
                      </SelectItem>
                      <SelectItem value="distance">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Distância
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{product.category}</Badge>
                            <span className="text-sm text-muted-foreground">{product.store}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                            <span className="text-muted-foreground">{product.distance}km</span>
                          </div>
                        </div>
                        <Button onClick={() => addToList(product)} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </TabsContent>
                  
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
                            <span className="text-sm text-muted-foreground">{product.store}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                            <span className="text-muted-foreground">{product.distance}km</span>
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
                          <Select value={item.unit} onValueChange={(value) => updateUnit(item.product.id, value)}>
                            <SelectTrigger className="h-6 text-xs w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNITS.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          R$ {(item.product.price * item.quantity).toFixed(2)}
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