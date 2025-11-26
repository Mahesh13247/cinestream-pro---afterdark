import { Catalog, Genre } from '../types';

export const catalog: Catalog[] = [
    {
        title: 'Trending Movies',
        filter: '/trending/movie',
        type: 'movie',
    },
    {
        title: 'Popular Movies',
        filter: '/popular/movie',
        type: 'movie',
    },
    {
        title: 'Top Rated Movies',
        filter: '/top-rated/movie',
        type: 'movie',
    },
    {
        title: 'Trending TV Shows',
        filter: '/trending/tv',
        type: 'tv',
    },
    {
        title: 'Popular TV Shows',
        filter: '/popular/tv',
        type: 'tv',
    },
];

export const genres: Genre[] = [
    { id: '28', title: 'Action', filter: '/genre/28' },
    { id: '12', title: 'Adventure', filter: '/genre/12' },
    { id: '16', title: 'Animation', filter: '/genre/16' },
    { id: '35', title: 'Comedy', filter: '/genre/35' },
    { id: '80', title: 'Crime', filter: '/genre/80' },
    { id: '99', title: 'Documentary', filter: '/genre/99' },
    { id: '18', title: 'Drama', filter: '/genre/18' },
    { id: '10751', title: 'Family', filter: '/genre/10751' },
    { id: '14', title: 'Fantasy', filter: '/genre/14' },
    { id: '36', title: 'History', filter: '/genre/36' },
    { id: '27', title: 'Horror', filter: '/genre/27' },
    { id: '10402', title: 'Music', filter: '/genre/10402' },
    { id: '9648', title: 'Mystery', filter: '/genre/9648' },
    { id: '10749', title: 'Romance', filter: '/genre/10749' },
    { id: '878', title: 'Science Fiction', filter: '/genre/878' },
    { id: '10770', title: 'TV Movie', filter: '/genre/10770' },
    { id: '53', title: 'Thriller', filter: '/genre/53' },
    { id: '10752', title: 'War', filter: '/genre/10752' },
    { id: '37', title: 'Western', filter: '/genre/37' },
];
