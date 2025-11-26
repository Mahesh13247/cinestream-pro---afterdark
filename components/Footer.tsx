import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full py-8 mt-auto bg-gradient-to-t from-black to-transparent backdrop-blur-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center gap-6 text-center">
                    {/* Top Text */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-gray-400 text-sm font-medium tracking-wide">
                        <span>Designed & Developed by</span>
                    </div>

                    {/* Name */}
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent animate-pulse font-signature tracking-wider px-4">
                        K Mahesh Kumar Achary
                    </h3>

                    {/* Made in India */}
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-medium tracking-wide">
                        <p>Made In India With</p>
                        <Heart className="w-4 h-4 flex-shrink-0 text-red-500 fill-red-500 animate-pulse" />
                    </div>

                    {/* Copyright */}
                    <div className="pt-6 border-t border-white/10 w-full max-w-md mx-auto">
                        <p className="text-gray-500 text-xs sm:text-sm">
                            © {new Date().getFullYear()} CineStream Pro. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
