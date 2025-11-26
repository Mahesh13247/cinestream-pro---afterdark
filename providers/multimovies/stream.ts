import { GetStreamParams, Stream } from '../types';

/**
 * MultiMovies Stream Provider
 * Multiple streaming sources aggregator
 */

export async function getStream(params: GetStreamParams): Promise<Stream[]> {
    const { link, type } = params;

    const tmdbId = link.match(/\/(?:movie|tv)\/(\d+)/)?.[1] || link;

    const streams: Stream[] = [];

    // MultiMovies sources
    streams.push(
        {
            server: 'MultiMovies Server 1',
            link: `https://multimovies.cloud/embed/${type}/${tmdbId}`,
            type: 'iframe',
            quality: 'HD',
        },
        {
            server: 'MultiMovies Server 2',
            link: `https://multimovies.top/embed/${tmdbId}`,
            type: 'iframe',
            quality: 'HD',
        },
        {
            server: 'MultiStream',
            link: `https://multistream.to/e/${tmdbId}`,
            type: 'iframe',
            quality: 'auto',
        }
    );

    return streams;
}
