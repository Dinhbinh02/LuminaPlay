'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Play, Pause, RotateCcw, RotateCw, ChevronLeft, SlidersHorizontal, List, SkipForward, PictureInPicture2, Maximize, Minimize, Volume2, VolumeX, Settings, Layers, Lock, Unlock, Cast } from 'lucide-react';
import styles from './VideoPlayer.module.css';
import { AnimatePresence, motion } from 'framer-motion';
import { useWatchParty, WatchPartyMessage } from '@/hooks/useWatchParty';
import { useRouter } from 'next/navigation';
import { tmdb } from '@/lib/tmdb';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  subTitle?: string;
  startTime?: number;
  autoPlay?: boolean;
  onProgress?: (currentTime: number, duration: number) => void;
  onNext?: () => void;
  onClose?: (currentTime: number, duration: number) => void;
  partyId?: string;
  episodes?: any[];
  currentEpisode?: number;
  onEpisodeSelect?: (episodeNum: string) => void;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const VideoPlayer = ({ 
  src, poster, title, subTitle, startTime, autoPlay = false, 
  onProgress, onNext, onClose, partyId, episodes, currentEpisode, onEpisodeSelect
}: VideoPlayerProps) => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0);
  const lastSyncTime = useRef(0);
  const onProgressRef = useRef(onProgress);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

  // Sync playbackRate to video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isExternalUpdate = useRef(false);
  
  // Watch Party
  const { broadcastSync, onSyncRef } = useWatchParty(partyId, !partyId?.includes('-guest'));

  useEffect(() => {
    onSyncRef.current = (msg: WatchPartyMessage) => {
      if (!videoRef.current) return;
      isExternalUpdate.current = true;
      if (msg.type === 'PLAY') { videoRef.current.play(); setIsPlaying(true); }
      else if (msg.type === 'PAUSE') { videoRef.current.pause(); setIsPlaying(false); }
      else if (msg.type === 'SEEK' && msg.currentTime !== undefined) { videoRef.current.currentTime = msg.currentTime; setCurrentTime(msg.currentTime); }
      setTimeout(() => { isExternalUpdate.current = false; }, 50);
    };
  }, [onSyncRef]);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying && !isLocked) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 1500);
    }
  }, [isPlaying, isLocked]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current || isLocked) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      if (!isExternalUpdate.current) broadcastSync(videoRef.current.currentTime, 'PLAY');
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      if (!isExternalUpdate.current) broadcastSync(videoRef.current.currentTime, 'PAUSE');
    }
    resetControlsTimeout();
  }, [isLocked, broadcastSync]);

  const seek = useCallback((amount: number) => {
    if (!videoRef.current || isLocked) return;
    const newTime = videoRef.current.currentTime + amount;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    if (!isExternalUpdate.current) broadcastSync(newTime, 'SEEK');
    resetControlsTimeout();
  }, [isLocked, broadcastSync, resetControlsTimeout]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
        if ((window.screen?.orientation as any)?.lock) {
          try {
            await (window.screen.orientation as any).lock('landscape');
          } catch (e) {
            console.warn('Orientation lock failed:', e);
          }
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        if ((window.screen?.orientation as any)?.unlock) {
          (window.screen.orientation as any).unlock();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed', err);
    }
  }, []);

  // Listen to external fullscreen changes (like Esc key) to unlock orientation
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        if ((window.screen?.orientation as any)?.unlock) {
          (window.screen.orientation as any).unlock();
        }
      } else {
        setIsFullscreen(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    // Auto-fullscreen on mount
    const enterFullscreen = async () => {
      if (containerRef.current && !document.fullscreenElement) {
        try {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
          if ((window.screen?.orientation as any)?.lock) {
            try {
              await (window.screen.orientation as any).lock('landscape');
            } catch (e) {
              console.warn('Orientation lock failed:', e);
            }
          }
        } catch (err) {
          console.warn("Fullscreen auto-play blocked by browser gesture rules.");
        }
      }
    };
    enterFullscreen();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if ([' ', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          togglePlay();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'arrowleft':
          seek(-10);
          break;
        case 'arrowright':
          seek(10);
          break;
        case '<':
        case ',':
          if (e.shiftKey) {
            setPlaybackRate(r => Math.max(0.1, Number((r - 0.1).toFixed(1))));
          }
          break;
        case '>':
        case '.':
          if (e.shiftKey) {
            setPlaybackRate(r => Math.min(4.0, Number((r + 0.1).toFixed(1))));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleFullscreen, seek]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Reset sync tracker when src changes
    lastSyncTime.current = 0;

    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);

      // Seek ONCE after HLS manifest is ready — this is the only correct place
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (startTime && startTime > 0) {
          video.currentTime = startTime;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari): seek after metadata loads
      video.src = src;
      const handleNativeSeek = () => {
        if (startTime && startTime > 0) video.currentTime = startTime;
      };
      video.addEventListener('loadedmetadata', handleNativeSeek, { once: true });
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Report progress every 5 seconds via ref (avoids dependency array churn)
      const now = Math.floor(video.currentTime);
      if (now !== lastSyncTime.current && now % 5 === 0 && now > 0) {
        lastSyncTime.current = now;
        onProgressRef.current?.(video.currentTime, video.duration);
      }
    };
    const handleDurationChange = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      if (hls) hls.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, startTime]); // onProgress intentionally excluded — handled via ref

  const togglePIP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error("PIP failed:", error);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`${styles.netflixContainer} ${!showControls ? styles.hideCursor : ''}`}
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
    >
      <video
        ref={videoRef}
        className={styles.netflixVideo}
        playsInline
        autoPlay={autoPlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      <AnimatePresence>
        {showControls && (
          <motion.div 
            className={styles.netflixOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={togglePlay}
          >
            {/* Top Bar */}
            <div className={styles.netflixTop} onClick={(e) => e.stopPropagation()}>
              <button className={styles.iconBtn} onClick={() => onClose ? onClose(videoRef.current?.currentTime || 0, videoRef.current?.duration || 0) : router.back()}>
                <ChevronLeft size={32} />
              </button>
              <div className={styles.netflixTitleGroup}>
                <span className={styles.netflixMainTitle}>{title}</span>
                <span className={styles.netflixSubTitle}>{subTitle}</span>
              </div>
              <button className={styles.iconBtn} onClick={togglePIP}>
                <PictureInPicture2 size={24} />
              </button>
            </div>

            {/* Center Controls Removed - Moved to Bottom */}

            {/* Bottom Bar */}
            <div className={styles.netflixBottom} onClick={(e) => e.stopPropagation()}>
              <div className={styles.progressSection}>
                <div 
                  className={styles.netflixProgressBar}
                  onPointerDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    const newTime = pos * duration;
                    videoRef.current!.currentTime = newTime;
                    setCurrentTime(newTime); // Update state instantly
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    setHoverProgress(pos * 100);
                  }}
                  onMouseEnter={() => setIsHoveringProgress(true)}
                  onMouseLeave={() => {
                    setHoverProgress(0);
                    setIsHoveringProgress(false);
                  }}
                >
                  {isHoveringProgress && (
                    <div 
                      className={styles.progressTooltip}
                      style={{ left: `${hoverProgress}%` }}
                    >
                      {formatTime((hoverProgress / 100) * duration)}
                    </div>
                  )}
                  <div 
                    className={styles.netflixProgressHover} 
                    style={{ width: `${hoverProgress}%` }}
                  />
                  <div 
                    className={styles.netflixProgressFill} 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  <div 
                    className={styles.netflixProgressHandle}
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className={styles.timeLabel}>
                  {formatTime(duration - currentTime)}
                </div>
              </div>

              <div className={styles.controlsRow}>
                {/* Left side (empty for now, could be volume later) */}
                <div className={styles.controlsLeft} />

                {/* Center side (Play Controls) */}
                <div className={styles.controlsCenter}>
                  <button className={styles.iconBtn} onClick={() => seek(-10)}>
                    <RotateCcw size={32} />
                  </button>
                  <button className={styles.iconBtn} onClick={togglePlay}>
                    {isPlaying ? <Pause size={40} fill="white" /> : <Play size={40} fill="white" />}
                  </button>
                  <button className={styles.iconBtn} onClick={() => seek(10)}>
                    <RotateCw size={32} />
                  </button>
                </div>

                {/* Right side (Actions) */}
                <div className={styles.controlsRight}>
                  <div className={styles.speedMenuContainer}>
                    <button 
                      className={styles.actionBtn} 
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    >
                      <SlidersHorizontal size={20} />
                      <span>Speed ({playbackRate}x)</span>
                    </button>
                    
                    <AnimatePresence>
                      {showSpeedMenu && (
                        <motion.div 
                          className={styles.speedMenu}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.15 }}
                        >
                          {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                            <button 
                              key={speed}
                              className={`${styles.speedOption} ${playbackRate === speed ? styles.activeSpeed : ''}`}
                              onClick={() => {
                                setPlaybackRate(speed);
                                setShowSpeedMenu(false);
                              }}
                            >
                              {speed === 1 ? 'Normal' : `${speed}x`}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button 

                    className={styles.actionBtn} 
                    onClick={() => setShowEpisodeSelector(true)}
                  >
                    <List size={20} />
                    <span>Episodes</span>
                  </button>
                  {onNext && (
                    <button className={styles.actionBtn} onClick={onNext}>
                      <SkipForward size={20} />
                      <span>Next Episode</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Episode Selector Overlay */}
            <AnimatePresence>
              {showEpisodeSelector && (
                <motion.div 
                  className={styles.episodeSelector}
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                  <div className={styles.episodeHeader}>
                    <h3>Episodes</h3>
                    <button onClick={() => setShowEpisodeSelector(false)}>✕</button>
                  </div>
                  <div className={styles.episodeScroll}>
                    {episodes?.map((ep) => (
                      <div 
                        key={ep.id} 
                        className={`${styles.episodeItem} ${currentEpisode === ep.episode_number ? styles.activeEpisode : ''}`}
                        onClick={() => {
                          if (onEpisodeSelect) onEpisodeSelect(ep.episode_number.toString());
                          setShowEpisodeSelector(false);
                        }}
                      >
                        <div className={styles.episodeThumb}>
                          <img 
                            src={tmdb.getEpisodeImage(ep.still_path) || (poster || '')} 
                            alt={ep.name} 
                          />
                          <div className={styles.epPlayOverlay}>
                            <Play size={20} fill="white" />
                          </div>
                        </div>
                        <div className={styles.episodeText}>
                          <div className={styles.epNumTitle}>
                            <span>{ep.episode_number}. </span>
                            {ep.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;
