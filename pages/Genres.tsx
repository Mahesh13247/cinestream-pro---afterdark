import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tmdbApi } from '../services/api';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { Loader, Filter } from 'lucide-react';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const GENRES = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Sci-Fi' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' },
];

const Genres = () => {
    const { genreId } = useParams();
    const navigate = useNavigate();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    // Default to Action if no genre selected
    const activeGenreId = genreId || '28';
    const activeGenreName = GENRES.find(g => g.id.toString() === activeGenreId)?.name || 'Unknown';

    const fetchMovies = useCallback(async (pageNum: number, gId: string) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setIsFetchingMore(true);

            const results = await tmdbApi.getMoviesByGenre(gId, pageNum);

            if (results.length === 0) {
                setHasMore(false);
            } else {
                setMovies(prev => pageNum === 1 ? results : [...prev, ...results]);
            }
        } catch (error) {
            console.error("Failed to fetch genre movies", error);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    }, []);

    // Reset when genre changes
    useEffect(() => {
        setPage(1);
        setMovies([]);
        setHasMore(true);
        fetchMovies(1, activeGenreId);
    }, [activeGenreId, fetchMovies]);

    const loadMore = useCallback(() => {
        if (!isFetchingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchMovies(nextPage, activeGenreId);
        }
    }, [isFetchingMore, hasMore, page, activeGenreId, fetchMovies]);

    const lastElementRef = useInfiniteScroll(loadMore, isFetchingMore);

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-4">
            <div className="w-full max-w-[2000px] mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar / Filter */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-surface p-4 rounded-xl border border-white/10 sticky top-24">
                            <div className="flex items-center gap-2 mb-4 text-primary font-bold">
                                <Filter size={20} />
                                <h2>Select Genre</h2>
                            </div>
                            <div className="flex flex-wrap md:flex-col gap-2">
                                {GENRES.map(genre => (
                                    <button
                                        key={genre.id}
                                        onClick={() => navigate(`/genres/${genre.id}`)}
                                        className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${activeGenreId === genre.id.toString()
                                            ? 'bg-primary text-black font-bold'
                                            : 'bg-surface text-text-muted hover:bg-white/10 hover:text-text'
                                            }`}
                                    >
                                        {genre.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-text mb-6 border-l-4 border-primary pl-4">
                            {activeGenreName} Movies
                        </h1>

                        {loading && page === 1 ? (
                            <div className="flex justify-center py-20">
                                <Loader className="animate-spin text-primary w-10 h-10" />
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                    {movies.map((movie, index) => (
                                        <div key={`${movie.id}-${index}`} ref={index === movies.length - 1 ? lastElementRef : null}>
                                            <MovieCard movie={movie} />
                                        </div>
                                    ))}
                                </div>
                                {isFetchingMore && (
                                    <div className="flex justify-center py-8">
                                        <Loader className="animate-spin text-primary w-8 h-8" />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Genres;
