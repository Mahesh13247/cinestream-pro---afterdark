import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipForward, SkipBack } from 'lucide-react';
import { StreamSource, PlaybackQuality } from '../types';

interface PlayerProps {
  sources: StreamSource[];
  poster?: string;
  onEnded?: () => void;
}

const Player: React.FC<PlayerProps> = ({ sources, poster, onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quality, setQuality] = useState<PlaybackQuality>(PlaybackQuality.Q720P);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Identify current source based on quality
  const currentSource = sources.find(s => s.quality === quality) || sources[0];

  useEffect(() => {
    if (!videoRef.current || !currentSource) return;
    
    const video = videoRef.current;

    if (Hls.isSupported() && currentSource.type === 'm3u8') {
      const hls = new Hls();
      hls.loadSource(currentSource.url);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = currentSource.url;
    } else {
      // Direct MP4
      video.src = currentSource.url;
    }
  }, [currentSource]);

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          videoRef.current.currentTime -= 10;
          break;
        case 'ArrowRight':
          videoRef.current.currentTime += 10;
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Number(e.target.value);
      setProgress(Number(e.target.value));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div 
      ref={containerRef} 
      className="relative group w-full aspect-video bg-black overflow-hidden rounded-xl shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
        onClick={togglePlay}
      />

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Progress Bar */}
        <div className="w-full mb-4 flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
              {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
            </button>
            
            <div className="flex items-center gap-2 group/vol">
              <button onClick={toggleMute} className="text-white">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const vol = Number(e.target.value);
                  setVolume(vol);
                  setIsMuted(vol === 0);
                  if (videoRef.current) videoRef.current.volume = vol;
                }}
                className="w-0 overflow-hidden group-hover/vol:w-24 transition-all h-1 bg-gray-500"
              />
            </div>

            <span className="text-sm text-gray-300 font-mono">
              {formatTime(progress)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quality Selector */}
            <div className="relative group/settings">
              <button className="text-white hover:text-primary">
                <Settings size={20} />
              </button>
              <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/10 rounded-lg p-2 hidden group-hover/settings:block min-w-[100px]">
                {sources.map((src) => (
                  <button
                    key={src.quality}
                    onClick={() => setQuality(src.quality)}
                    className={`block w-full text-left px-3 py-1 text-xs rounded hover:bg-white/10 ${quality === src.quality ? 'text-primary' : 'text-gray-300'}`}
                  >
                    {src.quality}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={toggleFullscreen} className="text-white hover:text-primary">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Center Play Button (Initial or Paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-primary/50">
            <Play size={32} className="ml-1 text-primary" fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;