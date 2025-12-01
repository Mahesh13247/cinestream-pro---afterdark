import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface LivePlayerProps {
    src: string;
    poster?: string;
}

const LivePlayer: React.FC<LivePlayerProps> = ({ src, poster }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls: Hls | null = null;

        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = src;
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [src]);

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <video
                ref={videoRef}
                poster={poster}
                controls
                className="w-full h-full object-contain"
                playsInline
            />
        </div>
    );
};

export default LivePlayer;
