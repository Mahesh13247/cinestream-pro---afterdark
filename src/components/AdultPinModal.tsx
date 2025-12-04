import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface AdultPinModalProps {
    isOpen: boolean;
    mode: 'setup' | 'verify';
    onClose: () => void;
    onSubmit: (pin: string) => Promise<{ success: boolean; message: string }>;
    isLocked?: boolean;
    remainingAttempts?: number;
}

const AdultPinModal: React.FC<AdultPinModalProps> = ({
    isOpen,
    mode,
    onClose,
    onSubmit,
    isLocked = false,
    remainingAttempts = 3
}) => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setPin('');
            setConfirmPin('');
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

    const handlePinChange = (value: string) => {
        // Only allow digits
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length <= 6) {
            setPin(digitsOnly);
            setError('');
        }
    };

    const handleConfirmPinChange = (value: string) => {
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length <= 6) {
            setConfirmPin(digitsOnly);
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (pin.length < 4) {
            setError('PIN must be at least 4 digits');
            return;
        }

        if (mode === 'setup') {
            if (pin !== confirmPin) {
                setError('PINs do not match');
                return;
            }
        }

        setLoading(true);

        try {
            const result = await onSubmit(pin);

            if (result.success) {
                setSuccess(result.message);
                setTimeout(() => {
                    onClose();
                }, 1000);
            } else {
                setError(result.message);
                setPin('');
                setConfirmPin('');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md mx-4">
                <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-secondary" />
                        </div>
                        <h2 className="text-2xl font-bold text-text mb-2">
                            {mode === 'setup' ? 'Set Adult Content PIN' : 'Enter PIN'}
                        </h2>
                        <p className="text-sm text-text-muted">
                            {mode === 'setup'
                                ? 'Create a 4-6 digit PIN to secure adult content access'
                                : 'Enter your PIN to access adult content'
                            }
                        </p>
                    </div>

                    {/* Locked Out Warning */}
                    {isLocked && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                            <Clock className="text-red-500 shrink-0 mt-0.5" size={20} />
                            <div className="text-sm text-red-400">
                                <p className="font-semibold">Account Locked</p>
                                <p className="text-xs mt-1">Too many failed attempts. Please try again in 5 minutes.</p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* PIN Input */}
                        <div>
                            <label className="block text-sm font-medium text-text mb-2">
                                {mode === 'setup' ? 'Create PIN' : 'PIN'}
                            </label>
                            <input
                                ref={inputRef}
                                type={showPin ? 'text' : 'password'}
                                value={pin}
                                onChange={(e) => handlePinChange(e.target.value)}
                                placeholder="Enter 4-6 digits"
                                className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:border-secondary transition-colors"
                                disabled={loading || isLocked}
                                maxLength={6}
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        </div>

                        {/* Confirm PIN (Setup mode only) */}
                        {mode === 'setup' && (
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">
                                    Confirm PIN
                                </label>
                                <input
                                    type={showPin ? 'text' : 'password'}
                                    value={confirmPin}
                                    onChange={(e) => handleConfirmPinChange(e.target.value)}
                                    placeholder="Re-enter PIN"
                                    className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:border-secondary transition-colors"
                                    disabled={loading}
                                    maxLength={6}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                />
                            </div>
                        )}

                        {/* Show PIN Toggle */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showPin"
                                checked={showPin}
                                onChange={(e) => setShowPin(e.target.checked)}
                                className="w-4 h-4 text-secondary bg-input-bg border-input-border rounded focus:ring-secondary"
                            />
                            <label htmlFor="showPin" className="text-sm text-text-muted cursor-pointer">
                                Show PIN
                            </label>
                        </div>

                        {/* Remaining Attempts (Verify mode only) */}
                        {mode === 'verify' && !isLocked && remainingAttempts < 3 && (
                            <div className="text-sm text-orange-400 flex items-center gap-2">
                                <AlertCircle size={16} />
                                <span>{remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining</span>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2">
                                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-green-400">{success}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || isLocked || pin.length < 4 || (mode === 'setup' && confirmPin.length < 4)}
                            className="w-full bg-secondary hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                mode === 'setup' ? 'Set PIN' : 'Verify PIN'
                            )}
                        </button>

                        {/* Cancel Button */}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-6 p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-text-muted text-center">
                            🔒 Your PIN is encrypted and stored securely. After 3 failed attempts, access will be locked for 5 minutes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdultPinModal;
