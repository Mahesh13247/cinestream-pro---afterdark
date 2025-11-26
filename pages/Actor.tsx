import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdbApi } from '../services/api';
import { ActorDetails, ActorCredits, Movie } from '../types';
import { Star, Calendar, MapPin, Film, Tv, ArrowLeft } from 'lucide-react';

const Actor = () => {
    const { actorId } = useParams<{ actorId: string }>();
    const [actor, setActor] = useState<ActorDetails | null>(null);
    const [movieCredits, setMovieCredits] = useState<ActorCredits | null>(null);
    const [tvCredits, setTVCredits] = useState<ActorCredits | null>(null);
    const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActorData = async () => {
            if (!actorId) return;
            setLoading(true);
            setError(null);
            try {
                const [actorData, movieData, tvData] = await Promise.all([
                    tmdbApi.getActorDetails(actorId),
                    tmdbApi.getActorMovieCredits(actorId),
                    tmdbApi.getActorTVCredits(actorId)
                ]);
                setActor(actorData);
                setMovieCredits(movieData);
                setTVCredits(tvData);
            } catch (error) {
                console.error(error);
                setError("Failed to load actor details.");
            } finally {
                setLoading(false);
            }
        };
        fetchActorData();
    }, [actorId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-primary font-medium">Loading actor details...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-red-500 gap-4">
            <p className="text-xl">{error}</p>
            <Link to="/" className="px-4 py-2 bg-primary text-black rounded hover:bg-blue-400">
                Go Home
            </Link>
        </div>
    );

    if (!actor) return <div className="min-h-screen flex items-center justify-center">Actor not found</div>;

    const movies = movieCredits?.cast.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)) || [];
    const tvShows = tvCredits?.cast.map(show => ({ ...show, title: show.name, release_date: show.first_air_date })).sort((a, b) => (b.popularity || 0) - (a.popularity || 0)) || [];

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-surface to-background">
                <div className="w-full max-w-[2000px] mx-auto px-4 md:px-8 py-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-6">
                        <ArrowLeft size={20} /> Back
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Profile Photo */}
                        <div className="w-64 md:w-80 flex-shrink-0 mx-auto md:mx-0">
                            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                                <img
                                    src={tmdbApi.getImageUrl(actor.profile_path, 'original')}
                                    alt={actor.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-4 mb-8 border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('movies')}
                                className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${activeTab === 'movies'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-text-muted hover:text-text'
                                    }`}
                            >
                                <Film size={20} />
                                Movies ({movies.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('tv')}
                                className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${activeTab === 'tv'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-text-muted hover:text-text'
                                    }`}
                            >
                                <Tv size={20} />
                                TV Shows ({tvShows.length})
                            </button>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {(activeTab === 'movies' ? movies : tvShows).map((item: Movie) => (
                                <div key={item.id} className="transform transition-transform hover:-translate-y-1">
                                    <Link
                                        to={`/${activeTab === 'movies' ? 'movies' : 'webseries'}/${item.id}`}
                                        className="group relative block"
                                    >
                                        <div className="relative bg-surface backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30">
                                            <div className="relative aspect-[2/3] w-full overflow-hidden">
                                                <img
                                                    src={tmdbApi.getImageUrl(item.poster_path)}
                                                    alt={item.title || item.name}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                                                {item.vote_average > 0 && (
                                                    <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-full border border-yellow-500/30">
                                                        <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                                        <span className="text-yellow-400 text-xs font-bold">{item.vote_average.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-3">
                                                <h3 className="text-sm font-bold text-text line-clamp-2 group-hover:text-primary transition-colors">
                                                    {item.title || item.name}
                                                </h3>
                                                {(item.release_date || item.first_air_date) && (
                                                    <p className="text-xs text-text-muted mt-1">
                                                        {new Date(item.release_date || item.first_air_date || '').getFullYear()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {activeTab === 'movies' && movies.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                <Film size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No movies found</p>
                            </div>
                        )}

                        {activeTab === 'tv' && tvShows.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                <Tv size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No TV shows found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Actor;
