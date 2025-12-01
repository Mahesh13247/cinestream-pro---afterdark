/**
 * Pixeldrain Stream Extractor
 * Handles Pixeldrain file hosting service
 */

import { Stream } from '../types';

export async function pixeldrainExtractor(
    link: string,
    signal?: AbortSignal
): Promise<Stream[]> {
    try {
        console.log('🔍 Pixeldrain Extractor:', link);

        // Convert Pixeldrain link to API format
        let apiLink = link;
        if (!link.includes('api')) {
            const token = link.split('/').pop();
            const baseUrl = link.split('/').slice(0, -2).join('/');
            apiLink = `${baseUrl}/api/file/${token}?download`;
        }

        return [{
            server: 'Pixeldrain',
            link: apiLink,
            type: 'direct',
            quality: '1080p',
        }];
    } catch (error) {
        console.error('❌ Pixeldrain extractor error:', error);
        return [];
    }
}
