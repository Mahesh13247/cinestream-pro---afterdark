import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="max-w-md w-full bg-surface p-8 rounded-2xl border border-white/10 shadow-2xl animate-fade-in">
                    <div className="text-center text-text">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                        <p className="text-text-muted mb-8">You don't have permission to access this page.</p>
                        <Link
                            to="/"
                            className="block w-full bg-primary text-black font-bold py-3 rounded-xl hover:bg-blue-400 transition transform hover:scale-105"
                        >
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AdminRoute;
