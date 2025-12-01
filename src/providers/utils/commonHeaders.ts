/**
 * Common HTTP headers for provider requests
 * These headers help bypass basic bot detection and ensure compatibility
 */

export const commonHeaders: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0',
};

/**
 * Get headers for a specific request type
 */
export function getHeaders(type: 'html' | 'json' | 'api' = 'html'): Record<string, string> {
    const headers = { ...commonHeaders };

    switch (type) {
        case 'json':
            headers['Accept'] = 'application/json, text/plain, */*';
            headers['Content-Type'] = 'application/json';
            break;
        case 'api':
            headers['Accept'] = 'application/json';
            headers['X-Requested-With'] = 'XMLHttpRequest';
            break;
        default:
            // HTML headers (already set in commonHeaders)
            break;
    }

    return headers;
}

/**
 * Get headers with custom referer
 */
export function getHeadersWithReferer(referer: string): Record<string, string> {
    return {
        ...commonHeaders,
        'Referer': referer,
    };
}
