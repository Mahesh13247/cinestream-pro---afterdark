import { useState, useEffect } from 'react';

export interface ContinueWatchingItem {
    id: string;
    tmdbId: string;
    title: string;
    poster_path: string;
    backdrop_path: string;
    progress: number; // 0 to 100
    timestamp: number;
    type: 'movie' | 'tv';
    season?: number;
    episode?: number;
    lastWatched: number;
}

const STORAGE_KEY = 'continue_watching';

export const useContinueWatching = () => {
    const [items, setItems] = useState<ContinueWatchingItem[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse continue watching data', e);
            }
        }
    }, []);

    const saveProgress = (item: Omit<ContinueWatchingItem, 'lastWatched'>) => {
        setItems(prev => {
            const filtered = prev.filter(i => i.id !== item.id);
            const newItem = { ...item, lastWatched: Date.now() };
            const newItems = [newItem, ...filtered].slice(0, 20); // Keep last 20 items
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
            return newItems;
        });
    };

    const removeItem = (id: string) => {
        setItems(prev => {
            const newItems = prev.filter(i => i.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
            return newItems;
        });
    };

    return { items, saveProgress, removeItem };
};
