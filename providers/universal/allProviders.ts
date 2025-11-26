import { IProvider, ProviderConfig } from '../types';
import { catalog, genres } from '../showbox/catalog';
import { getPosts, getSearchPosts } from '../vidsrc/posts';
import { getMeta } from '../vidsrc/meta';
import { createStreamProvider, PROVIDER_CONFIGS } from './streamGenerator';
import { VegaProvider } from '../vega';

// Generate all providers dynamically with REAL VERIFIED working sources
const providers: IProvider[] = [];

// VidSrc Family (Priority 1) - 12 mirrors!
providers.push({
    config: {
        id: 'vidsrc',
        name: 'VidSrc',
        baseUrl: 'https://vidsrc.xyz',
        enabled: true,
        priority: 1,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('VidSrc', PROVIDER_CONFIGS.vidsrc),
    getSearchPosts,
});

// Embed-API.stream (Priority 2) - Aggregates 10+ sources
providers.push({
    config: {
        id: 'embedapi',
        name: 'Embed-API',
        baseUrl: 'https://player.embed-api.stream',
        enabled: true,
        priority: 2,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Embed-API', PROVIDER_CONFIGS.embedapi),
    getSearchPosts,
});

// SuperEmbed (Priority 3)
providers.push({
    config: {
        id: 'superembed',
        name: 'SuperEmbed',
        baseUrl: 'https://multiembed.mov',
        enabled: true,
        priority: 3,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('SuperEmbed', PROVIDER_CONFIGS.superembed),
    getSearchPosts,
});

// 2Embed (Priority 4)
providers.push({
    config: {
        id: '2embed',
        name: '2Embed',
        baseUrl: 'https://www.2embed.cc',
        enabled: true,
        priority: 4,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('2Embed', PROVIDER_CONFIGS['2embed']),
    getSearchPosts,
});

// GoDrivePlayer (Priority 5) - VidSrc alternative
providers.push({
    config: {
        id: 'godriveplayer',
        name: 'GoDrivePlayer',
        baseUrl: 'https://godriveplayer.com',
        enabled: true,
        priority: 5,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('GoDrivePlayer', PROVIDER_CONFIGS.godriveplayer),
    getSearchPosts,
});

// Embed.su (Priority 6)
providers.push({
    config: {
        id: 'embedsu',
        name: 'Embed.su',
        baseUrl: 'https://embed.su',
        enabled: true,
        priority: 6,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Embed.su', PROVIDER_CONFIGS.embedsu),
    getSearchPosts,
});

// NontonGo (Priority 7)
providers.push({
    config: {
        id: 'nontongo',
        name: 'NontonGo',
        baseUrl: 'https://www.nontongo.win',
        enabled: true,
        priority: 7,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('NontonGo', PROVIDER_CONFIGS.nontongo),
    getSearchPosts,
});

// Autoembed (Priority 8)
providers.push({
    config: {
        id: 'autoembed',
        name: 'Autoembed',
        baseUrl: 'https://autoembed.co',
        enabled: true,
        priority: 8,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Autoembed', PROVIDER_CONFIGS.autoembed),
    getSearchPosts,
});

// VidLink (Priority 9)
providers.push({
    config: {
        id: 'vidlink',
        name: 'VidLink',
        baseUrl: 'https://vidlink.pro',
        enabled: true,
        priority: 9,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('VidLink', PROVIDER_CONFIGS.vidlink),
    getSearchPosts,
});

// Smashystream (Priority 10)
providers.push({
    config: {
        id: 'smashystream',
        name: 'Smashystream',
        baseUrl: 'https://player.smashy.stream',
        enabled: true,
        priority: 10,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Smashystream', PROVIDER_CONFIGS.smashystream),
    getSearchPosts,
});

// Moviesapi (Priority 11)
providers.push({
    config: {
        id: 'moviesapi',
        name: 'MoviesAPI',
        baseUrl: 'https://moviesapi.club',
        enabled: true,
        priority: 11,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('MoviesAPI', PROVIDER_CONFIGS.moviesapi),
    getSearchPosts,
});

// Embedsoap (Priority 12)
providers.push({
    config: {
        id: 'embedsoap',
        name: 'Embedsoap',
        baseUrl: 'https://www.embedsoap.com',
        enabled: true,
        priority: 12,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Embedsoap', PROVIDER_CONFIGS.embedsoap),
    getSearchPosts,
});

// Embedflix (Priority 13)
providers.push({
    config: {
        id: 'embedflix',
        name: 'Embedflix',
        baseUrl: 'https://embedflix.net',
        enabled: true,
        priority: 13,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Embedflix', PROVIDER_CONFIGS.embedflix),
    getSearchPosts,
});

// Frembed (Priority 14)
providers.push({
    config: {
        id: 'frembed',
        name: 'Frembed',
        baseUrl: 'https://frembed.com',
        enabled: true,
        priority: 14,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Frembed', PROVIDER_CONFIGS.frembed),
    getSearchPosts,
});

// Embedplayer (Priority 15)
providers.push({
    config: {
        id: 'embedplayer',
        name: 'Embedplayer',
        baseUrl: 'https://embedplayer.site',
        enabled: true,
        priority: 15,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Embedplayer', PROVIDER_CONFIGS.embedplayer),
    getSearchPosts,
});

// Vidbinge (Priority 16)
providers.push({
    config: {
        id: 'vidbinge',
        name: 'Vidbinge',
        baseUrl: 'https://vidbinge.com',
        enabled: true,
        priority: 16,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Vidbinge', PROVIDER_CONFIGS.vidbinge),
    getSearchPosts,
});

// VidFast (Priority 17)
providers.push({
    config: {
        id: 'vidfast',
        name: 'VidFast',
        baseUrl: 'https://vidfast.to',
        enabled: true,
        priority: 17,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('VidFast', PROVIDER_CONFIGS.vidfast),
    getSearchPosts,
});

// Moviee (Priority 18)
providers.push({
    config: {
        id: 'moviee',
        name: 'Moviee',
        baseUrl: 'https://moviee.tv',
        enabled: true,
        priority: 18,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Moviee', PROVIDER_CONFIGS.moviee),
    getSearchPosts,
});

// WarezCDN (Priority 19)
providers.push({
    config: {
        id: 'warezcdn',
        name: 'WarezCDN',
        baseUrl: 'https://embed.warezcdn.com',
        enabled: true,
        priority: 19,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('WarezCDN', PROVIDER_CONFIGS.warezcdn),
    getSearchPosts,
});

// EmbedV (Priority 20)
providers.push({
    config: {
        id: 'embedv',
        name: 'EmbedV',
        baseUrl: 'https://www.embedv.net',
        enabled: true,
        priority: 20,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('EmbedV', PROVIDER_CONFIGS.embedv),
    getSearchPosts,
});

// VegaMovies (Priority 21) - Scraper with direct downloads
providers.push(VegaProvider);

export const AllProviders = providers;
