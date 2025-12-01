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

// NEW PROVIDERS - Added from 2024 Internet Research

// StreamAPI (Priority 21)
providers.push({
    config: {
        id: 'streamapi',
        name: 'StreamAPI',
        baseUrl: 'https://streamapi.in',
        enabled: true,
        priority: 21,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('StreamAPI', PROVIDER_CONFIGS.streamapi),
    getSearchPosts,
});

// VidBinge2 (Priority 22)
providers.push({
    config: {
        id: 'vidbinge2',
        name: 'VidBinge Dev',
        baseUrl: 'https://vidbinge.dev',
        enabled: true,
        priority: 22,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('VidBinge Dev', PROVIDER_CONFIGS.vidbinge2),
    getSearchPosts,
});

// Flixhq (Priority 23)
providers.push({
    config: {
        id: 'flixhq',
        name: 'Flixhq',
        baseUrl: 'https://flixhq.to',
        enabled: true,
        priority: 23,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Flixhq', PROVIDER_CONFIGS.flixhq),
    getSearchPosts,
});

// Rive (Priority 24)
providers.push({
    config: {
        id: 'rive',
        name: 'Rive',
        baseUrl: 'https://rive.watch',
        enabled: true,
        priority: 24,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Rive', PROVIDER_CONFIGS.rive),
    getSearchPosts,
});

// Showbox (Priority 25)
providers.push({
    config: {
        id: 'showbox',
        name: 'Showbox',
        baseUrl: 'https://www.showbox.media',
        enabled: true,
        priority: 25,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Showbox', PROVIDER_CONFIGS.showbox),
    getSearchPosts,
});

// Gomovies (Priority 26)
providers.push({
    config: {
        id: 'gomovies',
        name: 'Gomovies',
        baseUrl: 'https://gomovies.sx',
        enabled: true,
        priority: 26,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Gomovies', PROVIDER_CONFIGS.gomovies),
    getSearchPosts,
});

// Primewire (Priority 27)
providers.push({
    config: {
        id: 'primewire',
        name: 'Primewire',
        baseUrl: 'https://www.primewire.tf',
        enabled: true,
        priority: 27,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Primewire', PROVIDER_CONFIGS.primewire),
    getSearchPosts,
});

// Moviesjoy (Priority 28)
providers.push({
    config: {
        id: 'moviesjoy',
        name: 'Moviesjoy',
        baseUrl: 'https://moviesjoy.to',
        enabled: true,
        priority: 28,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Moviesjoy', PROVIDER_CONFIGS.moviesjoy),
    getSearchPosts,
});

// Fmovies (Priority 29)
providers.push({
    config: {
        id: 'fmovies',
        name: 'Fmovies',
        baseUrl: 'https://fmovies.to',
        enabled: true,
        priority: 29,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Fmovies', PROVIDER_CONFIGS.fmovies),
    getSearchPosts,
});

// Putlocker (Priority 30)
providers.push({
    config: {
        id: 'putlocker',
        name: 'Putlocker',
        baseUrl: 'https://ww7.putlocker.vip',
        enabled: true,
        priority: 30,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Putlocker', PROVIDER_CONFIGS.putlocker),
    getSearchPosts,
});

// Solarmovie (Priority 31)
providers.push({
    config: {
        id: 'solarmovie',
        name: 'Solarmovie',
        baseUrl: 'https://solarmovie.to',
        enabled: true,
        priority: 31,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Solarmovie', PROVIDER_CONFIGS.solarmovie),
    getSearchPosts,
});

// Yesmovies (Priority 32)
providers.push({
    config: {
        id: 'yesmovies',
        name: 'Yesmovies',
        baseUrl: 'https://yesmovies.ag',
        enabled: true,
        priority: 32,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Yesmovies', PROVIDER_CONFIGS.yesmovies),
    getSearchPosts,
});

// Lookmovie (Priority 33)
providers.push({
    config: {
        id: 'lookmovie',
        name: 'Lookmovie',
        baseUrl: 'https://lookmovie.ag',
        enabled: true,
        priority: 33,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Lookmovie', PROVIDER_CONFIGS.lookmovie),
    getSearchPosts,
});

// Soap2day (Priority 34)
providers.push({
    config: {
        id: 'soap2day',
        name: 'Soap2day',
        baseUrl: 'https://soap2day.tf',
        enabled: true,
        priority: 34,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Soap2day', PROVIDER_CONFIGS.soap2day),
    getSearchPosts,
});

// Hdtoday (Priority 35)
providers.push({
    config: {
        id: 'hdtoday',
        name: 'Hdtoday',
        baseUrl: 'https://hdtoday.cc',
        enabled: true,
        priority: 35,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Hdtoday', PROVIDER_CONFIGS.hdtoday),
    getSearchPosts,
});

// ADDITIONAL PROVIDERS - 2024/2025 Research

// VidPlay (Priority 36)
providers.push({
    config: {
        id: 'vidplay',
        name: 'VidPlay',
        baseUrl: 'https://vidplay.online',
        enabled: true,
        priority: 36,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('VidPlay', PROVIDER_CONFIGS.vidplay),
    getSearchPosts,
});

// EmbedPlay (Priority 37)
providers.push({
    config: {
        id: 'embedplay',
        name: 'EmbedPlay',
        baseUrl: 'https://embedplay.net',
        enabled: true,
        priority: 37,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('EmbedPlay', PROVIDER_CONFIGS.embedplay),
    getSearchPosts,
});

// Vidcloud (Priority 38)
providers.push({
    config: {
        id: 'vidcloud',
        name: 'Vidcloud',
        baseUrl: 'https://vidcloud.icu',
        enabled: true,
        priority: 38,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Vidcloud', PROVIDER_CONFIGS.vidcloud),
    getSearchPosts,
});

// Doodstream (Priority 39)
providers.push({
    config: {
        id: 'doodstream',
        name: 'Doodstream',
        baseUrl: 'https://dood.to',
        enabled: true,
        priority: 39,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Doodstream', PROVIDER_CONFIGS.doodstream),
    getSearchPosts,
});

// Upstream (Priority 40)
providers.push({
    config: {
        id: 'upstream',
        name: 'Upstream',
        baseUrl: 'https://upstream.to',
        enabled: true,
        priority: 40,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Upstream', PROVIDER_CONFIGS.upstream),
    getSearchPosts,
});

// Mixdrop (Priority 41)
providers.push({
    config: {
        id: 'mixdrop',
        name: 'Mixdrop',
        baseUrl: 'https://mixdrop.co',
        enabled: true,
        priority: 41,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Mixdrop', PROVIDER_CONFIGS.mixdrop),
    getSearchPosts,
});

// Filemoon (Priority 42)
providers.push({
    config: {
        id: 'filemoon',
        name: 'Filemoon',
        baseUrl: 'https://filemoon.sx',
        enabled: true,
        priority: 42,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Filemoon', PROVIDER_CONFIGS.filemoon),
    getSearchPosts,
});

// Streamwish (Priority 43)
providers.push({
    config: {
        id: 'streamwish',
        name: 'Streamwish',
        baseUrl: 'https://streamwish.to',
        enabled: true,
        priority: 43,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Streamwish', PROVIDER_CONFIGS.streamwish),
    getSearchPosts,
});

// Voe (Priority 44)
providers.push({
    config: {
        id: 'voe',
        name: 'Voe',
        baseUrl: 'https://voe.sx',
        enabled: true,
        priority: 44,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Voe', PROVIDER_CONFIGS.voe),
    getSearchPosts,
});

// Streamhub (Priority 45)
providers.push({
    config: {
        id: 'streamhub',
        name: 'Streamhub',
        baseUrl: 'https://streamhub.to',
        enabled: true,
        priority: 45,
        type: 'api',
        catalog,
        genres,
    },
    getPosts,
    getMeta,
    getStream: createStreamProvider('Streamhub', PROVIDER_CONFIGS.streamhub),
    getSearchPosts,
});

// VegaMovies (Priority 46) - Scraper with direct downloads
providers.push(VegaProvider);

export const AllProviders = providers;
