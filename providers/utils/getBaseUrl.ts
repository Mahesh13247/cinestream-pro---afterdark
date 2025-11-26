/**
 * Dynamic Base URL Management
 * Fetches provider URLs from external JSON configuration
 * Implements 1-hour caching for performance
 */

interface ProviderUrlConfig {
    name: string;
    url: string;
}

interface ProviderUrlsCache {
    [key: string]: ProviderUrlConfig;
}

// Cache configuration
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const PROVIDER_CONFIG_URL = '/providers/config/providerUrls.json';

// In-memory cache
let urlCache: ProviderUrlsCache | null = null;
let cacheTimestamp: number = 0;

/**
 * Fetch provider URLs from configuration file
 */
async function fetchProviderUrls(): Promise<ProviderUrlsCache> {
    try {
        const response = await fetch(PROVIDER_CONFIG_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch provider URLs: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching provider URLs:', error);
        // Return empty object as fallback
        return {};
    }
}

/**
 * Check if cache is still valid
 */
function isCacheValid(): boolean {
    return urlCache !== null && (Date.now() - cacheTimestamp) < CACHE_DURATION;
}

/**
 * Get base URL for a specific provider
 * @param providerValue - Provider identifier (e.g., 'Moviesmod', 'Vega')
 * @returns Provider base URL or empty string if not found
 */
export async function getBaseUrl(providerValue: string): Promise<string> {
    try {
        // Check cache first
        if (isCacheValid() && urlCache) {
            const config = urlCache[providerValue];
            if (config) {
                return config.url;
            }
        }

        // Fetch fresh data
        urlCache = await fetchProviderUrls();
        cacheTimestamp = Date.now();

        const config = urlCache[providerValue];
        if (config) {
            return config.url;
        }

        console.warn(`Provider URL not found for: ${providerValue}`);
        return '';
    } catch (error) {
        console.error(`Error getting base URL for ${providerValue}:`, error);
        return '';
    }
}

/**
 * Get all provider configurations
 */
export async function getAllProviderUrls(): Promise<ProviderUrlsCache> {
    if (isCacheValid() && urlCache) {
        return urlCache;
    }

    urlCache = await fetchProviderUrls();
    cacheTimestamp = Date.now();
    return urlCache;
}

/**
 * Clear the URL cache (useful for testing or forcing refresh)
 */
export function clearUrlCache(): void {
    urlCache = null;
    cacheTimestamp = 0;
}

/**
 * Prefetch provider URLs (call on app initialization)
 */
export async function prefetchProviderUrls(): Promise<void> {
    try {
        await getAllProviderUrls();

    } catch (error) {
        console.error('Failed to prefetch provider URLs:', error);
    }
}
