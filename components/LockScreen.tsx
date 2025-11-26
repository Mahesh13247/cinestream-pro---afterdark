import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, LogOut, ArrowRight, AlertCircle } from 'lucide-react';

const LockScreen: React.FC = () => {
    const { user, unlock, logout } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await unlock(password);
        } catch (err: any) {
            setError(err.message || 'Incorrect password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl">
            <div className="w-full max-w-md p-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 border border-primary/20">
                        <Lock className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-text mb-2">Welcome Back</h1>
                    <p className="text-text-muted">
                        Enter your password to unlock <span className="text-primary font-semibold">{user?.username}</span>
                    </p>
                </div>

                <form onSubmit={handleUnlock} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-3 text-red-400 text-sm animate-shake">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-center tracking-widest"
                            autoFocus
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-primary hover:bg-blue-400 text-black font-bold rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Unlock Session</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={logout}
                        className="text-text-muted hover:text-red-400 text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Not you? Log out</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LockScreen;
