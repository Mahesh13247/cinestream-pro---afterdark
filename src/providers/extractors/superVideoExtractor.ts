/**
 * SuperVideo Stream Extractor
 * Handles SuperVideo embedded players
 */

import axios from 'axios';
import { Stream } from '../types';
import { commonHeaders } from '../utils/commonHeaders';

export async function superVideoExtractor(
    data: any,
    signal?: AbortSignal
): Promise<string> {
    try {
        console.log('🔍 SuperVideo Extractor');

        // Extract video URL from SuperVideo data
        if (data.file) {
            return data.file;
        }

        if (data.sources && data.sources.length > 0) {
            return data.sources[0].file || data.sources[0].url;
        }

        return '';
    } catch (error) {
        console.error('❌ SuperVideo extractor error:', error);
        return '';
    }
}
