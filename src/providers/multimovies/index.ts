import { IProvider, ProviderConfig } from '../types';
import { catalog, genres } from '../showbox/catalog'; // Reuse catalog
import { getPosts, getSearchPosts } from '../vidsrc/posts';
import { getMeta } from '../vidsrc/meta';
import { getStream } from './stream';

const config: ProviderConfig = {
    id: 'multimovies',
    name: 'MultiMovies',
    baseUrl: 'https://multimovies.cloud',
    enabled: true,
    priority: 3,
    type: 'api',
    catalog,
    genres,
};

export const MultiMoviesProvider: IProvider = {
    config,
    getPosts,
    getMeta,
    getStream,
    getSearchPosts,
};
