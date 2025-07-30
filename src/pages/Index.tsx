import { useState } from "react";
import { UserType } from "@/components/auth/LoginForm";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { CompanyDashboard } from "@/components/dashboard/CompanyDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import Auth from "./Auth";

const Index = () => {
  const [user, setUser] = useState<{
    type: UserType;
    name: string;
    points?: number;
  } | null>(null);

  const handleLogin = (userType: UserType) => {
    // Simular login com dados diferentes para cada tipo
    const userData = {
      client: { type: userType, name: "Maria Silva", points: 1247 },
      company: { type: userType, name: "Supermercado ABC" },
      admin: { type: userType, name: "Admin System" }
    };
    
    setUser(userData[userType] as any);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderDashboard = () => {
    switch (user.type) {
      case "client":
        return <ClientDashboard />;
      case "company":
        return <CompanyDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userType={user.type}
        userName={user.name}
        userPoints={user.points}
        onLogout={handleLogout}
      />
      {renderDashboard()}
    </div>
  );
};

export default Index;
