import axios from 'axios';
import { Movie, MovieDetails, AdultVideo } from '../types';

// --- constants ---
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Use Vite's import.meta.env for environment variables
// SECURITY: Never hardcode API keys - use environment variables only
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const EPORNER_API_BASE = 'https://www.eporner.com/api/v2';

// Development-only logging (removed in production)
if (import.meta.env.DEV) {

}

// --- TMDB API ---
const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const tmdbApi = {
  getTrending: async (timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> => {
    const res = await tmdbClient.get(`/trending/all/${timeWindow}`);
    return res.data.results;
  },
  getPopular: async (type: 'movie' | 'tv' = 'movie', page = 1): Promise<Movie[]> => {
    const res = await tmdbClient.get(`/${type}/popular`, { params: { page } });
    return res.data.results;
  },
  getTopRated: async (type: 'movie' | 'tv' = 'movie', page = 1): Promise<Movie[]> => {
    const res = await tmdbClient.get(`/${type}/top_rated`, { params: { page } });
    return res.data.results;
  },
  getUpcoming: async (): Promise<Movie[]> => {
    const res = await tmdbClient.get(`/movie/upcoming`);
    return res.data.results;
  },
  getNowPlaying: async (): Promise<Movie[]> => {
    const res = await tmdbClient.get(`/movie/now_playing`);
    return res.data.results;
  },
  getDetails: async (id: string, type: 'movie' | 'tv'): Promise<MovieDetails> => {
    const res = await tmdbClient.get(`/${type}/${id}`, {
      params: { append_to_response: 'credits,videos,similar' },
    });
    return res.data;
  },
  getSimilar: async (id: string, type: 'movie' | 'tv' = 'movie'): Promise<Movie[]> => {
    const res = await tmdbClient.get(`/${type}/${id}/similar`);
    return res.data.results;
  },
  search: async (query: string, page = 1): Promise<Movie[]> => {
    const res = await tmdbClient.get(`/search/multi`, {
      params: { query, page },
    });
    return res.data.results;
  },
  getMoviesByGenre: async (genreId: string, page = 1): Promise<Movie[]> => {
    const res = await tmdbClient.get(`/discover/movie`, {
      params: {
        with_genres: genreId,
        page: page,
        sort_by: 'popularity.desc'
      },
    });
    return res.data.results;
  },
  getDiscoverTV: async (page = 1): Promise<Movie[]> => {
    const res = await tmdbClient.get(`/discover/tv`, {
      params: {
        page: page,
        sort_by: 'popularity.desc'
      },
    });
    return res.data.results.map((show: any) => ({ ...show, title: show.name, release_date: show.first_air_date }));
  },
  getTrendingTV: async (): Promise<Movie[]> => {
    const res = await tmdbClient.get(`/trending/tv/week`);
    return res.data.results.map((show: any) => ({ ...show, title: show.name, release_date: show.first_air_date }));
  },
  getActorDetails: async (actorId: string) => {
    const res = await tmdbClient.get(`/person/${actorId}`);
    return res.data;
  },
  getActorMovieCredits: async (actorId: string) => {
    const res = await tmdbClient.get(`/person/${actorId}/movie_credits`);
    return res.data;
  },
  getActorTVCredits: async (actorId: string) => {
    const res = await tmdbClient.get(`/person/${actorId}/tv_credits`);
    return res.data;
  },
  getImageUrl: (path: string | null, size: 'w500' | 'original' = 'w500') => {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://picsum.photos/500/750?grayscale';
  }
};

// --- Adult API (Eporner) ---
// Note: CORS might be an issue with direct browser calls to some adult APIs. 
// In production, this requires a proxy. We will attempt direct call or fallback to mock for demo.
export const adultApi = {
  getVideos: async (query = '', page = 1, limit = 20, order = 'top-weekly'): Promise<AdultVideo[]> => {
    try {
      const res = await axios.get(`${EPORNER_API_BASE}/video/search/`, {
        params: {
          query: order === 'jav' ? `${query} jav` : query,
          per_page: limit,
          page: page,
          thumbsize: 'medium',
          order: order === 'jav' ? 'latest-updates' : order, // top-weekly, top-monthly, latest-updates, most-viewed, top-rated
          format: 'json'
        },
      });
      return res.data.videos;
    } catch (error) {
      console.warn("Eporner API failed (likely CORS). Returning fallback data for demo.");
      // Mock data for demonstration purposes since we can't fix CORS from client-side only
      return Array.from({ length: 10 }).map((_, i) => ({
        id: `mock-${i}`,
        title: `Adult Video Demo Title ${i + 1}`,
        url: '#',
        default_thumb: { src: `https://picsum.photos/400/225?random=${i}` },
        length_min: '12:34',
        views: 10000 + i * 500,
        rate: '95%',
        keywords: 'demo, test'
      }));
    }
  }
};
