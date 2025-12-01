import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import axiosRetry from 'axios-retry';
import { ScraperOptions, ScraperResponse } from '../providers/types';

// Simple in-memory cache
class Cache {
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private defaultTTL = 5 * 60 * 1000; // 5 minutes

    set(key: string, data: any, ttl?: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now() + (ttl || this.defaultTTL),
        });
    }

    get(key: string): any | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.timestamp) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    clear(): void {
        this.cache.clear();
    }
}

const cache = new Cache();

export class Scraper {
    private client: AxiosInstance;
    private defaultHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    };

    constructor(baseURL?: string, options?: ScraperOptions) {
        this.client = axios.create({
            baseURL,
            timeout: options?.timeout || 30000,
            headers: { ...this.defaultHeaders, ...options?.headers },
        });

        // Configure retry logic
        axiosRetry(this.client, {
            retries: options?.retries || 3,
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error) => {
                return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
                    error.response?.status === 429 ||
                    error.response?.status === 503;
            },
        });
    }

    /**
     * Fetch HTML and parse with Cheerio
     */
    async fetchHTML(url: string, options?: ScraperOptions): Promise<ScraperResponse<any>> {
        const cacheKey = `html:${url}`;

        // Check cache
        if (options?.cache !== false) {
            const cached = cache.get(cacheKey);
            if (cached) {
                return {
                    data: cheerio.load(cached),
                    cached: true,
                    timestamp: Date.now(),
                };
            }
        }

        try {
            const config: AxiosRequestConfig = {
                headers: options?.headers,
                signal: options?.signal as any,
            };

            const response = await this.client.get(url, config);
            const html = response.data;

            // Cache the HTML
            if (options?.cache !== false) {
                cache.set(cacheKey, html, options?.cacheTTL);
            }

            return {
                data: cheerio.load(html),
                cached: false,
                timestamp: Date.now(),
            };
        } catch (error: any) {
            console.error(`Failed to fetch HTML from ${url}:`, error.message);
            throw new Error(`Scraping failed: ${error.message}`);
        }
    }

    /**
     * Fetch JSON data
     */
    async fetchJSON<T = any>(url: string, options?: ScraperOptions): Promise<ScraperResponse<T>> {
        const cacheKey = `json:${url}`;

        // Check cache
        if (options?.cache !== false) {
            const cached = cache.get(cacheKey);
            if (cached) {
                return {
                    data: cached,
                    cached: true,
                    timestamp: Date.now(),
                };
            }
        }

        try {
            const config: AxiosRequestConfig = {
                headers: { ...options?.headers, 'Accept': 'application/json' },
                signal: options?.signal as any,
            };

            const response = await this.client.get<T>(url, config);
            const data = response.data;

            // Cache the data
            if (options?.cache !== false) {
                cache.set(cacheKey, data, options?.cacheTTL);
            }

            return {
                data,
                cached: false,
                timestamp: Date.now(),
            };
        } catch (error: any) {
            console.error(`Failed to fetch JSON from ${url}:`, error.message);
            throw new Error(`API request failed: ${error.message}`);
        }
    }

    /**
     * POST request with data
     */
    async post<T = any>(url: string, data: any, options?: ScraperOptions): Promise<T> {
        try {
            const config: AxiosRequestConfig = {
                headers: options?.headers,
                signal: options?.signal as any,
            };

            const response = await this.client.post<T>(url, data, config);
            return response.data;
        } catch (error: any) {
            console.error(`Failed to POST to ${url}:`, error.message);
            throw new Error(`POST request failed: ${error.message}`);
        }
    }

    /**
     * Extract text content from element
     */
    static extractText($: any, selector: string): string {
        return $(selector).text().trim();
    }

    /**
     * Extract attribute from element
     */
    static extractAttr($: any, selector: string, attr: string): string | undefined {
        return $(selector).attr(attr);
    }

    /**
     * Extract all matching elements
     */
    static extractAll($: any, selector: string): any {
        return $(selector);
    }

    /**
     * Clean URL (resolve relative URLs)
     */
    static cleanUrl(url: string, baseUrl: string): string {
        if (url.startsWith('http')) return url;
        if (url.startsWith('//')) return `https:${url}`;
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        return `${baseUrl}/${url}`;
    }

    /**
     * Extract number from string
     */
    static extractNumber(text: string): number {
        const match = text.match(/\d+(\.\d+)?/);
        return match ? parseFloat(match[0]) : 0;
    }

    /**
     * Clear cache
     */
    static clearCache(): void {
        cache.clear();
    }
}

// Export singleton instance
export const scraper = new Scraper();

// Export helper functions
export const {
    extractText,
    extractAttr,
    extractAll,
    cleanUrl,
    extractNumber,
    clearCache,
} = Scraper;
