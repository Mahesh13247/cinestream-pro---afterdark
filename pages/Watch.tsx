import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tmdbApi } from '../services/api';
import { MovieDetails } from '../types';
import { ArrowLeft, Info, Server, Star, Calendar, Clock } from 'lucide-react';
import { providerManager, initializeProviders } from '../providers';
import type { Stream } from '../providers/types';
import { useContinueWatching } from '../hooks/useContinueWatching';
import { useWatchHistory } from '../hooks/useWatchHistory';

const Watch = () => {
    const { movieId } = useParams<{ movieId: string }>();
    const navigate = useNavigate();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [selectedServer, setSelectedServer] = useState(0);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [iframeError, setIframeError] = useState(false);
    const { saveProgress } = useContinueWatching();
    const { addToHistory } = useWatchHistory();

    // Initialize providers on mount
    useEffect(() => {
        initializeProviders();
    }, []);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            if (!movieId) return;
            setLoading(true);
            try {
                const data = await tmdbApi.getDetails(movieId, 'movie');
                setMovie(data);

                // Save to Continue Watching
                saveProgress({
                    id: data.id.toString(),
                    tmdbId: data.id.toString(),
                    title: data.title || data.name || 'Unknown',
                    poster_path: data.poster_path || '',
                    backdrop_path: data.backdrop_path || '',
                    progress: 0, // Can't track real progress with embeds
                    timestamp: Date.now(),
                    type: 'movie',
                });

                // Save to History
                addToHistory({
                    id: data.id.toString(),
                    tmdbId: data.id.toString(),
                    title: data.title || data.name || 'Unknown',
                    poster_path: data.poster_path || '',
                    backdrop_path: data.backdrop_path || '',
                    progress: 0,
                    timestamp: Date.now(),
                    type: 'movie',
                });

                // Fetch streams from providers
                const availableStreams = await providerManager.getStreamsFromAll(
                    `/movie/${movieId}`,
                    'movie'
                );
                setStreams(availableStreams);
                // console.log('Available streams:', availableStreams);
            } catch (error) {
                console.error('Failed to fetch movie details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovieDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [movieId]); // Only re-fetch when movieId changes

    // Reset iframe loading state when server changes
    useEffect(() => {
        setIframeLoading(true);
        setIframeError(false);
    }, [selectedServer]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-primary text-xl font-medium">Loading player...</p>
                </div>
            </div>
        );
    }

    if (!movie || !movieId) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 text-xl">Movie not found</p>
                <Link to="/" className="px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-blue-400 transition-all">
                    Go Home
                </Link>
            </div>
        );
    }

    // Use streams from provider or fallback to default
    const currentStream = streams[selectedServer] || streams[0];

    return (
        <div className="min-h-screen bg-background">
            {/* Enhanced Header with Movie Info */}
            <div className="bg-surface/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-3 md:py-4">
                    <div className="flex items-center justify-between gap-3 md:gap-4">
                        {/* Left: Back Button & Movie Title */}
                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-text hover:text-primary transition-all border border-white/10"
                                aria-label="Go back"
                            >
                                <ArrowLeft size={18} className="md:w-5 md:h-5" />
                            </button>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-base md:text-xl font-bold text-text truncate leading-tight">
                                    {movie.title || movie.name}
                                </h1>
                                <div className="flex items-center gap-3 text-[10px] md:text-sm text-text-muted mt-0.5">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} className="md:w-[14px] md:h-[14px]" />
                                        {new Date(movie.release_date || movie.first_air_date || '').getFullYear()}
                                    </span>
                                    {movie.runtime && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} className="md:w-[14px] md:h-[14px]" />
                                            {movie.runtime} min
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Star size={12} className="md:w-[14px] md:h-[14px] fill-yellow-500 text-yellow-500" />
                                        {movie.vote_average.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Details Button */}
                        <Link
                            to={`/movies/${movieId}`}
                            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-white/90 dark:bg-white/10 text-gray-900 dark:text-white rounded-lg hover:bg-white dark:hover:bg-white/20 transition-all border border-black/10 dark:border-white/10 font-medium text-xs md:text-sm"
                        >
                            <Info size={16} />
                            <span className="hidden sm:inline">Details</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-6 md:py-8">
                {/* Server Selection - Improved Design */}
                {streams.length > 0 && (
                    <div className="mb-6">
                        <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Server size={16} className="text-primary" />
                                </div>
                                <h3 className="text-sm font-semibold text-text">Select Server ({streams.length} available)</h3>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {streams.map((stream, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedServer(index)}
                                        className={`px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all flex-1 sm:flex-none whitespace-nowrap ${selectedServer === index
                                            ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105'
                                            : 'bg-white/5 text-text hover:bg-white/10 border border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        {stream.server}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Video Player - Enhanced */}
                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-8">
                    {/* Loading Indicator */}
                    {iframeLoading && !iframeError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black z-10">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
                                    <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0"></div>
                                </div>
                                <div className="text-center">
                                    <p className="text-white text-base font-medium mb-1">
                                        Loading {currentStream?.server || 'player'}
                                    </p>
                                    <p className="text-gray-400 text-sm">Please wait...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {iframeError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black z-10">
                            <div className="flex flex-col items-center gap-4 text-center px-4 max-w-md">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <Server size={32} className="text-red-500" />
                                </div>
                                <div>
                                    <p className="text-red-500 text-lg font-bold mb-2">Failed to load video player</p>
                                    <p className="text-gray-400 text-sm">
                                        The {currentStream?.server || 'selected'} server is currently unavailable. Please try a different server.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIframeError(false);
                                        setIframeLoading(true);
                                    }}
                                    className="px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-blue-400 transition-all shadow-lg"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStream && (
                        <iframe
                            src={currentStream.link}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            title={movie.title || movie.name}
                            onLoad={() => setIframeLoading(false)}
                            onError={() => {
                                setIframeLoading(false);
                                setIframeError(true);
                            }}
                        />
                    )}
                </div>

                {/* Movie Info - Enhanced Design */}
                <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-text mb-4 flex items-center gap-3">
                        <div className="w-1 h-8 bg-primary rounded-full"></div>
                        About This Movie
                    </h2>
                    <p className="text-text-muted leading-relaxed mb-6 text-base">{movie.overview}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/10">
                            <div className="flex items-center gap-2 text-text-muted text-xs md:text-sm mb-1">
                                <Star size={14} className="text-yellow-500 md:w-4 md:h-4" />
                                <span>Rating</span>
                            </div>
                            <p className="text-text font-bold text-lg md:text-xl">
                                {movie.vote_average.toFixed(1)}<span className="text-text-muted text-sm md:text-base font-normal">/10</span>
                            </p>
                        </div>

                        <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/10">
                            <div className="flex items-center gap-2 text-text-muted text-xs md:text-sm mb-1">
                                <Calendar size={14} className="md:w-4 md:h-4" />
                                <span>Release Date</span>
                            </div>
                            <p className="text-text font-bold text-base md:text-lg truncate">
                                {new Date(movie.release_date || movie.first_air_date || '').toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        {movie.runtime && (
                            <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/10">
                                <div className="flex items-center gap-2 text-text-muted text-xs md:text-sm mb-1">
                                    <Clock size={14} className="md:w-4 md:h-4" />
                                    <span>Runtime</span>
                                </div>
                                <p className="text-text font-bold text-base md:text-lg">{movie.runtime} min</p>
                            </div>
                        )}

                        <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/10">
                            <div className="text-text-muted text-xs md:text-sm mb-1">Genres</div>
                            <div className="flex flex-wrap gap-1">
                                {movie.genres.slice(0, 3).map(g => (
                                    <span key={g.id} className="text-text font-medium text-[10px] md:text-sm bg-primary/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                                        {g.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Movies - Enhanced */}
                {movie.similar && movie.similar.results.length > 0 && (
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-text mb-6 flex items-center gap-3">
                            <div className="w-1 h-8 bg-primary rounded-full"></div>
                            You May Also Like
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {movie.similar.results.slice(0, 6).map((similar) => (
                                <Link
                                    key={similar.id}
                                    to={`/watch/${similar.id}`}
                                    className="group"
                                >
                                    <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-surface border border-white/10 group-hover:border-primary/50 transition-all">
                                        <img
                                            src={tmdbApi.getImageUrl(similar.poster_path)}
                                            alt={similar.title || similar.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <p className="text-sm font-medium text-text truncate group-hover:text-primary transition-colors">
                                        {similar.title || similar.name}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-text-muted">
                                        <Star size={12} className="fill-yellow-500 text-yellow-500" />
                                        {similar.vote_average.toFixed(1)}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Watch;
