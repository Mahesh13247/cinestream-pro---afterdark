import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { tmdbApi } from '../services/api';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { Search as SearchIcon, Loader } from 'lucide-react';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const fetchResults = useCallback(async (pageNum: number, q: string) => {
        if (!q) {
            setMovies([]);
            return;
        }

        try {
            if (pageNum === 1) setLoading(true);
            else setIsFetchingMore(true);

            const results = await tmdbApi.search(q, pageNum);
            // Filter out people and items without images for cleaner look
            const filtered = results.filter((m: Movie) => m.media_type !== 'person' && (m.poster_path || m.backdrop_path));

            if (filtered.length === 0) {
                setHasMore(false);
            } else {
                setMovies(prev => pageNum === 1 ? filtered : [...prev, ...filtered]);
            }
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    }, []);

    // Reset when query changes
    useEffect(() => {
        setPage(1);
        setMovies([]);
        setHasMore(true);

        const debounce = setTimeout(() => {
            fetchResults(1, query);
        }, 500);

        return () => clearTimeout(debounce);
    }, [query, fetchResults]);

    const loadMore = useCallback(() => {
        if (!isFetchingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchResults(nextPage, query);
        }
    }, [isFetchingMore, hasMore, page, query, fetchResults]);

    const lastElementRef = useInfiniteScroll(loadMore, isFetchingMore);

    return (
        <div className="min-h-screen bg-background pt-24 pb-20 px-4">
            <div className="w-full max-w-[2000px] mx-auto px-4 md:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <SearchIcon className="text-primary w-8 h-8" />
                    <h1 className="text-3xl font-bold text-text">
                        Search Results for <span className="text-primary">"{query}"</span>
                    </h1>
                </div>

                {loading && page === 1 ? (
                    <div className="flex justify-center py-20">
                        <Loader className="animate-spin text-primary w-10 h-10" />
                    </div>
                ) : movies.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
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
                ) : (
                    <div className="text-center py-20 text-text-muted">
                        <p className="text-xl">No results found for "{query}"</p>
                        <p className="mt-2">Try searching for a different movie or TV show.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
