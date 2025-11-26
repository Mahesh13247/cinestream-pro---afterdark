import {
    IProvider,
    ProviderConfig,
    Post,
    Info,
    Stream,
    GetPostsParams,
    GetSearchPostsParams,
    GetMetaParams,
    GetStreamParams,
    GetEpisodesParams,
    EpisodeLink
} from './types';

class ProviderManager {
    private providers: Map<string, IProvider> = new Map();
    private enabledProviders: IProvider[] = [];

    /**
     * Register a new provider
     */
    register(provider: IProvider): void {
        this.providers.set(provider.config.id, provider);
        this.updateEnabledProviders();
    }

    /**
     * Unregister a provider
     */
    unregister(providerId: string): void {
        this.providers.delete(providerId);
        this.updateEnabledProviders();
    }

    /**
     * Get a specific provider
     */
    getProvider(providerId: string): IProvider | undefined {
        return this.providers.get(providerId);
    }

    /**
     * Get all providers
     */
    getAllProviders(): IProvider[] {
        return Array.from(this.providers.values());
    }

    /**
     * Get enabled providers sorted by priority
     */
    getEnabledProviders(): IProvider[] {
        return this.enabledProviders;
    }

    /**
     * Enable/disable a provider
     */
    setProviderEnabled(providerId: string, enabled: boolean): void {
        const provider = this.providers.get(providerId);
        if (provider) {
            provider.config.enabled = enabled;
            this.updateEnabledProviders();
        }
    }

    /**
     * Update enabled providers list
     */
    private updateEnabledProviders(): void {
        this.enabledProviders = Array.from(this.providers.values())
            .filter(p => p.config.enabled)
            .sort((a, b) => a.config.priority - b.config.priority);
    }

    /**
     * Get posts from all enabled providers
     */
    async getPostsFromAll(params: Omit<GetPostsParams, 'providerContext'>): Promise<Post[]> {
        const results = await Promise.allSettled(
            this.enabledProviders.map(provider =>
                provider.getPosts({
                    ...params,
                    providerContext: {
                        baseUrl: provider.config.baseUrl,
                    },
                })
            )
        );

        const posts: Post[] = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                posts.push(...result.value);
            } else {
                console.error(`Provider ${this.enabledProviders[index].config.name} failed:`, result.reason);
            }
        });

        return posts;
    }

    /**
     * Search across all enabled providers
     */
    async searchAll(params: Omit<GetSearchPostsParams, 'providerContext'>): Promise<Post[]> {
        const results = await Promise.allSettled(
            this.enabledProviders
                .filter(p => p.getSearchPosts)
                .map(provider =>
                    provider.getSearchPosts!({
                        ...params,
                        providerContext: {
                            baseUrl: provider.config.baseUrl,
                        },
                    })
                )
        );

        const posts: Post[] = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                posts.push(...result.value);
            } else {
                console.error(`Search failed for provider:`, result.reason);
            }
        });

        // Remove duplicates based on title similarity
        return this.deduplicatePosts(posts);
    }

    /**
     * Get metadata with fallback
     */
    async getMetaWithFallback(link: string, preferredProviderId?: string): Promise<Info | null> {
        const providers = preferredProviderId
            ? [this.providers.get(preferredProviderId), ...this.enabledProviders].filter(Boolean) as IProvider[]
            : this.enabledProviders;

        for (const provider of providers) {
            try {
                const meta = await provider.getMeta({
                    link,
                    providerContext: {
                        baseUrl: provider.config.baseUrl,
                    },
                });
                return meta;
            } catch (error) {
                console.error(`Failed to get meta from ${provider.config.name}:`, error);
                continue;
            }
        }

        return null;
    }

    /**
     * Get streams from multiple providers
     */
    async getStreamsFromAll(link: string, type: 'movie' | 'tv'): Promise<Stream[]> {
        const results = await Promise.allSettled(
            this.enabledProviders.map(provider =>
                provider.getStream({
                    link,
                    type,
                    providerContext: {
                        baseUrl: provider.config.baseUrl,
                    },
                })
            )
        );

        const streams: Stream[] = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                streams.push(...result.value);
            } else {
                console.error(`Stream fetch failed for ${this.enabledProviders[index].config.name}:`, result.reason);
            }
        });

        return streams;
    }

    /**
     * Get episodes with fallback
     */
    async getEpisodesWithFallback(url: string, preferredProviderId?: string): Promise<EpisodeLink[]> {
        const providers = preferredProviderId
            ? [this.providers.get(preferredProviderId), ...this.enabledProviders].filter(Boolean) as IProvider[]
            : this.enabledProviders;

        for (const provider of providers) {
            if (!provider.getEpisodes) continue;

            try {
                const episodes = await provider.getEpisodes({
                    url,
                    providerContext: {
                        baseUrl: provider.config.baseUrl,
                    },
                });
                return episodes;
            } catch (error) {
                console.error(`Failed to get episodes from ${provider.config.name}:`, error);
                continue;
            }
        }

        return [];
    }

    /**
     * Remove duplicate posts
     */
    private deduplicatePosts(posts: Post[]): Post[] {
        const seen = new Map<string, Post>();

        posts.forEach(post => {
            const key = `${post.title.toLowerCase()}-${post.year || ''}`;
            if (!seen.has(key)) {
                seen.set(key, post);
            }
        });

        return Array.from(seen.values());
    }

    /**
     * Get provider statistics
     */
    getStats() {
        return {
            total: this.providers.size,
            enabled: this.enabledProviders.length,
            disabled: this.providers.size - this.enabledProviders.length,
            providers: Array.from(this.providers.values()).map(p => ({
                id: p.config.id,
                name: p.config.name,
                enabled: p.config.enabled,
                priority: p.config.priority,
                type: p.config.type,
            })),
        };
    }
}

// Export singleton instance
export const providerManager = new ProviderManager();
