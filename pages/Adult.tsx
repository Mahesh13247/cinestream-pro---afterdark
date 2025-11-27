import React, { useState, useEffect, useCallback } from 'react';
import { adultApi } from '../services/api';
import { AdultVideo } from '../types';
import { AlertOctagon, Lock, Search, Star, Eye, Clock, Filter, TrendingUp, X, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const Adult = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [videos, setVideos] = useState<AdultVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('top-weekly');
  const [heroVideo, setHeroVideo] = useState<AdultVideo | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<AdultVideo | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { id: 'top-weekly', name: 'Top Weekly', icon: TrendingUp },
    { id: 'top-monthly', name: 'Top Monthly', icon: Star },
    { id: 'top-rated', name: 'Top Rated', icon: Star },
    { id: 'most-viewed', name: 'Most Viewed', icon: Eye },
    { id: 'latest-updates', name: 'Latest', icon: Clock },
    { id: 'jav', name: 'JAV', icon: TrendingUp },
  ];

  // Check localStorage on mount
  useEffect(() => {
    const verified = localStorage.getItem('is18PlusConfirmed');
    if (verified === 'true') {
      setIsVerified(true);
      loadVideos(1, activeCategory, searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Reload when category changes
  useEffect(() => {
    if (isVerified) {
      setPage(1);
      setHasMore(true);
      setVideos([]);
      loadVideos(1, activeCategory, searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, isVerified]); // Reload when category or verification status changes

  const loadVideos = async (pageNum: number, order: string, query: string) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setIsFetchingMore(true);

      const data = await adultApi.getVideos(query, pageNum, 20, order);

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setVideos(prev => pageNum === 1 ? data : [...prev, ...data]);
        if (pageNum === 1 && data.length > 0) {
          setHeroVideo(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load videos', error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!isFetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadVideos(nextPage, activeCategory, searchQuery);
    }
  }, [isFetchingMore, hasMore, page, activeCategory, searchQuery]);

  const lastElementRef = useInfiniteScroll(loadMore, isFetchingMore);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setHasMore(true);
    setVideos([]);
    loadVideos(1, activeCategory, searchQuery);
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleVideoClick = (video: AdultVideo) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  const closePlayer = () => {
    setIsPlayerOpen(false);
    setTimeout(() => setSelectedVideo(null), 300);
  };

  const handleVerify = () => {
    localStorage.setItem('is18PlusConfirmed', 'true');
    setIsVerified(true);
    loadVideos(1, activeCategory, searchQuery);
  };

  const handleExit = () => {
    navigate('/');
  };

  // Get suggested videos (exclude current video) - show all available
  const getSuggestedVideos = () => {
    if (!selectedVideo) return [];
    return videos.filter(v => v.id !== selectedVideo.id);
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-secondary/50 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Lock className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold text-secondary">Restricted Access</h1>
          <p className="text-gray-300">
            The following content contains material of an adult nature and is intended for viewers 18 years of age or older.
          </p>
          <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20 flex gap-3 text-left">
            <AlertOctagon className="text-secondary shrink-0" />
            <span className="text-xs text-gray-400">By entering, you confirm you are at least 18 years old and consent to viewing sexually explicit content.</span>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleVerify}
              className="w-full bg-secondary hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
            >
              I am 18+ - Enter
            </button>
            <button
              onClick={handleExit}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Exit to Safe Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const suggestedVideos = getSuggestedVideos();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Video Player Modal */}
      {isPlayerOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/95 p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-7xl my-8">
            {/* Close Button */}
            <button
              onClick={closePlayer}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="text-white" size={24} />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Player Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Video Player */}
                <div className="bg-surface rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      src={selectedVideo.embed || selectedVideo.url}
                      className="w-full h-full"
                      frameBorder="0"
                      referrerPolicy="no-referrer"
                      allowFullScreen
                      allow="autoplay; encrypted-media"
                      title={selectedVideo.title}
                    />
                  </div>

                  {/* Video Info */}
                  <div className="p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-text">{selectedVideo.title}</h2>
                    <div className="flex items-center gap-6 text-sm text-text-muted">
                      <div className="flex items-center gap-2">
                        <Eye size={16} />
                        <span>{selectedVideo.views.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{selectedVideo.length_min}</span>
                      </div>
                      {selectedVideo.rate && (
                        <div className="flex items-center gap-2 text-green-400">
                          <Star size={16} className="fill-current" />
                          <span>{selectedVideo.rate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggested Videos Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sticky top-4">
                  <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-secondary" />
                    Suggested Videos
                  </h3>
                  <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                    {suggestedVideos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => handleVideoClick(video)}
                        className="group w-full bg-white/5 hover:bg-white/10 rounded-lg overflow-hidden transition-all flex gap-3 p-2"
                      >
                        <div className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden">
                          <img
                            src={video.default_thumb.src}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                            {video.length_min}
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Play size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="white" />
                          </div>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="text-sm font-medium text-text line-clamp-2 group-hover:text-primary transition-colors">
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                              <Eye size={10} />
                              {(video.views / 1000).toFixed(0)}K
                            </span>
                            <span className="text-green-400">{video.rate}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
      }

      {/* Enhanced Hero Section */}
      {
        heroVideo && (
          <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={heroVideo.default_thumb.src}
                alt={heroVideo.title}
                className="w-full h-full object-cover scale-105 blur-sm"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16 z-30">
              <div className="max-w-4xl space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-4 py-1.5 bg-secondary/20 backdrop-blur-md border border-secondary/30 rounded-full text-secondary text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="bg-secondary text-black text-xs px-2 py-0.5 rounded font-black">18+</span>
                    Adult Content
                  </span>
                  {heroVideo.rate && (
                    <span className="px-4 py-1.5 bg-green-500/20 backdrop-blur-md border border-green-500/30 rounded-full text-green-400 text-xs font-bold flex items-center gap-2">
                      <Star size={14} className="fill-current" />
                      {heroVideo.rate} Rating
                    </span>
                  )}
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black drop-shadow-2xl leading-tight line-clamp-2" style={{ color: 'var(--color-hero-text)' }}>
                  {heroVideo.title}
                </h1>

                <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span>{heroVideo.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{heroVideo.length_min}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 flex-wrap">
                  <button
                    onClick={() => handleVideoClick(heroVideo)}
                    className="group bg-secondary text-white font-bold px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-red-600 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary/50"
                  >
                    <Play size={22} fill="currentColor" />
                    <span className="text-lg">Watch Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Search and Filters */}
      <div className="w-full max-w-[2000px] mx-auto px-4 md:px-8 mt-8 md:-mt-12 relative z-10">
        <div className="backdrop-blur-xl rounded-2xl p-6 mb-8 bg-surface border border-border">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-secondary/50 transition-all bg-input-bg border border-input-border text-text"
              />
            </div>
            <button
              type="submit"
              className="bg-secondary hover:bg-red-600 text-white font-bold px-8 py-3 rounded-xl transition-all transform hover:scale-105"
            >
              Search
            </button>
          </form>

          {/* Categories */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={18} className="text-text-muted" />
              <span className="text-sm font-medium text-text-muted">Filter by:</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeCategory === cat.id
                      ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                      : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-text'
                      }`}
                  >
                    <Icon size={16} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-secondary font-medium">Loading content...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {videos.map((video, index) => (
                <div
                  key={`${video.id}-${index}`}
                  ref={index === videos.length - 1 ? lastElementRef : null}
                  className="group relative rounded-xl overflow-hidden hover:border-secondary/50 transition-all transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-secondary/20 cursor-pointer bg-card-bg border border-border"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="block aspect-video overflow-hidden relative">
                    <img
                      src={video.default_thumb.src}
                      alt={video.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono">
                      {video.length_min}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 bg-secondary/90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <Play size={28} fill="white" className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium line-clamp-2 group-hover:text-secondary transition-colors text-text">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {video.views.toLocaleString()}
                      </span>
                      <span className="text-green-400 flex items-center gap-1">
                        <Star size={12} className="fill-current" />
                        {video.rate}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isFetchingMore && (
              <div className="flex justify-center py-8">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!hasMore && videos.length > 0 && (
              <div className="text-center py-8 text-text-muted">
                <p>No more videos to load</p>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-12 py-8 border-t border-white/5 text-center text-xs text-text-muted space-y-4">
          <p>Compliance Notice: All adult content is provided via 3rd party public APIs. We do not host any files.</p>
          <p className="text-text-muted">Provider: Eporner API</p>
          <button
            onClick={() => {
              localStorage.removeItem('is18PlusConfirmed');
              setIsVerified(false);
            }}
            className="mt-2 text-secondary underline hover:text-red-400 transition-colors"
          >
            Reset Age Gate
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-1/4 left-0 w-96 h-96 bg-secondary/3 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/4 right-0 w-96 h-96 bg-secondary/3 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Custom Scrollbar Styles */}

    </div >
  );
};

export default Adult;
