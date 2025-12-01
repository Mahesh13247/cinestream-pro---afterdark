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
        } catch (error: any) {
            showNotification('error', error.response?.data?.message || 'Failed to create user');
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
        } catch (error: any) {
            showNotification('error', error.response?.data?.message || 'Failed to delete user');
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
        } catch (error: any) {
            showNotification('error', error.response?.data?.message || 'Failed to update user');
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
        } catch (error: any) {
            showNotification('error', error.response?.data?.message || 'Failed to reset password');
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
                <div className={`fixed top-4 right-4 z-50 max-w-md animate-slide-in`}>
                    <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg ${notification.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/50'
                        : 'bg-red-500/20 border border-red-500/50'
                        }`}>
                        {notification.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={notification.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                            {notification.message}
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-surface/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-muted text-sm">Total Users</p>
                                <p className="text-3xl font-bold text-text mt-1">{users.length}</p>
                            </div>
                            <Users className="w-12 h-12 text-primary" />
                        </div>
                    </div>
                    <div className="bg-surface/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-muted text-sm">Active Users</p>
                                <p className="text-3xl font-bold text-text mt-1">
                                    {users.filter(u => !u.isBlocked).length}
                                </p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-surface/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-muted text-sm">Blocked Users</p>
                                <p className="text-3xl font-bold text-text mt-1">
                                    {users.filter(u => u.isBlocked).length}
                                </p>
                            </div>
                            <Lock className="w-12 h-12 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-surface/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-2 bg-background border border-white/10 rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Add User Button */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-black font-bold rounded-lg transition transform hover:scale-105"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>Add User</span>
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-surface/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            <p className="text-text-muted mt-4">Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
                            <p className="text-text-muted">No users found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/20 rounded-lg">
                                                        <UserIcon className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-text font-medium">{user.username}</p>
                                                        <p className="text-text-muted text-sm">ID: {user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin'
                                                    ? 'bg-purple-500/20 text-purple-400'
                                                    : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isBlocked
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-green-500/20 text-green-400'
                                                    }`}>
                                                    {user.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-text-muted text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleBlockUser(user.id, user.isBlocked)}
                                                        disabled={user.id === currentUser?.id}
                                                        className={`p-2 rounded-lg transition ${user.isBlocked
                                                            ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                                                            : 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
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
                                                        className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition"
                                                        title="Reset Password"
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        disabled={user.id === currentUser?.id}
                                                        className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-2xl max-w-md w-full border border-white/10 shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-2xl font-bold text-text">Add New User</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">Username</label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-text focus:outline-none focus:border-primary"
                                    required
                                    minLength={3}
                                    maxLength={30}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-text focus:outline-none focus:border-primary"
                                    required
                                    minLength={8}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">Role</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
                                    className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-text focus:outline-none focus:border-primary"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 bg-surface hover:bg-white/10 text-text rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-black font-bold rounded-lg transition hover:bg-blue-400"
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
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-2xl max-w-md w-full border border-white/10 shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-2xl font-bold text-text">Reset Password</h2>
                            <button
                                onClick={() => {
                                    setShowResetModal(false);
                                    setSelectedUser(null);
                                    setResetPassword('');
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            <p className="text-text-muted">
                                Reset password for <span className="text-text font-semibold">{selectedUser.username}</span>
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={resetPassword}
                                    onChange={(e) => setResetPassword(e.target.value)}
                                    className="w-full px-4 py-2 bg-background border border-white/10 rounded-lg text-text focus:outline-none focus:border-primary"
                                    required
                                    minLength={8}
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
                                    className="flex-1 px-4 py-2 bg-surface hover:bg-white/10 text-text rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-black font-bold rounded-lg transition hover:bg-blue-400"
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
