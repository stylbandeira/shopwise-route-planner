import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, MapPin, Clock, DollarSign, Edit, Trash2, Share2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface ListItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  store: string;
  category: string;
  completed: boolean;
}

interface ShoppingList {
  id: number;
  name: string;
  items: ListItem[];
  totalValue: number;
  estimatedTime: number;
  status: "em_andamento" | "concluida";
  createdAt: string;
}

export default function ViewShoppingList() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [shoppingList, setShoppingList] = useState<ShoppingList>({
    id: parseInt(id || "1"),
    name: "Compras da Semana",
    estimatedTime: 45,
    status: "em_andamento",
    createdAt: "2024-01-15",
    totalValue: 157.80,
    items: [
      {
        id: 1,
        name: "Arroz Tio João 5kg",
        quantity: 2,
        unit: "kg",
        price: 18.90,
        store: "Supermercado ABC",
        category: "Grãos",
        completed: true
      },
      {
        id: 2,
        name: "Feijão Preto 1kg",
        quantity: 1,
        unit: "kg",
        price: 7.50,
        store: "Supermercado ABC",
        category: "Grãos",
        completed: false
      },
      {
        id: 3,
        name: "Açúcar Cristal 1kg",
        quantity: 1,
        unit: "kg",
        price: 4.20,
        store: "Supermercado ABC",
        category: "Açúcar",
        completed: false
      },
      {
        id: 4,
        name: "Óleo de Soja 900ml",
        quantity: 2,
        unit: "ml",
        price: 5.80,
        store: "Mercado Local",
        category: "Óleos",
        completed: false
      },
      {
        id: 5,
        name: "Leite Integral 1L",
        quantity: 3,
        unit: "liters",
        price: 4.50,
        store: "Supermercado XYZ",
        category: "Laticínios",
        completed: true
      },
    ]
  });

  const toggleItemComplete = (itemId: number) => {
    setShoppingList(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const completedItems = shoppingList.items.filter(item => item.completed).length;
  const totalItems = shoppingList.items.length;
  const progress = (completedItems / totalItems) * 100;

  // Agrupar itens por loja
  const itemsByStore = shoppingList.items.reduce((acc, item) => {
    if (!acc[item.store]) {
      acc[item.store] = [];
    }
    acc[item.store].push(item);
    return acc;
  }, {} as Record<string, ListItem[]>);

  const optimizeRoute = () => {
    // Aqui seria implementada a lógica de otimização de rota
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
                  <p className="text-2xl font-bold">R$ {shoppingList.totalValue.toFixed(2)}</p>
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
                  <p className="text-2xl font-bold">{shoppingList.estimatedTime}min</p>
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
          {Object.entries(itemsByStore).map(([store, items]) => (
            <Card key={store} className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{store}</span>
                  <Badge variant="secondary">
                    {items.filter(item => item.completed).length}/{items.length} concluídos
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      item.completed 
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
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        R$ {item.price.toFixed(2)} cada
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Subtotal {store}:</span>
                    <span className="text-primary">
                      R$ {items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
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