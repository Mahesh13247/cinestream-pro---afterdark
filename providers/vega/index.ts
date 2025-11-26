import { IProvider, Info, GetMetaParams } from '../types';
import { getPosts, getSearchPosts } from './posts';
import { getStream } from './stream';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const VegaProvider: IProvider = {
    config: {
        id: 'vega',
        name: 'VegaMovies',
        baseUrl: 'https://vegamovies.dad', // Current working mirror as of Nov 2024
        enabled: true,
        priority: 25, // Lower priority than APIs
        type: 'scraper',
        catalog: [
            { title: 'Latest', filter: '', type: 'both' },
            { title: 'Movies', filter: 'category/movies', type: 'movie' },
            { title: 'Web Series', filter: 'category/web-series', type: 'tv' },
            { title: 'Bollywood', filter: 'category/bollywood-movies', type: 'movie' },
            { title: 'Hollywood', filter: 'category/hollywood-movies', type: 'movie' },
            { title: 'South Indian', filter: 'category/south-indian-movies', type: 'movie' },
            { title: 'Dual Audio', filter: 'category/dual-audio-movies', type: 'movie' },
            { title: '4K Movies', filter: 'category/4k-movies', type: 'movie' }
        ],
        genres: []
    },
    getPosts,
    getSearchPosts,
    getStream,
    getMeta: async ({ link, providerContext }: GetMetaParams): Promise<Info> => {
        try {
            const response = await axios.get(link, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            const $ = cheerio.load(response.data);

            const title = $('h1.entry-title').text().trim() || 'Unknown Title';
            const synopsis = $('div.entry-content p').first().text().trim() || '';
            const image = $('div.entry-content img').first().attr('src') || '';

            // Extract Cast
            const cast: string[] = [];
            $('strong:contains("Cast:")').parent().text().replace('Cast:', '').split(',').forEach(c => cast.push(c.trim()));

            return {
                title,
                synopsis,
                image,
                provider: 'vega',
                cast,
                linkList: [] // Episodes would go here
            };
        } catch (error) {
            console.error('Vega getMeta error:', error);
            return {
                title: 'Error',
                synopsis: 'Failed to load metadata',
                image: '',
                provider: 'vega'
            };
        }
    }
};
