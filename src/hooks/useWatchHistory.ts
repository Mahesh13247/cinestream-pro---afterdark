import { useState, useEffect } from 'react';
import { ContinueWatchingItem } from './useContinueWatching';

const STORAGE_KEY = 'watch_history';

export const useWatchHistory = () => {
    const [history, setHistory] = useState<ContinueWatchingItem[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse watch history', e);
            }
        }
    }, []);

    const addToHistory = (item: Omit<ContinueWatchingItem, 'lastWatched'>) => {
        setHistory(prev => {
            // Remove existing entry for same ID to avoid duplicates
            const filtered = prev.filter(i => i.id !== item.id);
            const newItem = { ...item, lastWatched: Date.now() };
            const newHistory = [newItem, ...filtered].slice(0, 100); // Keep last 100 items
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    const removeFromHistory = (id: string) => {
        setHistory(prev => {
            const newHistory = prev.filter(i => i.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    return { history, addToHistory, clearHistory, removeFromHistory };
};
