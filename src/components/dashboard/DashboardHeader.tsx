import { UserType } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Building2, Shield, LogOut, Star } from "lucide-react";
import { CustomLogo } from "../oiai_ui/CustomLogo";

interface DashboardHeaderProps {
  userType: UserType;
  userName: string;
  userPoints?: number;
  onLogout: () => void;
}

export function DashboardHeader({ userType, userName, userPoints, onLogout }: DashboardHeaderProps) {
  const getUserTypeInfo = (type: UserType) => {
    switch (type) {
      case "client":
        return {
          icon: <ShoppingCart className="w-5 h-5" />,
          label: "Cliente",
          color: "bg-primary"
        };
      case "company":
        return {
          icon: <Building2 className="w-5 h-5" />,
          label: "Empresa",
          color: "bg-secondary"
        };
      case "admin":
        return {
          icon: <Shield className="w-5 h-5" />,
          label: "Administrador",
          color: "bg-destructive"
        };
    }
  };

  const typeInfo = getUserTypeInfo(userType);

  return (
    <header className="bg-card border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
            <a href="/">
              <CustomLogo className="w-8 h-8" />
            </a>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Oiaí - Pesquisa de Preços</h1>
            <p className="text-sm text-muted-foreground">Otimize suas compras</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {userType === "client" && userPoints !== undefined && (
            <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
              <Star className="w-4 h-4 text-secondary" />
              <span className="font-medium text-sm">{userPoints} pontos</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className={`${typeInfo.color} text-white`}>
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="font-medium text-sm">{userName}</p>
              <Badge variant="secondary" className="text-xs">
                {typeInfo.icon}
                <span className="ml-1">{typeInfo.label}</span>
              </Badge>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}