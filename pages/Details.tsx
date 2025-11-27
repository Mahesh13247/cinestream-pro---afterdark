import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tmdbApi } from '../services/api';
import { MovieDetails } from '../types';
import { Star, Calendar, Clock, Play, Globe, Sparkles, ArrowLeft } from 'lucide-react';

interface DetailsProps {
  type: 'movie' | 'tv';
}

const Details: React.FC<DetailsProps> = ({ type }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mediaType = type;

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await tmdbApi.getDetails(id, mediaType);
        setMovie(data);
      } catch (error) {
        console.error(error);
        setError("Failed to load movie details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, mediaType]);

  if (loading) return <div className="h-screen flex items-center justify-center text-primary">Loading details...</div>;

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center text-red-500 gap-4">
      <p className="text-xl">{error}</p>
      <Link to="/" className="px-4 py-2 bg-primary text-black rounded hover:bg-blue-400">
        Go Home
      </Link>
    </div>
  );

  if (!movie) return <div className="h-screen flex items-center justify-center">Movie not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 left-4 z-40 p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-primary hover:text-black transition-all duration-300 group shadow-lg"
        aria-label="Go Back"
      >
        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
      </button>

      {/* Backdrop Header */}
      <div className="relative h-[50vh] lg:h-[60vh]">
        <div className="absolute inset-0">
          <img
            src={tmdbApi.getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 xl:gap-12 mb-8">
          {/* Poster */}
          <div className="w-48 md:w-64 lg:w-72 xl:w-80 flex-shrink-0 mx-auto md:mx-0 rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <img src={tmdbApi.getImageUrl(movie.poster_path)} alt={movie.title} className="w-full h-full object-fill" />
          </div>

          {/* Info */}
          <div className="flex-1 pt-8 md:pt-32 text-center md:text-left min-w-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-4 lg:mb-6">{movie.title || movie.name}</h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 lg:gap-4 text-sm lg:text-base text-text-muted mb-6 lg:mb-8">
              <div className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400">
                <Star size={18} fill="currentColor" />
                <span className="font-bold">{movie.vote_average.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={18} />
                <span>{new Date(movie.release_date || movie.first_air_date || '').getFullYear()}</span>
              </div>
              {movie.runtime && (
                <div className="flex items-center gap-1">
                  <Clock size={18} />
                  <span>{movie.runtime} min</span>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                {movie.genres.map(g => (
                  <span key={g.id} className="bg-surface border border-white/10 px-3 py-1 rounded text-xs lg:text-sm">{g.name}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 lg:gap-4 mb-6 lg:mb-8">
              <Link
                to={`/watch/${movie.id}`}
                className="bg-primary text-black font-bold px-6 lg:px-10 py-3 lg:py-4 rounded-lg flex items-center gap-2 hover:bg-blue-400 transition-transform hover:scale-105 text-sm lg:text-base"
              >
                <Play size={20} fill="currentColor" /> Watch Movie
              </Link>
              <button
                onClick={() => {
                  const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
                  if (watchlist.some((m: { id: number }) => m.id === movie.id)) {
                    const newWatchlist = watchlist.filter((m: { id: number }) => m.id !== movie.id);
                    localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
                    alert('Removed from Watchlist');
                  } else {
                    watchlist.push({ id: movie.id, title: movie.title || movie.name, poster_path: movie.poster_path });
                    localStorage.setItem('watchlist', JSON.stringify(watchlist));
                    alert('Added to Watchlist');
                  }
                }}
                className="bg-white/80 dark:bg-white/10 text-gray-900 dark:text-white font-bold px-6 lg:px-10 py-3 lg:py-4 rounded-lg flex items-center gap-2 hover:bg-white hover:border-black/10 dark:hover:bg-white/20 dark:hover:border-white/40 transition-transform hover:scale-105 border border-black/5 dark:border-white/10 text-sm lg:text-base"
              >
                <Star size={20} /> Watchlist
              </button>
            </div>

            <h3 className="text-xl lg:text-2xl font-semibold text-text mb-3">Overview</h3>
            <p className="text-text-muted leading-relaxed text-sm lg:text-base mb-6 lg:mb-8">{movie.overview}</p>
          </div>
        </div>

        {/* Trailers - Full Width Section */}
        {movie.videos?.results && movie.videos.results.length > 0 && (
          <div className="mb-8 w-full">
            <h3 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
              <Play size={20} className="text-primary" fill="currentColor" />
              Trailers & Videos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {movie.videos.results
                .filter(video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser'))
                .slice(0, 6)
                .map((video) => (
                  <div
                    key={video.key}
                    className="group relative aspect-video rounded-xl overflow-hidden bg-surface border border-white/10 shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50"
                  >
                    {/* Video Title Overlay */}
                    <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm font-semibold truncate">
                        {video.name || video.type}
                      </p>
                      <p className="text-white/70 text-xs">
                        {video.type} • YouTube
                      </p>
                    </div>

                    {/* Loading Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-highlight to-surface animate-pulse">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <Play size={32} className="text-primary ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    {/* YouTube Iframe */}
                    <iframe
                      src={`https://www.youtube.com/embed/${video.key}?rel=0&modestbranding=1`}
                      title={video.name || video.type}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      className="absolute inset-0 w-full h-full z-[5] transition-opacity duration-500"
                      onLoad={(e) => {
                        // Fade in the iframe and hide the loading placeholder
                        const iframe = e.currentTarget;
                        const placeholder = iframe.previousElementSibling;
                        if (placeholder) {
                          placeholder.classList.add('opacity-0');
                          setTimeout(() => placeholder.remove(), 500);
                        }
                      }}
                    />

                    {/* Bottom Gradient Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-[6] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Cast - Full Width Section */}
        <div className="mb-8">
          <h3 className="text-xl lg:text-2xl font-semibold text-text mb-4">Top Cast</h3>
          <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 xl:-mx-16 xl:px-16">
            {movie.credits?.cast.slice(0, 10).map((actor) => (
              <Link
                to={`/actor/${actor.id}`}
                key={actor.id}
                className="flex-none w-28 lg:w-32 group"
              >
                <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden mb-2 border-2 border-transparent group-hover:border-primary transition-colors">
                  {actor.profile_path ? (
                    <img
                      src={tmdbApi.getImageUrl(actor.profile_path, 'w500')}
                      alt={actor.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center text-text-muted text-xs text-center p-1">
                      No Image
                    </div>
                  )}
                </div>
                <p className="text-xs lg:text-sm font-medium text-text truncate group-hover:text-primary transition-colors">{actor.name}</p>
                <p className="text-xs text-text-muted truncate">{actor.character}</p>
              </Link>
            ))}
          </div>
        </div>


        {/* Similar Movies - Full Width Section */}
        {movie.similar && movie.similar.results.length > 0 && (
          <div className="mt-8 mb-8">
            <h3 className="text-xl lg:text-2xl font-semibold text-text mb-4">You May Also Like</h3>
            <div className="flex overflow-x-auto gap-4 lg:gap-5 pb-4 scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12 xl:-mx-16 xl:px-16">
              {movie.similar.results.slice(0, 10).map(similar => (
                <Link
                  key={similar.id}
                  to={`/${mediaType === 'tv' ? 'webseries' : 'movies'}/${similar.id}`}
                  className="w-40 lg:w-44 xl:w-48 flex-shrink-0 block group"
                >
                  <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-white/10 shadow-lg group-hover:shadow-2xl group-hover:shadow-primary/20 transition-all duration-300 group-hover:border-primary/50">
                    <img
                      src={tmdbApi.getImageUrl(similar.poster_path)}
                      alt={similar.title || similar.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm lg:text-base font-medium text-text truncate group-hover:text-primary transition-colors px-1">
                    {similar.title || similar.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default Details;
