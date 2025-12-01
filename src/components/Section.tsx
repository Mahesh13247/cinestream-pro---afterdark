import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { Movie } from '../types';

interface SectionProps {
    title: string;
    movies: Movie[];
    link?: string;
}

const Section: React.FC<SectionProps> = ({ title, movies, link }) => {
    if (!movies || movies.length === 0) return null;

    return (
        <section className="space-y-4 md:space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between px-4 md:px-0">
                <h2 className="text-2xl md:text-3xl font-bold text-text flex items-center gap-3">
                    <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                        {title}
                    </span>
                    <div className="hidden md:block w-20 h-1 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
                </h2>

                {link && (
                    <Link
                        to={link}
                        className="group flex items-center gap-2 text-sm md:text-base text-text-muted hover:text-primary transition-colors font-medium"
                    >
                        <span>View All</span>
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>

            {/* Movies Grid - Horizontal Scroll on Mobile, Grid on Desktop */}
            <div className="relative">
                {/* Mobile: Horizontal Scroll */}
                <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-4 pb-4 snap-x snap-mandatory">
                        {movies.slice(0, 10).map((movie) => (
                            <div
                                key={movie.id}
                                className="flex-none w-[160px] snap-start"
                            >
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desktop: Responsive Grid */}
                <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 min-[1800px]:grid-cols-7 gap-6">
                    {movies.slice(0, 12).map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            </div>

            <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </section>
    );
};

export default Section;
