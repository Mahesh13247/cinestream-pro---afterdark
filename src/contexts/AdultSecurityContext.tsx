import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { adultSecurityApi } from '../services/adultSecurityApi';
import { useAuth } from './AuthContext';

interface AdultSecurityContextType {
    hasAccess: boolean;
    hasPin: boolean;
    requiresSetup: boolean;
    isLocked: boolean;
    remainingAttempts: number;
    tokenExpiry: string | null;
    idleTime: number;
    verifyPin: (pin: string) => Promise<{ success: boolean; message: string }>;
    setPin: (pin: string) => Promise<{ success: boolean; message: string }>;
    revokeAccess: () => Promise<void>;
    checkAccessStatus: () => Promise<void>;
    resetIdleTimer: () => void;
}

const AdultSecurityContext = createContext<AdultSecurityContextType | undefined>(undefined);

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const AdultSecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [hasAccess, setHasAccess] = useState(false);
    const [hasPin, setHasPin] = useState(false);
    const [requiresSetup, setRequiresSetup] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState(3);
    const [tokenExpiry, setTokenExpiry] = useState<string | null>(null);
    const [idleTime, setIdleTime] = useState(0);
    const [lastActivity, setLastActivity] = useState(Date.now());

    // Check access status on mount and when authentication changes
    const checkAccessStatus = useCallback(async () => {
        if (!isAuthenticated) {
            setHasAccess(false);
            setHasPin(false);
            setRequiresSetup(false);
            return;
        }

        try {
            const response = await adultSecurityApi.checkAccess();
            if (response.success) {
                setHasPin(response.data.hasPin);
                setRequiresSetup(response.data.requiresSetup);
                setTokenExpiry(response.data.tokenExpiry || null);

                // Check if we have a valid token in sessionStorage
                const storedToken = sessionStorage.getItem('adultAccessToken');
                const hasValidToken = response.data.hasValidToken && storedToken;

                setHasAccess(hasValidToken);
            }
        } catch (error) {
            console.error('Failed to check adult access status:', error);
            setHasAccess(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        checkAccessStatus();
    }, [checkAccessStatus]);

    // Verify PIN
    const verifyPin = async (pin: string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await adultSecurityApi.verifyPin(pin);

            if (response.success) {
                // Store token in sessionStorage
                sessionStorage.setItem('adultAccessToken', response.data.token);
                setHasAccess(true);
                setTokenExpiry(response.data.expiresAt);
                setRemainingAttempts(3);
                setIsLocked(false);
                resetIdleTimer();

                // Log access
                await adultSecurityApi.logAccess('pin_verified');

                return { success: true, message: 'Access granted' };
            }

            return { success: false, message: response.message };
        } catch (error: any) {
            const errorData = error.response?.data;

            if (errorData?.lockedOut) {
                setIsLocked(true);
                setRemainingAttempts(0);
                return { success: false, message: errorData.message || 'Account locked' };
            }

            if (errorData?.remainingAttempts !== undefined) {
                setRemainingAttempts(errorData.remainingAttempts);
            }

            if (errorData?.requiresSetup) {
                setRequiresSetup(true);
                return { success: false, message: 'Please set up your PIN first' };
            }

            return {
                success: false,
                message: errorData?.message || 'PIN verification failed'
            };
        }
    };

    // Set PIN
    const setPin = async (pin: string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await adultSecurityApi.setPin(pin);

            if (response.success) {
                setHasPin(true);
                setRequiresSetup(false);
                return { success: true, message: 'PIN set successfully' };
            }

            return { success: false, message: response.message };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to set PIN'
            };
        }
    };

    // Revoke access
    const revokeAccess = async () => {
        try {
            await adultSecurityApi.revokeAccess();
            sessionStorage.removeItem('adultAccessToken');
            setHasAccess(false);
            setTokenExpiry(null);
            setIdleTime(0);
        } catch (error) {
            console.error('Failed to revoke access:', error);
            // Clear local state anyway
            sessionStorage.removeItem('adultAccessToken');
            setHasAccess(false);
        }
    };

    // Reset idle timer
    const resetIdleTimer = useCallback(() => {
        setLastActivity(Date.now());
        setIdleTime(0);
    }, []);

    // Idle timeout monitoring
    useEffect(() => {
        if (!hasAccess) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const idle = now - lastActivity;
            setIdleTime(idle);

            // Auto-lock after idle timeout
            if (idle >= IDLE_TIMEOUT) {
                revokeAccess();
            }
        }, 1000); // Check every second

        return () => clearInterval(interval);
    }, [hasAccess, lastActivity]);

    // Session timeout monitoring
    useEffect(() => {
        if (!hasAccess || !tokenExpiry) return;

        const checkExpiry = setInterval(() => {
            const expiryTime = new Date(tokenExpiry).getTime();
            const now = Date.now();

            if (now >= expiryTime) {
                revokeAccess();
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(checkExpiry);
    }, [hasAccess, tokenExpiry]);

    // Track user activity
    useEffect(() => {
        if (!hasAccess) return;

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        const handleActivity = () => {
            resetIdleTimer();
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [hasAccess, resetIdleTimer]);

    const value: AdultSecurityContextType = {
        hasAccess,
        hasPin,
        requiresSetup,
        isLocked,
        remainingAttempts,
        tokenExpiry,
        idleTime,
        verifyPin,
        setPin,
        revokeAccess,
        checkAccessStatus,
        resetIdleTimer
    };

    return (
        <AdultSecurityContext.Provider value={value}>
            {children}
        </AdultSecurityContext.Provider>
    );
};

export const useAdultSecurity = () => {
    const context = useContext(AdultSecurityContext);
    if (context === undefined) {
        throw new Error('useAdultSecurity must be used within an AdultSecurityProvider');
    }
    return context;
};
