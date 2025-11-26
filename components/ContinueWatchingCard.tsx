import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, X } from 'lucide-react';
import { Movie } from '../types';
import { tmdbApi } from '../services/api';

interface ContinueWatchingCardProps {
    movie: Movie;
    onRemove: (id: string) => void;
}

const ContinueWatchingCard: React.FC<ContinueWatchingCardProps> = ({ movie, onRemove }) => {
    const title = movie.title || movie.name || 'Untitled';
    const date = movie.release_date || movie.first_air_date || '';
    const year = date ? new Date(date).getFullYear() : '';
    const isTv = movie.media_type === 'tv' || !!movie.name;
    const rating = (movie.vote_average || 0).toFixed(1);

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove(movie.id.toString());
    };

    return (
        <Link
            to={`/${isTv ? 'webseries' : 'movies'}/${movie.id}`}
            className="group relative block"
        >
            {/* Delete Button */}
            <button
                onClick={handleRemove}
                className="absolute top-2 right-2 z-20 w-8 h-8 bg-black/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/20 hover:border-red-500"
                title="Remove from Continue Watching"
            >
                <X className="w-4 h-4 text-white" />
            </button>

            {/* Card Container with Modern Shadow */}
            <div className="relative backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl bg-card-bg border" style={{ borderColor: 'var(--color-border)', boxShadow: '0 4px 6px var(--color-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-border-hover)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}>

                {/* Poster Image */}
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                    <img
                        src={tmdbApi.getImageUrl(movie.poster_path)}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlay - Theme Aware */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-16 h-16 rounded-full bg-primary backdrop-blur-md flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                            <Play className="w-7 h-7 text-black fill-current ml-1" />
                        </div>
                    </div>

                    {/* Bottom Info Bar - Always Visible on Mobile */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300">
                        <div className="space-y-2">
                            {/* Title - Always white for visibility on image overlay */}
                            <h3 className="font-bold text-white text-sm md:text-base line-clamp-2 drop-shadow-lg leading-tight">
                                {title}
                            </h3>

                            {/* Meta Info */}
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-gray-300 text-xs font-medium">{year}</span>

                                {/* Rating Badge */}
                                {rating !== '0.0' && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full border border-yellow-500/30">
                                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                        <span className="text-yellow-400 text-xs font-bold">{rating}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glow Effect on Hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
        </Link>
    );
};

export default ContinueWatchingCard;
