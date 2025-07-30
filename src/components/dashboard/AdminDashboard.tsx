import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Package, TrendingUp, Star, MapPin, BarChart3 } from "lucide-react";

export function AdminDashboard() {
  const [systemStats] = useState({
    totalUsers: 15420,
    totalCompanies: 89,
    totalProducts: 45678,
    systemHealth: 99.8
  });

  const [topUsers] = useState([
    { id: 1, name: "Maria Silva", points: 2480, reputation: 4.8 },
    { id: 2, name: "João Santos", points: 2350, reputation: 4.7 },
    { id: 3, name: "Ana Costa", points: 2190, reputation: 4.9 }
  ]);

  const [topProducts] = useState([
    { id: 1, name: "Arroz Tio João 5kg", registrations: 1240 },
    { id: 2, name: "Feijão Carioca 1kg", registrations: 980 },
    { id: 3, name: "Açúcar Cristal 1kg", registrations: 856 }
  ]);

  const [topStores] = useState([
    { id: 1, name: "Supermercado ABC", mentions: 2450 },
    { id: 2, name: "Mercado Central", mentions: 1890 },
    { id: 3, name: "Extra Hipermercado", mentions: 1650 }
  ]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Estatísticas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{systemStats.totalCompanies}</p>
                <p className="text-sm text-muted-foreground">Empresas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{systemStats.totalProducts.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Produtos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{systemStats.systemHealth}%</p>
                <p className="text-sm text-muted-foreground">Saúde do Sistema</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Relatórios Principais */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Produtos Mais Cadastrados</CardTitle>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver Relatório Completo
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.registrations} cadastros
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{product.registrations}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Estabelecimentos Mais Citados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topStores.map((store, index) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">{store.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {store.mentions} menções
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{store.mentions}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Usuários e Ações */}
        <div className="space-y-6">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Usuários com Maior Reputação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-secondary text-secondary" />
                        <span>{user.reputation}</span>
                        <span>•</span>
                        <span>{user.points} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Ações Administrativas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
              >
                <Users className="w-5 h-5" />
                Gerenciar Usuários
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
              >
                <Building2 className="w-5 h-5" />
                Gerenciar Empresas
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
              >
                <Package className="w-5 h-5" />
                Gerenciar Produtos
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
              >
                <BarChart3 className="w-5 h-5" />
                Relatórios Avançados
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}