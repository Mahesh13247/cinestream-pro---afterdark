/**
 * GoFile Stream Extractor
 * Handles GoFile file hosting service
 */

import axios from 'axios';
import { Stream } from '../types';
import { commonHeaders } from '../utils/commonHeaders';

export async function gofileExtractor(
    id: string,
    signal?: AbortSignal
): Promise<Stream[]> {
    try {
        console.log('🔍 GoFile Extractor:', id);

        // Get GoFile token
        const tokenRes = await axios.get('https://api.gofile.io/createAccount', {
            headers: commonHeaders,
            signal,
        });
        const token = tokenRes.data.data.token;

        // Get file info
        const fileRes = await axios.get(`https://api.gofile.io/getContent?contentId=${id}&token=${token}`, {
            headers: commonHeaders,
            signal,
        });

        const fileData = fileRes.data.data;
        const streams: Stream[] = [];

        // Extract download links
        if (fileData.contents) {
            for (const [, file] of Object.entries(fileData.contents) as any) {
                if (file.link) {
                    streams.push({
                        server: 'GoFile',
                        link: file.link,
                        type: 'direct',
                        quality: file.name?.includes('1080') ? '1080p' : '720p',
                    });
                }
            }
        }

        return streams;
    } catch (error) {
        console.error('❌ GoFile extractor error:', error);
        return [];
    }
}
