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
    isLocked: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    unlock: (password: string) => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    // Initialize locked state based on token existence
    const [isLocked, setIsLocked] = useState(!!sessionStorage.getItem('accessToken'));

    const checkAuth = async () => {
        try {
            const token = sessionStorage.getItem('accessToken');

            if (!token) {
                setUser(null);
                setLoading(false);
                setIsLocked(false); // No token, so not locked (show login)
                return;
            }

            // Verify token with backend
            try {
                const response = await authApi.getCurrentUser();
                if (response.success && response.data) {
                    setUser(response.data);
                    // Keep isLocked as true if it was initialized as true (refresh)
                    // But if we just logged in, it should be false.
                    // We handle that in login().
                } else {
                    // Invalid token
                    throw new Error('Invalid session');
                }
            } catch (err) {
                // Token invalid or expired
                console.error('Session verification failed:', err);
                sessionStorage.removeItem('accessToken');
                sessionStorage.removeItem('refreshToken');
                setUser(null);
                setIsLocked(false);
            } finally {
                setLoading(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            setLoading(false);
            setIsLocked(false);
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
                setIsLocked(false); // Explicitly unlock on fresh login

                // Redirect based on role
                if (user.role === 'admin') {
                    window.location.hash = '/admin-dashboard';
                } else {
                    window.location.hash = '/';
                }
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            throw new Error(message);
        }
    };

    const unlock = async (password: string) => {
        if (!user) return;
        try {
            // Verify password by attempting login (or use a verify endpoint if available)
            // Since we don't have a specific verify endpoint, we use login
            const response = await authApi.login(user.username, password);
            if (response.success) {
                setIsLocked(false);
            } else {
                throw new Error('Incorrect password');
            }
        } catch (error: any) {
            throw new Error('Incorrect password');
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
            setIsLocked(false);

            // Redirect to login
            window.location.hash = '/login';
        }
    };

    useEffect(() => {
        // Check authentication on mount
        checkAuth();
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        isLocked,
        login,
        logout,
        unlock,
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
