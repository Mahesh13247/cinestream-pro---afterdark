/**
 * Provider Registry
 * Central place to import and register all providers
 */

import { providerManager } from './ProviderManager';
import { AllProviders } from './universal/allProviders';
import { AllNewProviders, AllProviderIds } from './allProviders';
import { prefetchProviderUrls } from './utils/getBaseUrl';

// Register all providers
export async function initializeProviders() {
    if (import.meta.env.DEV) {

    }

    // Prefetch provider URLs for better performance
    prefetchProviderUrls().catch(error => {
        console.error('Failed to prefetch provider URLs:', error);
    });

    // Register existing universal providers
    if (import.meta.env.DEV) {

    }
    AllProviders.forEach(provider => {
        providerManager.register(provider);
    });

    // Register new providers (Embed + Anime)
    if (import.meta.env.DEV) {

    }
    AllNewProviders.forEach(provider => {
        providerManager.register(provider);
        if (import.meta.env.DEV) {

        }
    });

    const stats = providerManager.getStats();
    if (import.meta.env.DEV) {

    }
}

// Calculate total stream count
function getAllStreamCount(): number {
    return AllProviders.reduce((total, provider) => {
        // Estimate based on provider configs
        return total + 2; // Average 2 servers per provider
    }, 0);
}

// Export provider manager for use throughout the app
export { providerManager };
export * from './types';
export { extractors } from './extractors';
export { getBaseUrl, getAllProviderUrls } from './utils/getBaseUrl';
export { commonHeaders } from './utils/commonHeaders';
