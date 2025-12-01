/**
 * Stream Extractors
 * Export all stream extraction utilities
 */

import { hubcloudExtractor } from './hubcloudExtractor';
import { pixeldrainExtractor } from './pixeldrainExtractor';
import { gofileExtractor } from './gofileExtractor';
import { gdflixExtractor } from './gdflixExtractor';
import { superVideoExtractor } from './superVideoExtractor';

// Named exports
export { hubcloudExtractor } from './hubcloudExtractor';
export { pixeldrainExtractor } from './pixeldrainExtractor';
export { gofileExtractor } from './gofileExtractor';
export { gdflixExtractor } from './gdflixExtractor';
export { superVideoExtractor } from './superVideoExtractor';

// Combined export for convenience
export const extractors = {
    hubcloudExtractor,
    pixeldrainExtractor,
    gofileExtractor,
    gdflixExtractor,
    superVideoExtractor,
};
