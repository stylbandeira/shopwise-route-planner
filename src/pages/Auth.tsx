import { useState } from "react";
import { LoginForm, UserType } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

// components/Auth.tsx
interface AuthProps {
  onLogin: (userData: { type: UserType; name: string; email: string }) => void;
  onRegister?: (userData: { type: UserType; name: string; email: string }) => void;
}

export default function Auth({ onLogin, onRegister }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const handleRegister = onRegister || onLogin;

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm
            onLogin={onLogin}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
}