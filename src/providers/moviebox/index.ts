import { IProvider, ProviderConfig } from '../types';
import { catalog, genres } from '../showbox/catalog';
import { getPosts, getSearchPosts } from '../vidsrc/posts';
import { getMeta } from '../vidsrc/meta';
import { getStream } from './stream';

const config: ProviderConfig = {
    id: 'moviebox',
    name: 'MovieBox',
    baseUrl: 'https://moviebox.pro',
    enabled: true,
    priority: 4,
    type: 'api',
    catalog,
    genres,
};

export const MovieBoxProvider: IProvider = {
    config,
    getPosts,
    getMeta,
    getStream,
    getSearchPosts,
};
