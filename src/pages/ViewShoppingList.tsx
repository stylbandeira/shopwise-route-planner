import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, MapPin, Clock, DollarSign, Edit, Trash2, Share2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";

interface ListItem {
  id: number;
  name: string;
  quantity: number;
  average_price: number;
  companyId: number;
  storeName?: string;
  storeAddress?: string;
  category: string;
  unity: string;
  completed: boolean;
}

interface ShoppingListAPIResponse {
  id: number;
  favorite: boolean;
  name: string;
  optimized: boolean;
  products: ListItem[];
  status: string;
  total: number;
  created_at: string;
}

interface ShoppingList {
  id: number;
  favorite: boolean;
  name: string;
  optimized: boolean;
  products: ListItem[];
  totalValue: number;
  status: string;
  createdAt: string;
}

type BackendProduct = {
  category?: string;
  unity?: string;
  completed?: boolean;

  id: number;
  name: string;
  quantity: number;
  average_price: number;
  companyId: number;
  storeName?: string;
  storeAddress?: string;
  // ... outros campos que podem vir
};

const ensureListItem = (data: BackendProduct): ListItem => ({
  id: data.id,
  name: data.name,
  quantity: data.quantity,
  average_price: data.average_price,
  companyId: data.companyId,
  storeName: data.storeName || '',
  storeAddress: data.storeAddress || '',
  completed: data.completed,
  category: data.category,
  unity: data.unity,
});

const mapShoppingList = (apiData: ShoppingListAPIResponse): ShoppingList => ({
  id: apiData.id,
  favorite: apiData.favorite,
  name: apiData.name,
  optimized: apiData.optimized,
  products: apiData.products.map(ensureListItem),
  status: apiData.status,
  totalValue: apiData.total,
  createdAt: apiData.created_at
});

export default function ViewShoppingList() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isOptimized, setIsOptimized] = useState(false);

  const [shoppingList, setShoppingList] = useState<ShoppingList>({
    id: 0,
    favorite: false,
    name: '',
    optimized: false,
    products: [],
    totalValue: 0,
    status: '',
    createdAt: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.get("/lists/" + id);
        setShoppingList(mapShoppingList(response.data.list));
        setIsOptimized(response.data.optimized);
        console.log(response.data.list);
        console.log(response.data.optimized);
      } catch (error) {
        console.log(error);
      }
    }

    loadData();
    console.log(shoppingList);
  }, []);

  const toggleItemComplete = (itemId: number) => {
    setShoppingList(prev => ({
      ...prev,
      products: prev.products.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const completedItems = shoppingList.products.filter(item => item.completed).length;
  const totalItems = shoppingList.products.length;
  const progress = (completedItems / totalItems) * 100;

  // Agrupar itens por loja
  const itemsByStore = shoppingList.products.reduce((acc, item) => {
    if (!acc[item.companyId]) {
      acc[item.companyId] = [];
    }
    acc[item.companyId].push(item);
    return acc;
  }, {} as Record<string, ListItem[]>);

  const optimizeRoute = async () => {
    const data = { optimized: true };
    try {
      const response = await api.put("/lists/" + id, data);
      setIsOptimized(response.data.list.optimized);
    } catch (error) {
      console.log(error);
    }
    console.log("Otimizando rota...");
  };

  const shareList = () => {
    // Aqui seria implementada a funcionalidade de compartilhamento
    console.log("Compartilhando lista...");
  };

  const deleteList = () => {
    // Aqui seria implementada a funcionalidade de exclusão
    console.log("Excluindo lista...");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{shoppingList.name}</h1>
              <p className="text-sm text-muted-foreground">
                Criada em {new Date(shoppingList.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={shareList}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={deleteList}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  {/* <p className="text-2xl font-bold">R$ {shoppingList.totalValue.toFixed(2)}</p> */}
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">TODO - min</p>
                  <p className="text-sm text-muted-foreground">Tempo Estimado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold">{Math.round(progress)}%</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedItems}/{totalItems}</p>
                  <p className="text-sm text-muted-foreground">Progresso</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardContent className="p-6">
              <Button
                onClick={optimizeRoute}
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Otimizar Rota
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Items by Store */}
        <div className="space-y-6">
          {Object.entries(itemsByStore).map(([store, products]) => (
            <Card key={store} className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {isOptimized ? <span>{store}</span> : <span>Lista</span>}
                  <Badge variant="secondary">
                    {products.filter(item => item.completed).length}/{products.length} concluídos
                  </Badge>
                </CardTitle>
              </CardHeader>
              {products.length && (
                <>
                  <CardContent className="space-y-3">
                    {products.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 p-4 rounded-lg transition-all ${item.completed
                          ? 'bg-muted/50 opacity-75'
                          : 'bg-muted/30 hover:bg-muted/50'
                          }`}
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => toggleItemComplete(item.id)}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className={`font-semibold ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {item.quantity}
                              {item.unity}
                            </span>
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            R$ {(item.average_price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {/* R$ {item.price.toFixed(2)} cada */}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-3 mt-4">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Subtotal {store}:</span>
                        <span className="text-primary">
                          R$ {products.reduce((sum, item) => sum + (item.average_price * item.quantity), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/list/${shoppingList.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Lista
          </Button>
          <Button
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            onClick={() => {
              setShoppingList(prev => ({ ...prev, status: "concluida" }));
              // Aqui seria feita a chamada para a API
            }}
            disabled={shoppingList.status === "concluida"}
          >
            {shoppingList.status === "concluida" ? "Lista Concluída" : "Marcar como Concluída"}
          </Button>
        </div>
      </div>
    </div>
  );
}