// Provider System Types

export interface ProviderConfig {
    id: string;
    name: string;
    baseUrl: string;
    enabled: boolean;
    priority: number; // Lower number = higher priority
    type: 'scraper' | 'api';
    catalog: Catalog[];
    genres?: Genre[];
}

export interface Catalog {
    title: string;
    filter: string;
    type: 'movie' | 'tv' | 'both';
}

export interface Genre {
    id: string;
    title: string;
    filter: string;
}

export interface Post {
    id: string;
    title: string;
    image: string;
    link: string;
    type: 'movie' | 'tv';
    year?: string;
    rating?: number;
    provider: string;
}

export interface Info {
    title: string;
    synopsis: string;
    image: string;
    backdrop?: string;
    rating?: number;
    year?: string;
    genres?: string[];
    cast?: string[];
    director?: string;
    duration?: string;
    linkList?: SeasonLink[];
    provider: string;
}

export interface SeasonLink {
    title: string;
    episodesLink: string;
}

export interface EpisodeLink {
    id: string;
    title: string;
    link: string;
    episode: number;
    season?: number;
    image?: string;
}

export interface Stream {
    server: string;
    link: string;
    quality?: string;
    type: 'iframe' | 'direct' | 'm3u8';
    headers?: Record<string, string>;
    subtitles?: Subtitle[];
}

export interface Subtitle {
    language: string;
    url: string;
    label: string;
}

// Stream extractor types
export type StreamExtractor = (link: string, signal?: AbortSignal) => Promise<Stream[]>;
export type GoFileExtractor = (id: string, signal?: AbortSignal) => Promise<Stream[]>;
export type SuperVideoExtractor = (data: any, signal?: AbortSignal) => Promise<string>;

export interface Extractors {
    hubcloudExtractor: StreamExtractor;
    pixeldrainExtractor: StreamExtractor;
    gofileExtractor: GoFileExtractor;
    gdflixExtractor: StreamExtractor;
    superVideoExtractor: SuperVideoExtractor;
}

export interface ProviderContext {
    baseUrl: string;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
    extractors?: Extractors;
}

export interface GetPostsParams {
    filter: string;
    page: number;
    signal?: AbortSignal;
    providerContext: ProviderContext;
}

export interface GetSearchPostsParams {
    searchQuery: string;
    page: number;
    signal?: AbortSignal;
    providerContext: ProviderContext;
}

export interface GetMetaParams {
    link: string;
    signal?: AbortSignal;
    providerContext: ProviderContext;
}

export interface GetStreamParams {
    link: string;
    type: 'movie' | 'tv';
    signal?: AbortSignal;
    providerContext: ProviderContext;
}

export interface GetEpisodesParams {
    url: string;
    signal?: AbortSignal;
    providerContext: ProviderContext;
}

// Provider Interface
export interface IProvider {
    config: ProviderConfig;

    // Required methods
    getPosts(params: GetPostsParams): Promise<Post[]>;
    getMeta(params: GetMetaParams): Promise<Info>;
    getStream(params: GetStreamParams): Promise<Stream[]>;

    // Optional methods
    getSearchPosts?(params: GetSearchPostsParams): Promise<Post[]>;
    getEpisodes?(params: GetEpisodesParams): Promise<EpisodeLink[]>;
}

// Scraper utility types
export interface ScraperOptions {
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
    cache?: boolean;
    cacheTTL?: number;
    signal?: AbortSignal;
}

export interface ScraperResponse<T = any> {
    data: T;
    cached: boolean;
    timestamp: number;
}
