/**
 * All Providers Registry
 * Centralized registration of all 45+ streaming providers
 */

import { IProvider } from './types';
import { getBaseUrl } from './utils/getBaseUrl';
import { extractors } from './extractors';
import { commonHeaders } from './utils/commonHeaders';

// Existing providers
import { AllProviders as UniversalProviders } from './universal/allProviders';

// Real Working Embed Providers (34 providers)
import { AllEmbedProviders } from './embeds/realEmbedProviders.js';

// Import new providers as they're created
// ... more imports will be added

/**
 * Provider factory - creates a basic provider configuration
 */
function createProvider(
    id: string,
    name: string,
    priority: number,
    type: 'movie' | 'tv' | 'anime' | 'drama' | 'embed' = 'movie'
): Partial<IProvider> {
    return {
        config: {
            id,
            name,
            baseUrl: '', // Will be fetched dynamically
            enabled: true,
            priority,
            type: 'scraper',
            catalog: [
                { title: 'Latest', filter: 'latest', type: 'both' },
                { title: 'Popular', filter: 'popular', type: 'both' },
            ],
        },
    };
}

/**
 * Movie Providers (28)
 */
export const MovieProviders: string[] = [
    'Moviesmod',
    'UhdMovies',
    'Vega',
    'lux',
    'drive',
    'multi',
    'w4u',
    'extra',
    'hdhub',
    'kat',
    'dooflix',
    'filmyfly',
    '4khdhub',
    'moviezwap',
    '9xflix',
    'movieBox',
    'cinevood',
    'kmmovies',
    'zeefliz',
    'katmoviefix',
    'movies4u',
    'joya9tv',
    'skymovieshd',
    '1cinevood',
    'protonMovies',
    'ridomovies',
    'moviesapi',
    'filepress',
];



/**
 * Drama Providers (4)
 */
export const DramaProviders: string[] = [
    'dc', // Dramacool
    'aed', // AutoEmbed Drama
    'kissKh',
    'dramafull',
];

/**
 * Embed Providers (9)
 */
export const EmbedProviders: string[] = [
    'autoEmbed',
    'embedsu',
    'nfMirror',
    'primewire',
    'rive',
    'vadapav',
    'cinemaLuxe',
    'consumet',
    'showbox',
];

/**
 * All provider IDs for easy reference
 */
export const AllProviderIds = [
    ...MovieProviders,
    ...DramaProviders,
    ...EmbedProviders,
];

/**
 * Provider metadata
 */
export const ProviderMetadata: Record<string, { name: string; category: string; priority: number }> = {
    // Movies
    'Moviesmod': { name: 'Moviesmod', category: 'movie', priority: 5 },
    'UhdMovies': { name: 'UHD Movies', category: 'movie', priority: 6 },
    'Vega': { name: 'Vega Movies', category: 'movie', priority: 7 },
    'lux': { name: 'Lux Movies', category: 'movie', priority: 8 },
    'drive': { name: 'Movies Drive', category: 'movie', priority: 9 },
    'multi': { name: 'Multi Movies', category: 'movie', priority: 10 },
    'w4u': { name: 'World4uFree', category: 'movie', priority: 11 },
    'extra': { name: 'Extra Movies', category: 'movie', priority: 12 },
    'hdhub': { name: 'HDHub4u', category: 'movie', priority: 13 },
    'kat': { name: 'KatMovieHD', category: 'movie', priority: 14 },
    'dooflix': { name: 'Dooflix', category: 'movie', priority: 15 },
    'filmyfly': { name: 'FilmyFly', category: 'movie', priority: 16 },
    '4khdhub': { name: '4K HD Hub', category: 'movie', priority: 17 },
    'moviezwap': { name: 'Moviezwap', category: 'movie', priority: 18 },
    '9xflix': { name: '9xFlix', category: 'movie', priority: 19 },
    'movieBox': { name: 'MovieBox', category: 'movie', priority: 20 },
    'cinevood': { name: 'Cinevood', category: 'movie', priority: 21 },
    'kmmovies': { name: 'KM Movies', category: 'movie', priority: 22 },
    'zeefliz': { name: 'ZeeFliz', category: 'movie', priority: 23 },
    'katmoviefix': { name: 'KatMovieFix', category: 'movie', priority: 24 },
    'movies4u': { name: 'Movies4u', category: 'movie', priority: 25 },
    'joya9tv': { name: 'Joya9TV', category: 'movie', priority: 26 },
    'skymovieshd': { name: 'Sky Movies HD', category: 'movie', priority: 27 },
    '1cinevood': { name: 'Cinewood', category: 'movie', priority: 28 },
    'protonMovies': { name: 'Proton Movies', category: 'movie', priority: 29 },
    'ridomovies': { name: 'Rido Movies', category: 'movie', priority: 30 },
    'moviesapi': { name: 'Movies API', category: 'movie', priority: 31 },
    'filepress': { name: 'FilePress', category: 'movie', priority: 32 },

    // Drama
    'dc': { name: 'Dramacool', category: 'drama', priority: 37 },
    'aed': { name: 'AutoEmbed Drama', category: 'drama', priority: 38 },
    'kissKh': { name: 'KissKH', category: 'drama', priority: 39 },
    'dramafull': { name: 'Dramafull', category: 'drama', priority: 40 },

    // Embed
    'autoEmbed': { name: 'AutoEmbed', category: 'embed', priority: 41 },
    'embedsu': { name: 'EmbedSu', category: 'embed', priority: 42 },
    'nfMirror': { name: 'NFMirror', category: 'embed', priority: 43 },
    'primewire': { name: 'Primewire', category: 'embed', priority: 44 },
    'rive': { name: 'Rive', category: 'embed', priority: 45 },
    'vadapav': { name: 'Vadapav', category: 'embed', priority: 46 },
    'cinemaLuxe': { name: 'Cinema Luxe', category: 'embed', priority: 47 },
    'consumet': { name: 'Consumet', category: 'embed', priority: 48 },
    'showbox': { name: 'ShowBox', category: 'embed', priority: 49 },
};

/**
 * Get provider context with all utilities
 */
export async function getProviderContext(providerId: string) {
    const baseUrl = await getBaseUrl(providerId);
    return {
        baseUrl,
        headers: commonHeaders,
        extractors,
    };
}

/**
 * Combined list of all NEW providers only
 * Real working embed providers
 */
export const AllNewProviders: IProvider[] = [
    ...AllEmbedProviders, // 34 real embed providers
];

console.log(`📦 Provider Registry: ${AllProviderIds.length} providers configured`);
console.log(`✅ ${AllNewProviders.length} NEW providers ready (${AllEmbedProviders.length} embed)`);
