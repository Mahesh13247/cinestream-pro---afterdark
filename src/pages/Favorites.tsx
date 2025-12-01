import React, { useEffect, useState } from 'react';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = () => {
    const [favorites, setFavorites] = useState<Movie[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('watchlist');
        if (stored) {
            setFavorites(JSON.parse(stored));
        }
    }, []);

    const removeMovie = (id: number) => {
        const updated = favorites.filter(m => m.id !== id);
        setFavorites(updated);
        localStorage.setItem('watchlist', JSON.stringify(updated));
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-4">
            <div className="w-full max-w-[2000px] mx-auto px-4 md:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="text-red-500 w-8 h-8" fill="currentColor" />
                    <h1 className="text-3xl font-bold text-text">My Watchlist</h1>
                </div>

                {favorites.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {favorites.map((movie) => (
                            <div key={movie.id} className="relative group">
                                <MovieCard movie={movie} />
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removeMovie(movie.id);
                                    }}
                                    className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                    title="Remove from Watchlist"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-text-muted">
                        <Heart size={64} className="mx-auto mb-4 opacity-20" />
                        <p className="text-xl font-medium text-text-muted">Your watchlist is empty</p>
                        <p className="mt-2 mb-6">Start adding movies and shows you want to watch!</p>
                        <Link to="/" className="bg-primary text-black font-bold px-6 py-2 rounded-lg hover:bg-blue-400 transition-colors">
                            Browse Movies
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
