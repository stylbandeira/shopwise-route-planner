import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, MapPin, Star, QrCode, Receipt } from "lucide-react";

export function ClientDashboard() {
  const [shoppingLists] = useState([
    {
      id: 1,
      name: "Compras da Semana",
      items: 12,
      status: "em_andamento",
      estimatedValue: 157.80
    },
    {
      id: 2,
      name: "Festa de Aniversário",
      items: 8,
      status: "concluida",
      estimatedValue: 89.90
    }
  ]);

  const [recentActivity] = useState([
    {
      id: 1,
      action: "Adicionou preço para Arroz Tio João 5kg",
      store: "Supermercado ABC",
      points: 5,
      timestamp: "2 horas atrás"
    },
    {
      id: 2,
      action: "Concluiu lista 'Festa de Aniversário'",
      points: 10,
      timestamp: "1 dia atrás"
    }
  ]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Listas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-muted-foreground">Pontos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ 247,50</p>
                <p className="text-sm text-muted-foreground">Economia Este Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">89%</p>
                <p className="text-sm text-muted-foreground">Precisão</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listas de Compra */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Minhas Listas</CardTitle>
              <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                Nova Lista
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {shoppingLists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{list.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {list.items} itens • R$ {list.estimatedValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={list.status === "concluida" ? "secondary" : "default"}
                    >
                      {list.status === "concluida" ? "Concluída" : "Em Andamento"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Ver Rota
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="space-y-6">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
              >
                <QrCode className="w-5 h-5" />
                Escanear Nota Fiscal
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
              >
                <Plus className="w-5 h-5" />
                Adicionar Produto
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
              >
                <MapPin className="w-5 h-5" />
                Otimizar Rota
              </Button>
            </CardContent>
          </Card>

          {/* Atividade Recente */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="space-y-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{activity.timestamp}</span>
                    <Badge variant="secondary" className="text-xs">
                      +{activity.points} pts
                    </Badge>
                  </div>
                  {activity.store && (
                    <p className="text-xs text-muted-foreground">{activity.store}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}