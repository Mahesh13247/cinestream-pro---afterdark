import { GetStreamParams, Stream } from '../types';
import { Scraper } from '../../utils/scraper';

/**
 * VidSrc Stream Provider
 * Extracts streaming links from VidSrc embed pages
 */

const VIDSRC_SERVERS = [
    { id: 1, name: 'VidSrc', baseUrl: 'https://vidsrc.xyz/embed' },
    { id: 2, name: 'VidSrc Pro', baseUrl: 'https://vidsrc.pro/embed' },
    { id: 3, name: 'VidSrc 2', baseUrl: 'https://vidsrc.me/embed' },
    { id: 4, name: 'VidSrc CC', baseUrl: 'https://vidsrc.cc/v2/embed' },
];

export async function getStream(params: GetStreamParams): Promise<Stream[]> {
    const { link, type, signal } = params;

    // Extract TMDB ID from link (assuming link format: /movie/123 or /tv/123)
    const tmdbId = extractTmdbId(link);
    if (!tmdbId) {
        throw new Error('Invalid link format');
    }

    const streams: Stream[] = [];

    // Generate streams for all VidSrc servers
    for (const server of VIDSRC_SERVERS) {
        try {
            const streamUrl = buildStreamUrl(server.baseUrl, type, tmdbId);

            streams.push({
                server: server.name,
                link: streamUrl,
                type: 'iframe',
                quality: 'auto',
            });
        } catch (error) {
            console.error(`Failed to generate stream for ${server.name}:`, error);
        }
    }

    // Add additional embed sources
    streams.push(
        {
            server: 'SuperEmbed',
            link: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
            type: 'iframe',
            quality: 'auto',
        },
        {
            server: '2Embed',
            link: type === 'movie'
                ? `https://www.2embed.cc/embed/${tmdbId}`
                : `https://www.2embed.cc/embedtv/${tmdbId}`,
            type: 'iframe',
            quality: 'auto',
        }
    );

    return streams;
}

/**
 * Extract TMDB ID from link
 */
function extractTmdbId(link: string): string | null {
    // Handle various link formats
    // /movie/123, /tv/123, movie/123, 123
    const match = link.match(/(?:movie|tv)\/(\d+)|^(\d+)$/);
    return match ? (match[1] || match[2]) : null;
}

/**
 * Build stream URL based on server and type
 */
function buildStreamUrl(baseUrl: string, type: 'movie' | 'tv', tmdbId: string): string {
    if (baseUrl.includes('vidsrc.me')) {
        return `${baseUrl}/${type}?tmdb=${tmdbId}`;
    } else if (baseUrl.includes('vidsrc.cc')) {
        return `${baseUrl}/${type}/${tmdbId}`;
    } else {
        return `${baseUrl}/${type}/${tmdbId}`;
    }
}

/**
 * Advanced: Extract direct stream URLs (requires additional scraping)
 * This is a placeholder for future implementation
 */
export async function extractDirectStream(embedUrl: string, signal?: AbortSignal): Promise<string | null> {
    try {
        const scraper = new Scraper();
        const { data: $ } = await scraper.fetchHTML(embedUrl, { signal });

        // This would require reverse engineering the embed page
        // to extract the actual video URL
        // For now, we return null and use iframe embedding

        return null;
    } catch (error) {
        console.error('Failed to extract direct stream:', error);
        return null;
    }
}
