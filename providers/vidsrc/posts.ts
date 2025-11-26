import { GetPostsParams, GetSearchPostsParams, Post } from '../types';
import { tmdbApi } from '../../services/api';

/**
 * VidSrc Posts Provider
 * Uses TMDB API for content discovery
 */

export async function getPosts(params: GetPostsParams): Promise<Post[]> {
    const { filter, page } = params;

    try {
        let results: any[] = [];

        // Parse filter to determine what to fetch
        if (filter.includes('/trending/movie')) {
            results = await tmdbApi.getTrending('week');
        } else if (filter.includes('/popular/movie')) {
            results = await tmdbApi.getPopular('movie', page);
        } else if (filter.includes('/top-rated/movie')) {
            results = await tmdbApi.getTopRated('movie', page);
        } else if (filter.includes('/trending/tv')) {
            results = await tmdbApi.getTrendingTV();
        } else if (filter.includes('/popular/tv')) {
            results = await tmdbApi.getPopular('tv', page);
        } else if (filter.includes('/genre/')) {
            const genreId = filter.split('/genre/')[1];
            results = await tmdbApi.getMoviesByGenre(genreId, page);
        } else {
            results = await tmdbApi.getPopular('movie', page);
        }

        // Convert to Post format
        return results.map(item => ({
            id: item.id.toString(),
            title: item.title || item.name || 'Unknown',
            image: tmdbApi.getImageUrl(item.poster_path),
            link: `/movie/${item.id}`, // or /tv/${item.id} for TV shows
            type: item.media_type === 'tv' || item.name ? 'tv' : 'movie',
            year: item.release_date || item.first_air_date
                ? new Date(item.release_date || item.first_air_date).getFullYear().toString()
                : undefined,
            rating: item.vote_average,
            provider: 'vidsrc',
        }));
    } catch (error) {
        console.error('Failed to fetch posts:', error);
        return [];
    }
}

export async function getSearchPosts(params: GetSearchPostsParams): Promise<Post[]> {
    const { searchQuery, page } = params;

    try {
        const results = await tmdbApi.search(searchQuery, page);

        // Filter out people and convert to Post format
        return results
            .filter((item: any) => item.media_type !== 'person')
            .map((item: any) => ({
                id: item.id.toString(),
                title: item.title || item.name || 'Unknown',
                image: tmdbApi.getImageUrl(item.poster_path),
                link: `/${item.media_type || 'movie'}/${item.id}`,
                type: item.media_type === 'tv' ? 'tv' : 'movie',
                year: item.release_date || item.first_air_date
                    ? new Date(item.release_date || item.first_air_date).getFullYear().toString()
                    : undefined,
                rating: item.vote_average,
                provider: 'vidsrc',
            }));
    } catch (error) {
        console.error('Failed to search posts:', error);
        return [];
    }
}
