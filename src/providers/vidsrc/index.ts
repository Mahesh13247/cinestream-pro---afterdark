import { IProvider, ProviderConfig } from '../types';
import { catalog, genres } from './catalog';
import { getPosts, getSearchPosts } from './posts';
import { getMeta } from './meta';
import { getStream } from './stream';

const config: ProviderConfig = {
    id: 'vidsrc',
    name: 'VidSrc',
    baseUrl: 'https://vidsrc.xyz',
    enabled: true,
    priority: 1,
    type: 'api', // Uses TMDB API for metadata
    catalog,
    genres,
};

export const VidSrcProvider: IProvider = {
    config,
    getPosts,
    getMeta,
    getStream,
    getSearchPosts,
};
