'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Play, Pause, RotateCcw, RotateCw, ChevronLeft, SlidersHorizontal, List, SkipForward, PictureInPicture2, Maximize, Minimize, Volume2, VolumeX, Settings, Layers, Lock, Unlock, Cast, Scan, Mic, MicOff, Gauge } from 'lucide-react';
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
  onProgress?: (currentTime: number, duration: number, force?: boolean) => void;
  onNext?: () => void;
  onClose?: (currentTime: number, duration: number) => void;
  partyId?: string;
  episodes?: any[];
  currentEpisode?: number;
  onEpisodeSelect?: (episodeNum: string) => void;
}

const RemoteAudio = ({ stream }: { stream: MediaStream }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);
  return <audio ref={audioRef} autoPlay />;
};

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
  const [isDragging, setIsDragging] = useState(false);
  const lastSyncTime = useRef(0);
  const dragStartX = useRef(0);
  const dragStartTime = useRef(0);
  const speedMenuRef = useRef<HTMLDivElement>(null);
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
  const { broadcastSync, onSyncRef, isMicOn, toggleMic, remoteStreams } = useWatchParty(partyId, !partyId?.includes('-guest'));

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
    // Auto-hide if playing, not locked, and NOT dragging
    if (isPlaying && !isLocked && !isDragging) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
    }
  }, [isPlaying, isLocked, isDragging]);

  // Trigger timeout when states change
  useEffect(() => {
    resetControlsTimeout();
  }, [isPlaying, isFullscreen, isLocked, resetControlsTimeout]);

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
    if (!containerRef.current || !videoRef.current) return;

    // Check for iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      if ((videoRef.current as any).webkitEnterFullscreen) {
        (videoRef.current as any).webkitEnterFullscreen();
        return;
      }
    }

    try {
      if (!document.fullscreenElement) {
        const req = containerRef.current.requestFullscreen ||
          (containerRef.current as any).webkitRequestFullscreen ||
          (containerRef.current as any).mozRequestFullScreen ||
          (containerRef.current as any).msRequestFullscreen;

        if (req) {
          await req.call(containerRef.current);
          setIsFullscreen(true);
          if ((window.screen?.orientation as any)?.lock) {
            try {
              await (window.screen.orientation as any).lock('landscape');
            } catch (e) {
              console.warn('Orientation lock failed:', e);
            }
          }
        }
      } else {
        const exit = document.exitFullscreen ||
          (document as any).webkitExitFullscreen ||
          (document as any).mozCancelFullScreen ||
          (document as any).msExitFullscreen;

        if (exit) {
          await exit.call(document);
          setIsFullscreen(false);
          if ((window.screen?.orientation as any)?.unlock) {
            (window.screen.orientation as any).unlock();
          }
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

  // Click outside listener for speed menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setShowSpeedMenu(false);
      }
    };

    if (showSpeedMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSpeedMenu]);

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
      // Force one last sync on unmount/source change
      if (video.currentTime > 0) {
        onProgressRef.current?.(video.currentTime, video.duration, true);
      }
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
      onPointerDown={(e) => {
        resetControlsTimeout();
        // Don't seek if clicking a button
        if ((e.target as HTMLElement).closest('button')) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const isBottomThird = e.clientY > rect.top + (rect.height * 2 / 3);

        if (isBottomThird) {
          setIsDragging(true);
          dragStartX.current = e.clientX;
          dragStartTime.current = videoRef.current?.currentTime || 0;
          e.currentTarget.setPointerCapture(e.pointerId);
        }
      }}
      onPointerMove={(e) => {
        if (isDragging && duration) {
          const deltaX = e.clientX - dragStartX.current;
          const containerWidth = containerRef.current?.clientWidth || window.innerWidth;

          // Relative seek: full screen drag = full duration
          const deltaTime = (deltaX / containerWidth) * duration;
          const newTime = Math.max(0, Math.min(duration, dragStartTime.current + deltaTime));

          if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
          }
          resetControlsTimeout(); // Keep controls visible during drag
        } else {
          resetControlsTimeout();
        }
      }}
      onPointerUp={(e) => {
        if (isDragging) {
          setIsDragging(false);
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
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

      {/* Voice Chat Streams */}
      {Object.entries(remoteStreams).map(([peerId, stream]) => (
        <RemoteAudio key={peerId} stream={stream} />
      ))}

      <AnimatePresence>
        {showControls && (
          <motion.div
            className={styles.netflixOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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

            {/* Center Controls Removed */}

            {/* Bottom Bar */}
            <div
              className={styles.netflixBottom}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.progressSection}>
                <div className={styles.timeLabel}>
                  {formatTime(currentTime)}
                </div>
                <div
                  className={styles.netflixProgressBar}
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
                  {(isHoveringProgress || isDragging) && (
                    <div
                      className={styles.progressTooltip}
                      style={{ left: `${isDragging ? (currentTime / duration) * 100 : hoverProgress}%` }}
                    >
                      {formatTime(isDragging ? currentTime : (hoverProgress / 100) * duration)}
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
                    style={{
                      left: `${(currentTime / duration) * 100}%`,
                      opacity: isDragging ? 1 : undefined,
                      transform: isDragging ? 'translate(-50%, -50%) scale(1.5)' : undefined
                    }}
                  />
                </div>
                <div className={styles.timeLabel}>
                  {formatTime(duration)}
                </div>
              </div>

              <div className={styles.controlsRow}>
                {/* Left side (Play Controls) */}
                <div className={styles.controlsLeft}>
                  <button className={styles.iconBtn} onClick={() => seek(-10)}>
                    <RotateCcw size={28} />
                  </button>
                  <button className={styles.iconBtn} onClick={togglePlay}>
                    {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
                  </button>
                  <button className={styles.iconBtn} onClick={() => seek(10)}>
                    <RotateCw size={28} />
                  </button>
                  {onNext && (
                    <button className={styles.iconBtn} onClick={onNext}>
                      <SkipForward size={24} />
                    </button>
                  )}
                </div>

                {/* Center side (Empty) */}
                <div className={styles.controlsCenter}>
                </div>

                {/* Right side (Actions) */}
                <div className={styles.controlsRight}>
                  {partyId && (
                    <button
                      className={`${styles.actionBtn} ${isMicOn ? styles.activeAction : ''}`}
                      onClick={toggleMic}
                    >
                      {isMicOn ? <Mic size={24} color="#e50914" /> : <MicOff size={24} />}
                      <span className={styles.btnLabel}>{isMicOn ? 'Mic On' : 'Mic Off'}</span>
                    </button>
                  )}

                  <div className={styles.speedMenuContainer} ref={speedMenuRef}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    >
                      <Gauge size={24} />
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

                  {episodes && episodes.length > 1 && (
                    <button
                      className={styles.actionBtn}
                      onClick={() => setShowEpisodeSelector(true)}
                    >
                      <List size={24} />
                      { }
                    </button>
                  )}

                  <button
                    className={`${styles.actionBtn} ${isFullscreen ? styles.activeAction : ''}`}
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize size={24} color="#e50914" />
                    ) : (
                      <Maximize size={24} />
                    )}
                    {/* Label removed for minimalism */}
                  </button>

                  {/* onNext moved to controlsLeft for better grouping */}
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
                    <button
                      className={styles.closeSelectorBtn}
                      onClick={() => setShowEpisodeSelector(false)}
                    >
                      ✕
                    </button>
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
                          <div className={styles.epNumber}>Episode {ep.episode_number}</div>
                          <div className={styles.epTitle}>{ep.name}</div>
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
