import { useEffect, useState } from "react";
import { UserType } from "@/components/auth/LoginForm";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { CompanyDashboard } from "@/components/dashboard/CompanyDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import Auth from "./Auth";
import { useLocation } from "react-router-dom";
import { NotificationToast } from "@/components/notification/NotificationToast";
import api from "@/lib/api";
import { useUser } from "@/contexts/UserContext";

const Index = () => {
  const { user, loading, logout } = useUser();

  const [showNotification, setShowNotification] = useState(false);
  const location = useLocation();

  useEffect(() => {

    if (location.state?.fromRegister) {
      setShowNotification(true);
      window.history.replaceState({}, "");
    }
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
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
    <div className="min-h-screen bg-background reative">

      {showNotification && (
        <NotificationToast
          message="Enviamos um e-mail com o link de confirmação. Verifique sua caixa de entrada."
          duration={8000}
        />
      )}

      <DashboardHeader
        userType={user.type}
        userName={user.name}
        userPoints={user.points}
        onLogout={logout}
      />
      {renderDashboard()}
    </div>
  );
};

export default Index;
