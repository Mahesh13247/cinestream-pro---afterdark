import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/authApi';
import {
    Users, UserPlus, Trash2, Lock, Unlock, Key, Edit,
    Search, X, AlertCircle, CheckCircle, Shield, User as UserIcon
} from 'lucide-react';

interface User {
    id: number;
    username: string;
    role: 'admin' | 'user';
    isBlocked: number;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
}

const AdminDashboard: React.FC = () => {
    const { user: currentUser, logout } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Form states
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
    const [resetPassword, setResetPassword] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await authApi.getAllUsers();
            if (response.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            showNotification('error', 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await authApi.createUser(newUsername, newPassword, newRole);
            if (response.success) {
                showNotification('success', 'User created successfully');
                setShowAddModal(false);
                setNewUsername('');
                setNewPassword('');
                setNewRole('user');
                fetchUsers();
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            showNotification('error', err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await authApi.deleteUser(userId);
            if (response.success) {
                showNotification('success', 'User deleted successfully');
                fetchUsers();
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            showNotification('error', err.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleBlockUser = async (userId: number, isBlocked: number) => {
        try {
            const response = isBlocked
                ? await authApi.unblockUser(userId)
                : await authApi.blockUser(userId);

            if (response.success) {
                showNotification('success', isBlocked ? 'User unblocked' : 'User blocked');
                fetchUsers();
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            showNotification('error', err.response?.data?.message || 'Failed to update user');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            const response = await authApi.resetPassword(selectedUser.id, resetPassword);
            if (response.success) {
                showNotification('success', 'Password reset successfully');
                setShowResetModal(false);
                setResetPassword('');
                setSelectedUser(null);
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            showNotification('error', err.response?.data?.message || 'Failed to reset password');
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-surface/50 backdrop-blur-xl border-b border-white/10">
                <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary rounded-xl">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
                                <p className="text-text-muted">Manage users and system settings</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-text-muted">Logged in as</p>
                                <p className="text-text font-semibold">{currentUser?.username}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div className="fixed top-6 right-6 z-50 max-w-md w-full animate-slide-in">
                    <div className={`flex items-center gap-4 p-4 rounded-xl shadow-2xl backdrop-blur-xl border border-white/10 ${notification.type === 'success'
                            ? 'bg-surface/90 border-l-4 border-l-green-500'
                            : 'bg-surface/90 border-l-4 border-l-red-500'
                        }`}>
                        <div className={`p-2 rounded-full ${notification.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
                            }`}>
                            {notification.type === 'success' ? (
                                <CheckCircle className={`w-5 h-5 ${notification.type === 'success' ? 'text-green-500' : 'text-red-500'
                                    }`} />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-semibold ${notification.type === 'success' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {notification.type === 'success' ? 'Success' : 'Error'}
                            </h4>
                            <p className="text-text-muted text-sm">{notification.message}</p>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="p-1 hover:bg-white/10 rounded-lg transition text-text-muted hover:text-text"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-surface/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-primary/50 transition duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-muted text-sm font-medium">Total Users</p>
                                <p className="text-3xl font-bold text-text mt-2">{users.length}</p>
                            </div>
                            <div className="p-3 bg-primary/20 rounded-xl">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-green-500/50 transition duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-muted text-sm font-medium">Active Users</p>
                                <p className="text-3xl font-bold text-text mt-2">
                                    {users.filter(u => !u.isBlocked).length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-500/20 rounded-xl">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-red-500/50 transition duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-muted text-sm font-medium">Blocked Users</p>
                                <p className="text-3xl font-bold text-text mt-2">
                                    {users.filter(u => u.isBlocked).length}
                                </p>
                            </div>
                            <div className="p-3 bg-red-500/20 rounded-xl">
                                <Lock className="w-8 h-8 text-red-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-surface/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 w-full sm:max-w-md group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-3 bg-background/50 border border-white/10 rounded-xl text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>

                        {/* Add User Button */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-400 text-black font-bold rounded-xl transition transform hover:scale-105 shadow-lg shadow-primary/20"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>Add User</span>
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-surface/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                            <p className="text-text-muted mt-4 animate-pulse">Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="w-10 h-10 text-text-muted" />
                            </div>
                            <h3 className="text-xl font-semibold text-text mb-2">No users found</h3>
                            <p className="text-text-muted">Try adjusting your search query</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-black/20">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition duration-200 group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                                                        <UserIcon className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-text font-medium">{user.username}</p>
                                                        <p className="text-text-muted text-xs">ID: {user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${user.role === 'admin'
                                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${user.isBlocked
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    }`}>
                                                    {user.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-text-muted text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleBlockUser(user.id, user.isBlocked)}
                                                        disabled={user.id === currentUser?.id}
                                                        className={`p-2 rounded-lg transition ${user.isBlocked
                                                            ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                                                            : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        title={user.isBlocked ? 'Unblock' : 'Block'}
                                                    >
                                                        {user.isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowResetModal(true);
                                                        }}
                                                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition"
                                                        title="Reset Password"
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        disabled={user.id === currentUser?.id}
                                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-surface border border-white/10 rounded-2xl max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div>
                                <h2 className="text-2xl font-bold text-text">Add New User</h2>
                                <p className="text-text-muted text-sm mt-1">Create a new account</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition text-text-muted hover:text-text"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">Username</label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    required
                                    minLength={3}
                                    maxLength={30}
                                    placeholder="Enter username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    required
                                    minLength={8}
                                    placeholder="Enter password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">Role</label>
                                <div className="relative">
                                    <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
                                        className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                                    >
                                        <option value="user" className="bg-surface">User</option>
                                        <option value="admin" className="bg-surface">Admin</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-text-muted">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-text font-medium rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-blue-400 text-black font-bold rounded-xl transition transform hover:scale-[1.02]"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetModal && selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-surface border border-white/10 rounded-2xl max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div>
                                <h2 className="text-2xl font-bold text-text">Reset Password</h2>
                                <p className="text-text-muted text-sm mt-1">Update user credentials</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowResetModal(false);
                                    setSelectedUser(null);
                                    setResetPassword('');
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg transition text-text-muted hover:text-text"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-5">
                            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-full">
                                    <UserIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-text-muted text-xs uppercase tracking-wider font-semibold">Resetting for</p>
                                    <p className="text-text font-bold">{selectedUser.username}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={resetPassword}
                                    onChange={(e) => setResetPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    required
                                    minLength={8}
                                    placeholder="Enter new password"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowResetModal(false);
                                        setSelectedUser(null);
                                        setResetPassword('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-text font-medium rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-blue-400 text-black font-bold rounded-xl transition transform hover:scale-[1.02]"
                                >
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default AdminDashboard;
