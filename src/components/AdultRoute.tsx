import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdultSecurity } from '../contexts/AdultSecurityContext';

interface AdultRouteProps {
    children: React.ReactNode;
}

const AdultRoute: React.FC<AdultRouteProps> = ({ children }) => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { hasAccess, checkAccessStatus } = useAdultSecurity();
    const location = useLocation();

    useEffect(() => {
        if (isAuthenticated) {
            checkAccessStatus();
        }
    }, [isAuthenticated, checkAccessStatus]);

    // Wait for auth to load
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-muted">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Children will handle PIN verification if hasAccess is false
    // This allows the Adult page to show its own PIN modal
    return <>{children}</>;
};

export default AdultRoute;
