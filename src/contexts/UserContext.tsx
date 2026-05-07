import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserType } from '@/components/auth/LoginForm';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface User {
    type: UserType;
    name: string;
    email?: string;
    points?: number;
    hasNotification: boolean;
    notifications: number;
    notificationList: [];
    token?: string;
    activeCompanies?: [];
}

interface Company {
    name: string,
    cnpj: string,
    img: string,
    website: string,
    status: string,
    phone: string,
    description: string,
    raw_address: string,
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    activeCompanies?: Company[];
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Carrega o usuário do localStorage/token ao iniciar
    const loadUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await api.get('/user');
            setUser({
                type: response.data.user.type,
                name: response.data.user.name,
                email: response.data.user.email,
                points: response.data.user.points,
                activeCompanies: response.data.user.activeCompanies,
                token: token,
                hasNotification: response.data.user.hasNotification,
                notifications: response.data.user.notifications,
                notificationList: response.data.user.notificationList,
            });
        } catch (error) {
            console.error('Failed to load user', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        setUser({ ...userData, token });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/');
    };

    return (
        <UserContext.Provider value={{ user, loading, login, logout, refreshUser: loadUser }}>
            {children}
        </UserContext.Provider>
    );
}

// Hook para usar o contexto
export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}