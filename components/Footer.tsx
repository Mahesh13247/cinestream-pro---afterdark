import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full py-8 mt-auto bg-gradient-to-t from-black to-transparent backdrop-blur-sm">
            <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2 text-gray-400 font-medium tracking-wide">
                    <span>Designed & Developed by</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent animate-pulse font-signature tracking-wider">
                    K Mahesh Kumar Achary
                </h3>

                <div className='flex items-center gap-2 text-gray-400 font-medium tracking-wide'><p>Made In India With </p>
                    <Heart className="w-4 h-4" color="red" fill="red" />
                </div>
            </div>
        </footer>
    );
};

export default Footer;
