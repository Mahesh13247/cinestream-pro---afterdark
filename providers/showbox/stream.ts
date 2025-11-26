import { GetStreamParams, Stream } from '../types';

/**
 * ShowBox Stream Provider
 * Provides alternative streaming sources
 */

export async function getStream(params: GetStreamParams): Promise<Stream[]> {
    const { link, type } = params;

    // Extract TMDB ID from link
    const tmdbId = link.match(/\/(?:movie|tv)\/(\d+)/)?.[1] || link;

    const streams: Stream[] = [];

    // ShowBox embed sources
    streams.push(
        {
            server: 'ShowBox Primary',
            link: `https://www.showbox.media/embed/${type}/${tmdbId}`,
            type: 'iframe',
            quality: 'auto',
        },
        {
            server: 'ShowBox Alt',
            link: `https://showbox.to/embed/${type}?id=${tmdbId}`,
            type: 'iframe',
            quality: 'auto',
        }
    );

    return streams;
}
