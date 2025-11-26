import { GetMetaParams, Info, SeasonLink } from '../types';
import { tmdbApi } from '../../services/api';

/**
 * VidSrc Meta Provider
 * Uses TMDB API for metadata
 */

export async function getMeta(params: GetMetaParams): Promise<Info> {
    const { link } = params;

    // Extract ID and type from link
    const match = link.match(/\/(movie|tv)\/(\d+)/);
    if (!match) {
        throw new Error('Invalid link format');
    }

    const [, type, id] = match;
    const mediaType = type as 'movie' | 'tv';

    try {
        const details = await tmdbApi.getDetails(id, mediaType);

        // Build season links for TV shows
        let linkList: SeasonLink[] | undefined;
        if (mediaType === 'tv' && (details as any).number_of_seasons) {
            linkList = Array.from({ length: (details as any).number_of_seasons }, (_, i) => ({
                title: `Season ${i + 1}`,
                episodesLink: `/tv/${id}/season/${i + 1}`,
            }));
        }

        return {
            title: details.title || details.name || 'Unknown',
            synopsis: details.overview || 'No description available',
            image: tmdbApi.getImageUrl(details.poster_path),
            backdrop: tmdbApi.getImageUrl(details.backdrop_path, 'original'),
            rating: details.vote_average,
            year: details.release_date || details.first_air_date
                ? new Date(details.release_date || details.first_air_date).getFullYear().toString()
                : undefined,
            genres: details.genres?.map(g => g.name),
            cast: details.credits?.cast.slice(0, 10).map(c => c.name),
            director: details.credits?.crew.find((c: any) => c.job === 'Director')?.name,
            duration: details.runtime ? `${details.runtime} min` : undefined,
            linkList,
            provider: 'vidsrc',
        };
    } catch (error) {
        console.error('Failed to fetch metadata:', error);
        throw error;
    }
}
