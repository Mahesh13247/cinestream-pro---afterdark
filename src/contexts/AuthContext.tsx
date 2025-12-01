import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/authApi';

interface User {
    id: number;
    username: string;
    role: 'admin' | 'user';
    isBlocked: number;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            // IMPORTANT: Clear tokens on every page load to force re-login
            const token = sessionStorage.getItem('accessToken');

            // Clear the token immediately after reading it
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            // Even if token exists, we clear it and force re-login
            setUser(null);
            setLoading(false);
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            setLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        try {
            const response = await authApi.login(username, password);

            if (response.success) {
                const { user, accessToken, refreshToken } = response.data;

                // Store tokens temporarily (will be cleared on next page load)
                sessionStorage.setItem('accessToken', accessToken);
                sessionStorage.setItem('refreshToken', refreshToken);

                // Set user
                setUser(user);

                // Redirect based on role
                if (user.role === 'admin') {
                    window.location.href = '/#/admin-dashboard';
                } else {
                    window.location.href = '/#/';
                }
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            throw new Error(message);
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear session storage
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            setUser(null);

            // Redirect to login
            window.location.href = '/#/login';
        }
    };

    useEffect(() => {
        // Clear auth on every mount (page load/reload)
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        setUser(null);
        setLoading(false);
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
