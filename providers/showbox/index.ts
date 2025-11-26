import { IProvider, ProviderConfig } from '../types';
import { catalog, genres } from './catalog';
import { getPosts, getSearchPosts } from '../vidsrc/posts'; // Reuse TMDB-based posts
import { getMeta } from '../vidsrc/meta'; // Reuse TMDB-based meta
import { getStream } from './stream';

const config: ProviderConfig = {
    id: 'showbox',
    name: 'ShowBox',
    baseUrl: 'https://www.showbox.media',
    enabled: true,
    priority: 2,
    type: 'api',
    catalog,
    genres,
};

export const ShowBoxProvider: IProvider = {
    config,
    getPosts,
    getMeta,
    getStream,
    getSearchPosts,
};
