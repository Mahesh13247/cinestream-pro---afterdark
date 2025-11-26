/**
 * Batch Provider Generator
 * Generates all remaining providers at once
 */

const { generateProvider } = require('./generateProvider.js');
const fs = require('fs');
const path = require('path');

// All providers to generate
const providers = [
    // Movies (27 remaining)
    { id: 'UhdMovies', name: 'UHD Movies', priority: 6, category: 'movies' },
    { id: 'Vega', name: 'Vega Movies', priority: 7, category: 'movies' },
    { id: 'lux', name: 'Lux Movies', priority: 8, category: 'movies' },
    { id: 'drive', name: 'Movies Drive', priority: 9, category: 'movies' },
    { id: 'multi', name: 'Multi Movies', priority: 10, category: 'movies' },
    { id: 'w4u', name: 'World4uFree', priority: 11, category: 'movies' },
    { id: 'extra', name: 'Extra Movies', priority: 12, category: 'movies' },
    { id: 'hdhub', name: 'HDHub4u', priority: 13, category: 'movies' },
    { id: 'kat', name: 'KatMovieHD', priority: 14, category: 'movies' },
    { id: 'dooflix', name: 'Dooflix', priority: 15, category: 'movies' },
    { id: 'filmyfly', name: 'FilmyFly', priority: 16, category: 'movies' },
    { id: '4khdhub', name: '4KHDHub', priority: 17, category: 'movies' },
    { id: 'moviezwap', name: 'Moviezwap', priority: 18, category: 'movies' },
    { id: '9xflix', name: '9xFlix', priority: 19, category: 'movies' },
    { id: 'movieBox', name: 'MovieBox', priority: 20, category: 'movies' },
    { id: 'cinevood', name: 'Cinevood', priority: 21, category: 'movies' },
    { id: 'kmmovies', name: 'KM Movies', priority: 22, category: 'movies' },
    { id: 'zeefliz', name: 'ZeeFliz', priority: 23, category: 'movies' },
    { id: 'katmoviefix', name: 'KatMovieFix', priority: 24, category: 'movies' },
    { id: 'movies4u', name: 'Movies4u', priority: 25, category: 'movies' },
    { id: 'joya9tv', name: 'Joya9TV', priority: 26, category: 'movies' },
    { id: 'skymovieshd', name: 'Sky Movies HD', priority: 27, category: 'movies' },
    { id: '1cinevood', name: 'Cinewood', priority: 28, category: 'movies' },
    { id: 'protonMovies', name: 'Proton Movies', priority: 29, category: 'movies' },
    { id: 'ridomovies', name: 'Rido Movies', priority: 30, category: 'movies' },
    { id: 'moviesapi', name: 'Movies API', priority: 31, category: 'movies' },
    { id: 'filepress', name: 'FilePress', priority: 32, category: 'movies' },

    // Anime (4)
    { id: 'Animeflix', name: 'Animeflix', priority: 33, category: 'anime' },
    { id: 'animerulz', name: 'Anime Rulz', priority: 34, category: 'anime' },
    { id: 'aea', name: 'AutoEmbed Anime', priority: 35, category: 'anime' },
    { id: 'tokyoinsider', name: 'Tokyo Insider', priority: 36, category: 'anime' },

    // Drama (4)
    { id: 'dc', name: 'Dramacool', priority: 37, category: 'drama' },
    { id: 'aed', name: 'AutoEmbed Drama', priority: 38, category: 'drama' },
    { id: 'kissKh', name: 'KissKH', priority: 39, category: 'drama' },
    { id: 'dramafull', name: 'Dramafull', priority: 40, category: 'drama' },

    // Embed (9)
    { id: 'autoEmbed', name: 'AutoEmbed', priority: 41, category: 'embed' },
    { id: 'embedsu', name: 'EmbedSu', priority: 42, category: 'embed' },
    { id: 'nfMirror', name: 'NFMirror', priority: 43, category: 'embed' },
    { id: 'primewire', name: 'Primewire', priority: 44, category: 'embed' },
    { id: 'rive', name: 'Rive', priority: 45, category: 'embed' },
    { id: 'vadapav', name: 'Vadapav', priority: 46, category: 'embed' },
    { id: 'cinemaLuxe', name: 'Cinema Luxe', priority: 47, category: 'embed' },
    { id: 'consumet', name: 'Consumet', priority: 48, category: 'embed' },
    { id: 'showbox', name: 'ShowBox', priority: 49, category: 'embed' },
];

console.log(`🚀 Generating ${providers.length} providers...`);

const generated = [];
providers.forEach(provider => {
    try {
        const dirName = generateProvider(
            provider.id,
            provider.name,
            provider.priority,
            provider.category
        );
        generated.push({
            id: provider.id,
            name: provider.name,
            category: provider.category,
            dirName,
        });
    } catch (error) {
        console.error(`❌ Failed to generate ${provider.name}:`, error.message);
    }
});

console.log(`\n✅ Successfully generated ${generated.length}/${providers.length} providers`);

// Generate imports for allProviders.ts
console.log('\n📝 Add these imports to allProviders.ts:\n');

const movieImports = generated.filter(p => p.category === 'movies');
const animeImports = generated.filter(p => p.category === 'anime');
const dramaImports = generated.filter(p => p.category === 'drama');
const embedImports = generated.filter(p => p.category === 'embed');

if (movieImports.length > 0) {
    console.log('// Movie Providers');
    movieImports.forEach(p => {
        const className = p.name.replace(/\s+/g, '');
        console.log(`import { ${className}Provider } from './movies/${p.dirName}/index.js';`);
    });
}

if (animeImports.length > 0) {
    console.log('\n// Anime Providers');
    animeImports.forEach(p => {
        const className = p.name.replace(/\s+/g, '');
        console.log(`import { ${className}Provider } from './anime/${p.dirName}/index.js';`);
    });
}

if (dramaImports.length > 0) {
    console.log('\n// Drama Providers');
    dramaImports.forEach(p => {
        const className = p.name.replace(/\s+/g, '');
        console.log(`import { ${className}Provider } from './drama/${p.dirName}/index.js';`);
    });
}

if (embedImports.length > 0) {
    console.log('\n// Embed Providers');
    embedImports.forEach(p => {
        const className = p.name.replace(/\s+/g, '');
        console.log(`import { ${className}Provider } from './embed/${p.dirName}/index.js';`);
    });
}

console.log('\n📝 Add these to AllNewProviders array:\n');
generated.forEach(p => {
    const className = p.name.replace(/\s+/g, '');
    console.log(`    ${className}Provider,`);
});

console.log('\n✅ Provider generation complete!');
console.log('Next steps:');
console.log('1. Copy the imports above to providers/allProviders.ts');
console.log('2. Add the providers to the AllNewProviders array');
console.log('3. Test the application');
