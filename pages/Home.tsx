import React, { useEffect, useState } from 'react';
import { tmdbApi } from '../services/api';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import ContinueWatchingCard from '../components/ContinueWatchingCard';
import Section from '../components/Section';
import { Link } from 'react-router-dom';
import { Play, Info, TrendingUp, Star, Calendar, Clock, Globe } from 'lucide-react';
import { useContinueWatching } from '../hooks/useContinueWatching';

const Home = () => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { items: continueWatchingItems, removeItem } = useContinueWatching();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [trend, pop, top, up, now] = await Promise.all([
          tmdbApi.getTrending(),
          tmdbApi.getPopular(),
          tmdbApi.getTopRated(),
          tmdbApi.getUpcoming(),
          tmdbApi.getNowPlaying()
        ]);
        setTrending(trend);
        setPopular(pop);
        setTopRated(top);
        setUpcoming(up);
        setNowPlaying(now);
        setHeroMovie(trend[0]);
      } catch (error) {
        console.error("Failed to fetch movies", error);
        setError("Failed to load movies. Please check your internet connection or API key.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Map continue watching items to Movie type for Section component
  const continueWatchingMovies: Movie[] = continueWatchingItems.map(item => ({
    id: parseInt(item.tmdbId),
    title: item.title,
    name: item.title, // Handle TV shows
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    vote_average: 0,
    release_date: '',
    first_air_date: '',
    overview: '',
    genre_ids: [],
    original_language: 'en',
    popularity: 0,
    vote_count: 0,
    video: false,
    adult: false
  }));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-primary font-medium">Loading amazing content...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-red-500 gap-4 px-4">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
        <Info size={40} />
      </div>
      <p className="text-xl text-center max-w-md">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-blue-400 transition-all transform hover:scale-105"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Enhanced Hero Section - Mobile Optimized */}
      {heroMovie && (
        <div className="relative h-[60vh] md:h-[75vh] lg:h-[85vh] w-full overflow-hidden">
          {/* Background Image with Parallax Effect */}
          <div className="absolute inset-0">
            <img
              src={tmdbApi.getImageUrl(heroMovie.backdrop_path, 'original')}
              alt={heroMovie.title}
              className="w-full h-full object-cover scale-105 animate-[zoom_20s_ease-in-out_infinite_alternate]"
            />
            {/* Multi-layer Gradients for Depth - Theme Aware */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 md:via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 md:from-background/90 via-background/50 md:via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
          </div>

          {/* Hero Content - Mobile Optimized */}
          <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 lg:p-16 z-30">
            <div className="max-w-4xl space-y-3 md:space-y-5 animate-fade-in">
              {/* Badges - Compact on Mobile */}
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <span className="px-3 md:px-4 py-1 md:py-1.5 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 md:gap-2">
                  <TrendingUp className="w-3 md:w-3.5" />
                  <span className="hidden sm:inline">Trending Now</span>
                  <span className="sm:hidden">Trending</span>
                </span>
                {heroMovie.vote_average && (
                  <span className="px-3 md:px-4 py-1 md:py-1.5 bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-bold flex items-center gap-1.5">
                    <Star className="w-3 md:w-3.5 fill-current" />
                    {heroMovie.vote_average.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Title - Responsive Sizing - Theme Aware */}
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-tight" style={{ color: 'var(--color-hero-text)' }}>
                <span className="drop-shadow-2xl">
                  {heroMovie.title || heroMovie.name}
                </span>
              </h1>

              {/* Description - Hidden on Small Mobile - Theme Aware */}
              <p className="hidden sm:block text-sm md:text-base lg:text-lg line-clamp-2 md:line-clamp-3 max-w-2xl drop-shadow-lg leading-relaxed" style={{ color: 'var(--color-hero-text-muted)' }}>
                {heroMovie.overview}
              </p>

              {/* Meta Info - Compact on Mobile - Theme Aware */}
              <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400">
                  <Star size={14} className="md:w-4 md:h-4 fill-current" />
                  <span className="font-bold">{heroMovie.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} className="md:w-4 md:h-4" />
                  <span>{new Date(heroMovie.release_date || heroMovie.first_air_date || '').getFullYear()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe size={14} className="md:w-4 md:h-4" />
                  <span>{heroMovie.original_language?.toUpperCase() || 'EN'}</span>
                </div>
              </div>

              {/* CTA Buttons - Touch-Optimized */}
              <div className="flex items-center gap-3 md:gap-4 pt-2 md:pt-4 flex-wrap">
                <Link
                  to={`/watch/${heroMovie.id}`}
                  className="group bg-primary text-black font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 hover:bg-blue-400 transition-all transform active:scale-95 md:hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-primary/50 min-h-[44px]"
                >
                  <Play className="w-5 md:w-6 fill-current group-hover:scale-110 transition-transform" />
                  <span className="text-sm md:text-base">Watch Now</span>
                </Link>
                <Link
                  to={`/movies/${heroMovie.id}`}
                  className="group backdrop-blur-xl border-2 font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 transition-all transform active:scale-95 md:hover:scale-105 min-h-[44px] bg-white/90 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-white/20 hover:border-gray-400 dark:hover:border-white/40"
                >
                  <Info className="w-5 md:w-6 group-hover:rotate-12 transition-transform" />
                  <span className="text-sm md:text-base">More Info</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll Indicator - Hidden on Mobile */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce hidden md:block">
            <div className="w-6 h-10 border-2 border-white/30 dark:border-white/30 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/50 dark:bg-white/50 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections - Fixed Spacing */}
      <div className="w-full max-w-[2000px] mx-auto px-4 md:px-8 mt-12 md:mt-8 lg:mt-4 relative z-10 space-y-10 md:space-y-16">

        {/* Continue Watching Section */}
        {continueWatchingMovies.length > 0 && (
          <section className="space-y-4 md:space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between px-4 md:px-0">
              <h2 className="text-2xl md:text-3xl font-bold text-text flex items-center gap-3">
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Continue Watching
                </span>
                <div className="hidden md:block w-20 h-1 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
              </h2>
            </div>

            {/* Movies Grid - Horizontal Scroll on Mobile, Grid on Desktop */}
            <div className="relative">
              {/* Mobile: Horizontal Scroll */}
              <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-4 pb-4 snap-x snap-mandatory">
                  {continueWatchingMovies.slice(0, 10).map((movie) => (
                    <div
                      key={movie.id}
                      className="flex-none w-[160px] snap-start"
                    >
                      <ContinueWatchingCard movie={movie} onRemove={removeItem} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop: Responsive Grid */}
              <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 min-[1800px]:grid-cols-7 gap-6">
                {continueWatchingMovies.slice(0, 12).map((movie) => (
                  <ContinueWatchingCard key={movie.id} movie={movie} onRemove={removeItem} />
                ))}
              </div>

              {/* Gradient Fade on Mobile Scroll */}
              <div className="md:hidden absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>
          </section>
        )}

        {/* Trending Section with Special Styling */}
        <div className="relative">
          <div className="absolute -top-8 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <Section title="Trending Now" movies={trending} link="/movies" />
        </div>

        {/* Now Playing */}
        <Section title="Now Playing" movies={nowPlaying} link="/movies" />

        {/* Popular with Accent */}
        <div className="relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
          <Section title="Popular Movies" movies={popular} link="/movies" />
        </div>

        {/* Top Rated */}
        <Section title="Top Rated" movies={topRated} link="/movies" />

        {/* Upcoming */}
        <Section title="Upcoming Releases" movies={upcoming} link="/movies" />
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-1/4 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/4 right-0 w-96 h-96 bg-secondary/3 rounded-full blur-3xl pointer-events-none -z-10"></div>
    </div>
  );
};

export default Home;
