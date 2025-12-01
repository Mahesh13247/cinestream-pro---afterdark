import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-gradient-to-br from-gray-950 via-black to-gray-950 border-t-2 border-red-500/20 mt-auto backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <div className="flex flex-col items-center justify-center space-y-4">
                    {/* Main attribution text with enhanced styling */}
                    <div className="text-center space-y-2">
                        <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl animate-fadeIn" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            Designed and Developed By
                        </p>
                        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl animate-fadeIn" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                            K Mahesh Kumar Achary
                        </p>
                    </div>

                    {/* Heart icon with enhanced animation */}
                    <div className="flex items-center space-x-3 py-2">
                        <span className="text-sm sm:text-base md:text-lg font-bold text-gray-300">Made with</span>
                        <svg
                            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-500 animate-pulse drop-shadow-lg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-label="love"
                            style={{ filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))' }}
                        >
                            <path
                                fillRule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="text-sm sm:text-base md:text-lg font-bold text-gray-300">and Passion</span>
                    </div>

                    {/* Copyright with enhanced styling */}
                    <div className="pt-2 border-t border-gray-800/50 w-full max-w-md">
                        <p className="text-xs sm:text-sm md:text-base text-gray-400 text-center font-semibold tracking-wide">
                            © {new Date().getFullYear()} CineStream Pro · All Rights Reserved
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
