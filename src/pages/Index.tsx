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

  // const loadUser = async () => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     if (!token) {
  //       setLoading(false)
  //       return;
  //     }

  //     const response = await api.get('/user');
  //     setUser({
  //       type: response.data.user.type,
  //       name: response.data.user.name,
  //       email: response.data.user.email,
  //       points: response.data.user.points
  //     });

  //   } catch (error) {
  //     console.error('Failed to load user', error);
  //     localStorage.removeItem('token');
  //     setUser(null)
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  useEffect(() => {
    // loadUser();

    if (location.state?.fromRegister) {
      setShowNotification(true);
      window.history.replaceState({}, "");
    }
  }, [location]);

  // const handleLogin = (userData: { type: UserType; name: string; email?: string; token?: string }) => {
  //   if (userData.token) {
  //     localStorage.setItem('token', userData.token);
  //   }
  //   setUser({
  //     type: userData.type,
  //     name: userData.name,
  //     email: userData.email,
  //     // points: userData.points
  //   });
  //   return loadUser();
  // };

  // const handleRegister = (userData: {
  //   type: UserType;
  //   name: string;
  //   email?: string;
  // }) => {
  //   window.history.replaceState({ ...location.state, fromRegister: true }, "");
  //   return loadUser()
  // };

  // const handleLogout = () => {
  //   setUser(null);
  // };

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
