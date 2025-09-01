import { useUser } from "@/contexts/UserContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, logout } = useUser();

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader
                userType={user.type}
                userName={user.name}
                userPoints={user.points}
                onLogout={logout}
            />
            <main>
                {children}
            </main>
        </div>
    );
}