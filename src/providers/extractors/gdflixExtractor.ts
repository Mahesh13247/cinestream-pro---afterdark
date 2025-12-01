/**
 * GDFlix Stream Extractor
 * Handles GDFlix/Google Drive based streams
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Stream } from '../types';
import { commonHeaders } from '../utils/commonHeaders';

export async function gdflixExtractor(
    link: string,
    signal?: AbortSignal
): Promise<Stream[]> {
    try {
        console.log('🔍 GDFlix Extractor:', link);

        const response = await axios.get(link, {
            headers: commonHeaders,
            signal,
        });

        const $ = cheerio.load(response.data);
        const streams: Stream[] = [];

        // Extract Google Drive links
        $('a[href*="drive.google.com"]').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                streams.push({
                    server: 'Google Drive',
                    link: href,
                    type: 'iframe',
                    quality: '1080p',
                });
            }
        });

        // Extract direct download links
        $('.download-btn, .btn-download').each((_, element) => {
            const href = $(element).attr('href');
            if (href && (href.includes('.mkv') || href.includes('.mp4'))) {
                streams.push({
                    server: 'Direct',
                    link: href,
                    type: 'direct',
                    quality: '1080p',
                });
            }
        });

        return streams;
    } catch (error) {
        console.error('❌ GDFlix extractor error:', error);
        return [];
    }
}
