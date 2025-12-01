import React from 'react';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { Link } from 'react-router-dom';
import { tmdbApi } from '../services/api';
import { Clock, Trash2, Play } from 'lucide-react';

const History = () => {
    const { history, clearHistory, removeFromHistory } = useWatchHistory();

    return (
        <div className="min-h-screen bg-background pt-24 px-4 md:px-8 pb-20">
            <div className="max-w-[1800px] mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-text flex items-center gap-3">
                        <Clock className="text-primary" />
                        Watch History
                    </h1>
                    {history.length > 0 && (
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to clear your watch history?')) {
                                    clearHistory();
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} />
                            Clear History
                        </button>
                    )}
                </div>

                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                        <Clock size={64} className="mb-4 opacity-20" />
                        <p className="text-xl">Your watch history is empty</p>
                        <Link to="/" className="mt-4 text-primary hover:underline">
                            Start watching something!
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {history.map((item) => (
                            <div
                                key={`${item.id}-${item.lastWatched}`}
                                className="group relative"
                            >
                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeFromHistory(item.id);
                                    }}
                                    className="absolute top-2 right-2 z-20 w-8 h-8 bg-black/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 border border-white/20 hover:border-red-500"
                                    title="Remove from History"
                                >
                                    <Trash2 size={14} className="text-white" />
                                </button>

                                <Link
                                    to={`/watch/${item.tmdbId}`}
                                    className="block bg-surface rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all"
                                >
                                    <div className="aspect-[2/3] relative">
                                        <img
                                            src={tmdbApi.getImageUrl(item.poster_path)}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Play className="w-12 h-12 text-white fill-current" />
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="text-sm font-medium text-text truncate group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-text-muted mt-1">
                                            Watched {new Date(item.lastWatched).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
