import { Catalog, Genre } from '../types';

export const catalog: Catalog[] = [
    {
        title: 'Trending Now',
        filter: '/trending',
        type: 'both',
    },
    {
        title: 'Popular Movies',
        filter: '/popular/movie',
        type: 'movie',
    },
    {
        title: 'Popular TV Shows',
        filter: '/popular/tv',
        type: 'tv',
    },
    {
        title: 'Latest Releases',
        filter: '/latest',
        type: 'both',
    },
];

export const genres: Genre[] = [
    { id: '28', title: 'Action', filter: '/genre/28' },
    { id: '35', title: 'Comedy', filter: '/genre/35' },
    { id: '18', title: 'Drama', filter: '/genre/18' },
    { id: '27', title: 'Horror', filter: '/genre/27' },
    { id: '10749', title: 'Romance', filter: '/genre/10749' },
    { id: '878', title: 'Sci-Fi', filter: '/genre/878' },
    { id: '53', title: 'Thriller', filter: '/genre/53' },
];
