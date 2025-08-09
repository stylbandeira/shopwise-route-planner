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

const Index = () => {
  const [user, setUser] = useState<{
    type: UserType;
    name: string;
    points?: number;
  } | null>(null);

  const [showNotification, setShowNotification] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      api.get('/user')
        .then(response => {
          setUser({
            type: response.data.user_type,
            name: response.data.name
          });
        })
        .catch(() => {
          localStorage.removeItem('authToken');
        });
    }

    if (location.state?.fromRegister) {
      setShowNotification(true);
    }
  }, [location]);

  const handleLogin = (userData: { type: UserType; name: string; email?: string }) => {
    // Simular login com dados diferentes para cada tipo
    const userProfiles = {
      client: { ...userData, points: 1247 },
      company: userData,
      admin: userData
    };

    setUser(userProfiles[userData.type]);
  };

  const handleRegister = (userData: {
    type: UserType;
    name: string;
    email?: string;
  }) => {
    handleLogin(userData);
    window.history.replaceState({ ...location.state, fromRegister: true }, "")
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
        onLogout={handleLogout}
      />
      {renderDashboard()}
    </div>
  );
};

export default Index;
