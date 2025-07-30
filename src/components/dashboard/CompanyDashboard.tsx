import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Database, TrendingUp, Package, Settings, Users } from "lucide-react";

export function CompanyDashboard() {
  const [stats] = useState({
    totalProducts: 1247,
    activeWebhooks: 3,
    monthlyUpdates: 12580,
    userEngagement: 89
  });

  const [recentUploads] = useState([
    {
      id: 1,
      filename: "produtos_janeiro_2024.csv",
      products: 156,
      status: "success",
      timestamp: "2 horas atrás"
    },
    {
      id: 2,
      filename: "precos_promocionais.xlsx",
      products: 45,
      status: "processing",
      timestamp: "5 horas atrás"
    }
  ]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Estatísticas da Empresa */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Produtos Cadastrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeWebhooks}</p>
                <p className="text-sm text-muted-foreground">Webhooks Ativos</p>
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
                <p className="text-2xl font-bold">{stats.monthlyUpdates.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Atualizações/Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.userEngagement}%</p>
                <p className="text-sm text-muted-foreground">Engajamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload de Produtos */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Gestão de Produtos</CardTitle>
              <Button className="bg-gradient-secondary hover:shadow-glow transition-all duration-300">
                <Upload className="w-4 h-4 mr-2" />
                Upload em Massa
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Envie seus produtos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Arraste e solte arquivos CSV ou Excel aqui, ou clique para selecionar
                </p>
                <Button variant="outline">Selecionar Arquivo</Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Uploads Recentes</h4>
                {recentUploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{upload.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {upload.products} produtos • {upload.timestamp}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={upload.status === "success" ? "secondary" : "default"}
                    >
                      {upload.status === "success" ? "Sucesso" : "Processando"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configurações e Webhooks */}
        <div className="space-y-6">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
              >
                <Database className="w-5 h-5" />
                Webhooks
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
              >
                <Settings className="w-5 h-5" />
                API Keys
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
              >
                <TrendingUp className="w-5 h-5" />
                Relatórios
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Webhook Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Preços Automáticos</span>
                <Badge variant="secondary">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Estoque</span>
                <Badge variant="secondary">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Promoções</span>
                <Badge variant="outline">Pausado</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}