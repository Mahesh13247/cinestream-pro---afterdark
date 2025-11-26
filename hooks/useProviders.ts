/**
 * React Query Hooks for Providers
 * Provides caching and optimized data fetching
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { providerManager } from '../providers';
import { Post, Info, Stream } from '../providers/types';

/**
 * Hook to fetch posts from all providers
 */
export function useProviderPosts(
    filter: string = 'latest',
    page: number = 1,
    enabled: boolean = true
) {
    return useQuery({
        queryKey: ['provider-posts', filter, page],
        queryFn: () => providerManager.getPostsFromAll({ filter, page }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled,
    });
}

/**
 * Hook to search across all providers
 */
export function useProviderSearch(
    searchQuery: string,
    page: number = 1,
    enabled: boolean = true
) {
    return useQuery({
        queryKey: ['provider-search', searchQuery, page],
        queryFn: () => providerManager.searchAll({ searchQuery, page }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: enabled && searchQuery.length > 0,
    });
}

/**
 * Hook to fetch metadata with fallback
 */
export function useProviderMeta(
    link: string,
    preferredProviderId?: string,
    enabled: boolean = true
) {
    return useQuery({
        queryKey: ['provider-meta', link, preferredProviderId],
        queryFn: () => providerManager.getMetaWithFallback(link, preferredProviderId),
        staleTime: 1000 * 60 * 10, // 10 minutes
        enabled: enabled && !!link,
    });
}

/**
 * Hook to fetch streams from all providers
 */
export function useProviderStreams(
    link: string,
    type: 'movie' | 'tv',
    enabled: boolean = true
): UseQueryResult<Stream[], Error> {
    return useQuery({
        queryKey: ['provider-streams', link, type],
        queryFn: () => providerManager.getStreamsFromAll(link, type),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: enabled && !!link,
        retry: 2,
        retryDelay: 1000,
    });
}

/**
 * Hook to get provider statistics
 */
export function useProviderStats() {
    return useQuery({
        queryKey: ['provider-stats'],
        queryFn: () => providerManager.getStats(),
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

/**
 * Hook to get all enabled providers
 */
export function useEnabledProviders() {
    return useQuery({
        queryKey: ['enabled-providers'],
        queryFn: () => providerManager.getEnabledProviders(),
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
