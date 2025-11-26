import { Stream } from '../types';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const extractors = {
    hubcloudExtracter: async (link: string, signal?: AbortSignal): Promise<Stream[]> => {
        try {
            const streams: Stream[] = [];

            // Fetch the page
            const response = await axios.get(link, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': link
                },
                signal
            });

            const $ = cheerio.load(response.data);

            // Method 1: Look for direct video sources
            $('source').each((_, element) => {
                const src = $(element).attr('src');
                const type = $(element).attr('type');
                if (src) {
                    streams.push({
                        server: 'HubCloud Direct',
                        link: src.startsWith('http') ? src : `https:${src}`,
                        type: type?.includes('m3u8') ? 'm3u8' : 'direct',
                        quality: '1080'
                    });
                }
            });

            // Method 2: Look for video tags
            $('video').each((_, element) => {
                const src = $(element).attr('src');
                if (src) {
                    streams.push({
                        server: 'HubCloud Video',
                        link: src.startsWith('http') ? src : `https:${src}`,
                        type: 'direct',
                        quality: '1080'
                    });
                }
            });

            // Method 3: Look for iframe embeds
            $('iframe').each((_, element) => {
                const src = $(element).attr('src');
                if (src && (src.includes('cloud') || src.includes('hub'))) {
                    streams.push({
                        server: 'HubCloud Embed',
                        link: src.startsWith('http') ? src : `https:${src}`,
                        type: 'iframe',
                        quality: '720'
                    });
                }
            });

            // Method 4: Search for m3u8 links in scripts
            const scriptContent = response.data;
            const m3u8Regex = /(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/g;
            const m3u8Matches = scriptContent.match(m3u8Regex);

            if (m3u8Matches) {
                m3u8Matches.forEach((m3u8Url: string) => {
                    streams.push({
                        server: 'HubCloud M3U8',
                        link: m3u8Url,
                        type: 'm3u8',
                        quality: '1080'
                    });
                });
            }

            // Method 5: Look for mp4 links
            const mp4Regex = /(https?:\/\/[^\s"']+\.mp4[^\s"']*)/g;
            const mp4Matches = scriptContent.match(mp4Regex);

            if (mp4Matches) {
                mp4Matches.forEach((mp4Url: string) => {
                    streams.push({
                        server: 'HubCloud MP4',
                        link: mp4Url,
                        type: 'direct',
                        quality: '720'
                    });
                });
            }

            // Remove duplicates
            const uniqueStreams = streams.filter((stream, index, self) =>
                index === self.findIndex((s) => s.link === stream.link)
            );

            console.log(`HubCloud extractor found ${uniqueStreams.length} streams from ${link}`);
            return uniqueStreams;

        } catch (error: any) {
            if (error.message?.includes('aborted')) {
                console.log('HubCloud extraction aborted');
                return [];
            }
            console.error('HubCloud extractor error:', error.message);
            return [];
        }
    },
    gofileExtracter: async (id: string): Promise<{ link: string; token: string }> => {
        console.warn('GoFile extractor not implemented');
        return { link: '', token: '' };
    },
    superVideoExtractor: async (data: any): Promise<string> => {
        console.warn('SuperVideo extractor not implemented');
        return '';
    },
    gdFlixExtracter: async (link: string, signal?: AbortSignal): Promise<Stream[]> => {
        console.warn('GDFlix extractor not implemented');
        return [];
    }
};
