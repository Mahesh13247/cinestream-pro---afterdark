import { GetStreamParams, Stream } from '../types';

/**
 * MovieBox Stream Provider
 */

export async function getStream(params: GetStreamParams): Promise<Stream[]> {
    const { link, type } = params;

    const tmdbId = link.match(/\/(?:movie|tv)\/(\d+)/)?.[1] || link;

    const streams: Stream[] = [];

    streams.push(
        {
            server: 'MovieBox HD',
            link: `https://moviebox.pro/embed/${type}?id=${tmdbId}`,
            type: 'iframe',
            quality: 'HD',
        },
        {
            server: 'MovieBox 4K',
            link: `https://moviebox.stream/e/${tmdbId}`,
            type: 'iframe',
            quality: '4K',
        }
    );

    return streams;
}
