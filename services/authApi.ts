import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cinestream-pro-afterdark.onrender.com';


// Create axios instance
const authClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
authClient.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
authClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
            window.location.href = '/#/login';
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    // Login
    login: async (username: string, password: string) => {
        const response = await authClient.post('/api/auth/login', { username, password });
        return response.data;
    },

    // Logout
    logout: async () => {
        const response = await authClient.post('/api/auth/logout');
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await authClient.get('/api/auth/me');
        return response.data;
    },

    // Admin: Get all users
    getAllUsers: async (page = 1, limit = 50) => {
        const response = await authClient.get('/api/admin/users', {
            params: { page, limit },
        });
        return response.data;
    },

    // Admin: Create user
    createUser: async (username: string, password: string, role: 'admin' | 'user') => {
        const response = await authClient.post('/api/admin/users', {
            username,
            password,
            role,
        });
        return response.data;
    },

    // Admin: Update user
    updateUser: async (id: number, updates: { username?: string; role?: string }) => {
        const response = await authClient.put(`/api/admin/users/${id}`, updates);
        return response.data;
    },

    // Admin: Delete user
    deleteUser: async (id: number) => {
        const response = await authClient.delete(`/api/admin/users/${id}`);
        return response.data;
    },

    // Admin: Block user
    blockUser: async (id: number) => {
        const response = await authClient.patch(`/api/admin/users/${id}/block`);
        return response.data;
    },

    // Admin: Unblock user
    unblockUser: async (id: number) => {
        const response = await authClient.patch(`/api/admin/users/${id}/unblock`);
        return response.data;
    },

    // Admin: Reset password
    resetPassword: async (id: number, newPassword: string) => {
        const response = await authClient.patch(`/api/admin/users/${id}/reset-password`, {
            newPassword,
        });
        return response.data;
    },
};

export default authClient;
