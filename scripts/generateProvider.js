/**
 * Provider Generator Script
 * Automatically generates provider files based on template
 * Run: node scripts/generateProvider.js <providerId> <providerName> <priority>
 */

const fs = require('fs');
const path = require('path');

// Provider template configurations
const providerTemplates = {
    movie: {
        catalog: [
            { title: 'Latest Movies', filter: 'latest-movies', type: 'movie' },
            { title: 'Latest Series', filter: 'latest-series', type: 'tv' },
            { title: 'Trending', filter: 'trending', type: 'both' },
            { title: 'Popular', filter: 'popular', type: 'both' },
        ],
        genres: [
            { id: 'action', title: 'Action', filter: 'action' },
            { id: 'comedy', title: 'Comedy', filter: 'comedy' },
            { id: 'drama', title: 'Drama', filter: 'drama' },
            { id: 'horror', title: 'Horror', filter: 'horror' },
            { id: 'thriller', title: 'Thriller', filter: 'thriller' },
        ],
    },
    anime: {
        catalog: [
            { title: 'Latest Anime', filter: 'latest', type: 'tv' },
            { title: 'Popular Anime', filter: 'popular', type: 'tv' },
            { title: 'Ongoing', filter: 'ongoing', type: 'tv' },
        ],
        genres: [
            { id: 'action', title: 'Action', filter: 'action' },
            { id: 'comedy', title: 'Comedy', filter: 'comedy' },
            { id: 'romance', title: 'Romance', filter: 'romance' },
        ],
    },
    drama: {
        catalog: [
            { title: 'Latest Dramas', filter: 'latest', type: 'tv' },
            { title: 'Popular Dramas', filter: 'popular', type: 'tv' },
            { title: 'Completed', filter: 'completed', type: 'tv' },
        ],
        genres: [
            { id: 'romance', title: 'Romance', filter: 'romance' },
            { id: 'comedy', title: 'Comedy', filter: 'comedy' },
            { id: 'thriller', title: 'Thriller', filter: 'thriller' },
        ],
    },
    embed: {
        catalog: [
            { title: 'Movies', filter: 'movies', type: 'movie' },
            { title: 'TV Shows', filter: 'tv', type: 'tv' },
        ],
        genres: [],
    },
};

function generateProvider(providerId, providerName, priority, category = 'movie') {
    const template = providerTemplates[category];
    const dirName = providerId.toLowerCase();
    const basePath = path.join(__dirname, '..', 'providers', `${category}s`, dirName);

    // Create directory
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true });
    }

    // Generate index.ts
    const indexContent = `/**
 * ${providerName} Provider
 * ${category.charAt(0).toUpperCase() + category.slice(1)} streaming provider
 */

import { IProvider, ProviderConfig } from '../../types.js';
import { getPosts } from './posts.js';
import { getMeta } from './meta.js';
import { getStream } from './stream.js';
import { getSearchPosts } from './search.js';

const config: ProviderConfig = {
    id: '${providerId}',
    name: '${providerName}',
    baseUrl: '', // Fetched dynamically from providerUrls.json
    enabled: true,
    priority: ${priority},
    type: 'scraper',
    catalog: ${JSON.stringify(template.catalog, null, 8)},
    genres: ${JSON.stringify(template.genres, null, 8)},
};

export const ${providerName.replace(/\s+/g, '')}Provider: IProvider = {
    config,
    getPosts,
    getMeta,
    getStream,
    getSearchPosts,
};
`;

    // Generate posts.ts
    const postsContent = `/**
 * ${providerName} - Get Posts
 * Fetch ${category} listings
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Post, GetPostsParams } from '../../types.js';
import { getBaseUrl } from '../../utils/getBaseUrl.js';
import { commonHeaders } from '../../utils/commonHeaders.js';

export async function getPosts(params: GetPostsParams): Promise<Post[]> {
    try {
        const { filter, page, signal } = params;
        const baseUrl = await getBaseUrl('${providerId}');

        if (!baseUrl) {
            console.error('${providerName} base URL not found');
            return [];
        }

        let url = \`\${baseUrl}/page/\${page}/\`;
        if (filter && filter !== 'latest') {
            url = \`\${baseUrl}/\${filter}/page/\${page}/\`;
        }

        const response = await axios.get(url, {
            headers: commonHeaders,
            signal,
        });

        const $ = cheerio.load(response.data);
        const posts: Post[] = [];

        $('.post-item, .movie-item, article, .item').each((_, element) => {
            const $el = $(element);
            const title = $el.find('h2, .title, .post-title, h3').text().trim();
            const link = $el.find('a').first().attr('href') || '';
            const image = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || '';
            
            if (title && link) {
                const type = link.includes('/series/') || link.includes('/tv/') || title.toLowerCase().includes('season') ? 'tv' : 'movie';
                const yearMatch = title.match(/\\((\\d{4})\\)/);
                const year = yearMatch ? yearMatch[1] : undefined;

                posts.push({
                    id: link.split('/').filter(Boolean).pop() || '',
                    title: title.replace(/\\(\\d{4}\\)/, '').trim(),
                    image,
                    link,
                    type,
                    year,
                    provider: '${providerId}',
                });
            }
        });

        console.log(\`✅ ${providerName}: Found \${posts.length} posts\`);
        return posts;
    } catch (error) {
        console.error('❌ ${providerName} getPosts error:', error);
        return [];
    }
}
`;

    // Generate meta.ts
    const metaContent = `/**
 * ${providerName} - Get Metadata
 * Fetch detailed information
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Info, GetMetaParams } from '../../types.js';
import { commonHeaders } from '../../utils/commonHeaders.js';

export async function getMeta(params: GetMetaParams): Promise<Info> {
    try {
        const { link, signal } = params;

        const response = await axios.get(link, {
            headers: commonHeaders,
            signal,
        });

        const $ = cheerio.load(response.data);

        const title = $('h1, .entry-title, .post-title, .title').first().text().trim();
        const image = $('.post-thumbnail img, .movie-poster img, .poster img').first().attr('src') || '';
        const synopsis = $('.entry-content p, .movie-description, .synopsis, .description').first().text().trim();
        
        const year = $('.year, .release-date, .date').text().trim() || undefined;
        const rating = parseFloat($('.rating, .imdb-rating, .vote').text().trim()) || undefined;
        const genres = $('.genre, .genres a, .category a').map((_, el) => $(el).text().trim()).get();
        const cast = $('.cast a, .actors a, .star a').map((_, el) => $(el).text().trim()).get();

        const linkList = [];
        $('.download-link, .server-link, .quality-link, .link-item a').each((_, el) => {
            const $link = $(el);
            const linkTitle = $link.text().trim();
            const episodesLink = $link.attr('href') || '';
            
            if (episodesLink) {
                linkList.push({
                    title: linkTitle,
                    episodesLink,
                });
            }
        });

        return {
            title,
            image,
            synopsis,
            year,
            rating,
            genres,
            cast,
            linkList,
            provider: '${providerId}',
        };
    } catch (error) {
        console.error('❌ ${providerName} getMeta error:', error);
        throw error;
    }
}
`;

    // Generate stream.ts
    const streamContent = `/**
 * ${providerName} - Get Streams
 * Extract streaming links
 */

import { Stream, GetStreamParams } from '../../types.js';
import { hubcloudExtractor } from '../../extractors/index.js';

export async function getStream(params: GetStreamParams): Promise<Stream[]> {
    try {
        const { link, signal, providerContext } = params;

        console.log('🎬 ${providerName} getStream:', link);

        if (providerContext?.extractors?.hubcloudExtractor) {
            const streams = await providerContext.extractors.hubcloudExtractor(link, signal);
            if (streams.length > 0) {
                return streams;
            }
        }

        const streams = await hubcloudExtractor(link, signal);
        return streams;
    } catch (error) {
        console.error('❌ ${providerName} getStream error:', error);
        return [];
    }
}
`;

    // Generate search.ts
    const searchContent = `/**
 * ${providerName} - Search
 * Search for content
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Post, GetSearchPostsParams } from '../../types.js';
import { getBaseUrl } from '../../utils/getBaseUrl.js';
import { commonHeaders } from '../../utils/commonHeaders.js';

export async function getSearchPosts(params: GetSearchPostsParams): Promise<Post[]> {
    try {
        const { searchQuery, page, signal } = params;
        const baseUrl = await getBaseUrl('${providerId}');

        if (!baseUrl) {
            console.error('${providerName} base URL not found');
            return [];
        }

        const url = \`\${baseUrl}/?s=\${encodeURIComponent(searchQuery)}&paged=\${page}\`;

        const response = await axios.get(url, {
            headers: commonHeaders,
            signal,
        });

        const $ = cheerio.load(response.data);
        const posts: Post[] = [];

        $('.search-result, .post-item, article, .item').each((_, element) => {
            const $el = $(element);
            const title = $el.find('h2, .title, h3').text().trim();
            const link = $el.find('a').first().attr('href') || '';
            const image = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || '';
            
            if (title && link) {
                const type = link.includes('/series/') || link.includes('/tv/') || title.toLowerCase().includes('season') ? 'tv' : 'movie';
                const yearMatch = title.match(/\\((\\d{4})\\)/);
                const year = yearMatch ? yearMatch[1] : undefined;

                posts.push({
                    id: link.split('/').filter(Boolean).pop() || '',
                    title: title.replace(/\\(\\d{4}\\)/, '').trim(),
                    image,
                    link,
                    type,
                    year,
                    provider: '${providerId}',
                });
            }
        });

        console.log(\`✅ ${providerName} search: Found \${posts.length} results\`);
        return posts;
    } catch (error) {
        console.error('❌ ${providerName} search error:', error);
        return [];
    }
}
`;

    // Write files
    fs.writeFileSync(path.join(basePath, 'index.ts'), indexContent);
    fs.writeFileSync(path.join(basePath, 'posts.ts'), postsContent);
    fs.writeFileSync(path.join(basePath, 'meta.ts'), metaContent);
    fs.writeFileSync(path.join(basePath, 'stream.ts'), streamContent);
    fs.writeFileSync(path.join(basePath, 'search.ts'), searchContent);

    console.log(`✅ Generated ${providerName} provider at ${basePath}`);
    return dirName;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateProvider };
}

// CLI usage
if (require.main === module) {
    const [, , providerId, providerName, priority, category] = process.argv;
    if (!providerId || !providerName || !priority) {
        console.error('Usage: node generateProvider.js <providerId> <providerName> <priority> [category]');
        process.exit(1);
    }
    generateProvider(providerId, providerName, parseInt(priority), category || 'movie');
}
