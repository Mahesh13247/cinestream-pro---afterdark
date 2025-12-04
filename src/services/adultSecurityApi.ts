import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get auth token from session storage
const getAuthToken = () => {
    return sessionStorage.getItem('accessToken');
};

// Get adult access token from session storage
const getAdultToken = () => {
    return sessionStorage.getItem('adultAccessToken');
};

export const adultSecurityApi = {
    /**
     * Set adult content PIN
     */
    setPin: async (pin: string) => {
        const token = getAuthToken();
        const response = await axios.post(
            `${API_URL}/api/adult/set-pin`,
            { pin },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    },

    /**
     * Verify PIN and get adult access token
     */
    verifyPin: async (pin: string) => {
        const token = getAuthToken();
        const response = await axios.post(
            `${API_URL}/api/adult/verify-pin`,
            { pin },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    },

    /**
     * Check current adult access status
     */
    checkAccess: async () => {
        const token = getAuthToken();
        const response = await axios.get(
            `${API_URL}/api/adult/check-access`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    },

    /**
     * Revoke adult access token
     */
    revokeAccess: async () => {
        const token = getAuthToken();
        const response = await axios.post(
            `${API_URL}/api/adult/revoke-access`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    },

    /**
     * Log adult content access
     */
    logAccess: async (action: string, contentId?: string, metadata?: any) => {
        const authToken = getAuthToken();
        const adultToken = getAdultToken();

        const response = await axios.post(
            `${API_URL}/api/adult/log-access`,
            { action, contentId, metadata },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'X-Adult-Token': adultToken,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    },

    /**
     * Get adult access logs (admin only)
     */
    getAccessLogs: async (userId?: number, limit = 100, offset = 0) => {
        const token = getAuthToken();
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId.toString());
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());

        const response = await axios.get(
            `${API_URL}/api/adult/access-logs?${params.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    },

    // Admin-only PIN management functions

    /**
     * Change user's PIN (Admin Only)
     */
    adminChangePin: async (userId: number, newPin: string) => {
        const token = getAuthToken();
        const response = await axios.put(
            `${API_URL}/api/adult/change-pin`,
            { userId, newPin },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    },

    /**
     * Remove user's PIN (Admin Only)
     */
    adminRemovePin: async (userId: number) => {
        const token = getAuthToken();
        const response = await axios.delete(
            `${API_URL}/api/adult/remove-pin/${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    },

    /**
     * Get all users with PIN status (Admin Only)
     */
    adminGetUsersPinStatus: async () => {
        const token = getAuthToken();
        const response = await axios.get(
            `${API_URL}/api/adult/users-pin-status`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    }
};
