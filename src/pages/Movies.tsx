import React, { useEffect, useState, useCallback } from 'react';
import { tmdbApi } from '../services/api';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { Loader, Film } from 'lucide-react';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const Movies = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const fetchMovies = useCallback(async (pageNum: number) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setIsFetchingMore(true);

            const results = await tmdbApi.getPopular('movie', pageNum);

            if (results.length === 0) {
                setHasMore(false);
            } else {
                setMovies(prev => pageNum === 1 ? results : [...prev, ...results]);
            }
        } catch (error) {
            console.error("Failed to fetch movies", error);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchMovies(1);
    }, [fetchMovies]);

    const loadMore = useCallback(() => {
        if (!isFetchingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchMovies(nextPage);
        }
    }, [isFetchingMore, hasMore, page, fetchMovies]);

    const lastElementRef = useInfiniteScroll(loadMore, isFetchingMore);

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-4">
            <div className="w-full max-w-[2000px] mx-auto px-4 md:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <Film className="text-primary w-8 h-8" />
                    <h1 className="text-3xl font-bold text-text">Movies</h1>
                </div>

                {loading && page === 1 ? (
                    <div className="flex justify-center py-20">
                        <Loader className="animate-spin text-primary w-10 h-10" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 min-[1800px]:grid-cols-8 gap-4 md:gap-6">
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
    );
};

export default Movies;
