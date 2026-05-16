'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Play, Pause, RotateCcw, RotateCw, ChevronLeft, SlidersHorizontal, List, SkipForward, PictureInPicture2, Maximize, Minimize, Volume1, Volume2, VolumeX, Settings, Layers, Lock, Unlock, Cast, Scan, Mic, MicOff, Gauge, Loader2, Globe } from 'lucide-react';
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
  servers?: { id: string, name: string }[];
  currentServerId?: string;
  onServerSelect?: (serverId: string) => void;
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
  onProgress, onNext, onClose, partyId, episodes, currentEpisode, onEpisodeSelect,
  servers, currentServerId, onServerSelect
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
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0);
  const [tooltipTime, setTooltipTime] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const lastSyncTime = useRef(0);
  const dragStartX = useRef(0);
  const dragStartTime = useRef(0);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPointerDown = useRef(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const serverMenuRef = useRef<HTMLDivElement>(null);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const onProgressRef = useRef(onProgress);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

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
    if (onSyncRef) {
      onSyncRef.current = (msg: WatchPartyMessage) => {
        if (!videoRef.current) return;
        isExternalUpdate.current = true;
        if (msg.type === 'PLAY') { videoRef.current.play(); setIsPlaying(true); }
        else if (msg.type === 'PAUSE') { videoRef.current.pause(); setIsPlaying(false); }
        else if (msg.type === 'SEEK' && msg.currentTime !== undefined) { videoRef.current.currentTime = msg.currentTime; setCurrentTime(msg.currentTime); }
        setTimeout(() => { isExternalUpdate.current = false; }, 50);
      };
    }
  }, [onSyncRef]);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying && !isLocked && !isDragging && !showServerMenu && !showSpeedMenu) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying, isLocked, isDragging, showServerMenu, showSpeedMenu]);

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
  }, [isLocked, broadcastSync, resetControlsTimeout]);

  const seek = useCallback((amount: number, suppressUI: boolean = false) => {
    if (!videoRef.current || isLocked) return;
    const newTime = videoRef.current.currentTime + amount;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    if (!isExternalUpdate.current) broadcastSync(newTime, 'SEEK');
    if (!suppressUI) resetControlsTimeout();
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Keyboard shortcuts
  useEffect(() => {
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
          seek(-10, true);
          break;
        case 'arrowright':
          seek(10, true);
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
    const handleClickOutside = (event: MouseEvent) => {
      if (serverMenuRef.current && !serverMenuRef.current.contains(event.target as Node)) {
        setShowServerMenu(false);
      }
    };

    if (showServerMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showServerMenu]);

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

    // Only show loading for the very first load of the source
    setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handleCanPlay);

    return () => {
      if (video.currentTime > 0) {
        onProgressRef.current?.(video.currentTime, video.duration, true);
      }
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handleCanPlay);
      if (hls) hls.destroy();
    };
  }, [src, startTime]);

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

  const isClickOnBlackBars = (e: React.PointerEvent) => {
    if (!videoRef.current || !containerRef.current || !videoRef.current.videoWidth) return false;

    const video = videoRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    const containerRatio = rect.width / rect.height;
    const videoRatio = video.videoWidth / video.videoHeight;

    let videoDisplayWidth, videoDisplayHeight;
    if (containerRatio > videoRatio) {
      videoDisplayHeight = rect.height;
      videoDisplayWidth = videoDisplayHeight * videoRatio;
    } else {
      videoDisplayWidth = rect.width;
      videoDisplayHeight = videoDisplayWidth / videoRatio;
    }

    const horizontalPadding = (rect.width - videoDisplayWidth) / 2;
    const verticalPadding = (rect.height - videoDisplayHeight) / 2;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    return (
      clickX < horizontalPadding ||
      clickX > (rect.width - horizontalPadding) ||
      clickY < verticalPadding ||
      clickY > (rect.height - verticalPadding)
    );
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.playerContainer} ${!showControls ? styles.hideCursor : ''}`}
      onMouseMove={(e) => {
        if (window.matchMedia('(pointer: fine)').matches) {
          resetControlsTimeout();
        }
      }}
      onMouseLeave={() => {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        if (isPlaying) {
          setShowControls(false);
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
        }
      }}
      onPointerDown={(e) => {
        const isMobile = window.matchMedia('(pointer: coarse)').matches;

        // Don't interfere with button clicks
        if ((e.target as HTMLElement).closest('button')) return;

        if (isMobile) {
          if (!showControls) {
            // Controls hidden → show them
            resetControlsTimeout();
            return;
          } else if (isPlaying) {
            // Controls visible + playing → hide controls
            setShowControls(false);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            return;
          } else {
            // Controls visible + paused → do nothing, keep controls visible
            return;
          }
        }

        // Desktop: handle drag-to-seek on bottom third
        const rect = e.currentTarget.getBoundingClientRect();
        const isBottomThird = e.clientY > rect.top + (rect.height * 2 / 3);

        if (isBottomThird) {
          isPointerDown.current = true;
          dragStartX.current = e.clientX;
          dragStartTime.current = videoRef.current?.currentTime || 0;

          if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);

          holdTimeoutRef.current = setTimeout(() => {
            if (isPointerDown.current) {
              setIsDragging(true);
              e.currentTarget.setPointerCapture(e.pointerId);
            }
          }, 400);
        }
      }}
      onPointerMove={(e) => {
        if (!isPointerDown.current) {
          resetControlsTimeout();
          return;
        }

        if (!isDragging && duration) {
          const deltaX = Math.abs(e.clientX - dragStartX.current);
          if (deltaX > 10) { // 10px movement threshold
            if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
            setIsDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
          }
        }

        if (isDragging && duration) {
          const deltaX = e.clientX - dragStartX.current;
          const containerWidth = containerRef.current?.clientWidth || window.innerWidth;

          // Relative seek: full screen drag = full duration
          const deltaTime = (deltaX / containerWidth) * duration;
          const newTime = Math.max(0, Math.min(duration, dragStartTime.current + deltaTime));

          if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
            setTooltipTime(newTime);
          }
          resetControlsTimeout(); // Keep controls visible during drag
        } else {
          resetControlsTimeout();
        }
      }}
      onPointerUp={(e) => {
        isPointerDown.current = false;
        if (holdTimeoutRef.current) {
          clearTimeout(holdTimeoutRef.current);
          holdTimeoutRef.current = null;
        }

        if (isDragging) {
          setIsDragging(false);
          setTooltipTime(null);
          e.currentTarget.releasePointerCapture(e.pointerId);
          if (videoRef.current && !isExternalUpdate.current) {
            broadcastSync(videoRef.current.currentTime, 'SEEK');
          }
        }
      }}
      onPointerCancel={(e) => {
        isPointerDown.current = false;
        setTooltipTime(null);
        if (holdTimeoutRef.current) {
          clearTimeout(holdTimeoutRef.current);
          holdTimeoutRef.current = null;
        }
        if (isDragging) {
          setIsDragging(false);
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
    >
      <video
        ref={videoRef}
        className={styles.playerVideo}
        playsInline
        autoPlay={autoPlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={(e) => {
          const isDesktop = window.matchMedia('(pointer: fine)').matches;
          if (!isDesktop) return;

          if (isClickOnBlackBars(e as any)) {
            setShowControls(false);
            if (controlsTimeoutRef.current) {
              clearTimeout(controlsTimeoutRef.current);
            }
          } else {
            togglePlay();
            resetControlsTimeout();
          }
        }}
      />

      {/* Voice Chat Streams */}
      {remoteStreams && Object.entries(remoteStreams).map(([peerId, stream]) => (
        <RemoteAudio key={peerId} stream={stream} />
      ))}

      {isLoading && (
        <div className={styles.loaderContainer}>
          <Loader2 className={styles.loaderIcon} size={64} />
        </div>
      )}

      <AnimatePresence>
        {showControls && !isLoading && (
          <motion.div
            className={styles.playerOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Top Bar */}
            <div className={styles.playerTop} onClick={(e) => e.stopPropagation()}>
              <button className={styles.iconBtn} onClick={() => onClose ? onClose(videoRef.current?.currentTime || 0, videoRef.current?.duration || 0) : router.back()}>
                <ChevronLeft size={32} />
              </button>
              <div className={styles.playerTitleGroup}>
                {subTitle && <span className={styles.playerSubTitle}>{subTitle}</span>}
              </div>

              {servers && servers.length > 0 && (
                <div className={styles.serverTopContainer} ref={serverMenuRef}>
                  <button
                    className={styles.serverPillBtn}
                    onClick={() => setShowServerMenu(!showServerMenu)}
                  >
                    <Globe size={20} />
                    <span>{servers.find(s => s.id === currentServerId)?.name.split(' ')[0] || 'Server'}</span>
                  </button>

                  <AnimatePresence>
                    {showServerMenu && (
                      <motion.div
                        className={styles.serverMenuTop}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                      >
                        {servers.map(server => (
                          <button
                            key={server.id}
                            className={`${styles.serverOption} ${currentServerId === server.id ? styles.activeServer : ''}`}
                            onClick={() => {
                              onServerSelect?.(server.id);
                              setShowServerMenu(false);
                            }}
                          >
                            {server.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            <div
              className={styles.playerBottom}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div
                className={styles.playerProgressBar}
                onPointerMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  const time = pos * duration;
                  setHoverProgress(pos * 100);
                  setTooltipTime(time);
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (!videoRef.current || !duration) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  const newTime = Math.max(0, Math.min(duration, pos * duration));
                  videoRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                  setTooltipTime(newTime);
                  if (!isExternalUpdate.current) broadcastSync(newTime, 'SEEK');
                  resetControlsTimeout();
                }}
                onPointerEnter={() => setIsHoveringProgress(true)}
                onPointerLeave={() => {
                  setIsHoveringProgress(false);
                  if (!isDragging) setTooltipTime(null);
                }}
                onPointerUp={() => {
                  setIsHoveringProgress(false);
                  setTooltipTime(null);
                }}
                onPointerCancel={() => {
                  setIsHoveringProgress(false);
                  setTooltipTime(null);
                }}
              >
                {tooltipTime !== null && (
                  <div
                    className={styles.progressTooltip}
                    style={{ left: isDragging ? `${(currentTime / duration) * 100}%` : `${(tooltipTime / duration) * 100}%` }}
                  >
                    {formatTime(tooltipTime)}
                  </div>
                )}
                <div
                  className={styles.playerProgressHover}
                  style={{ width: `${hoverProgress}%` }}
                />
                <div
                  className={styles.playerProgressFill}
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                <div
                  className={styles.playerProgressHandle}
                  style={{
                    left: `${(currentTime / duration) * 100}%`,
                    opacity: isDragging ? 1 : undefined,
                    transform: isDragging ? 'translate(-50%, -50%) scale(1.5)' : undefined
                  }}
                />
              </div>

              <div className={styles.controlsRow}>
                {/* Left side (Play Controls) */}
                <div className={styles.controlsLeft}>
                  <button className={styles.iconBtn} onClick={togglePlay}>
                    {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
                  </button>
                  <button className={styles.iconBtn} onClick={() => seek(-10)}>
                    <div className={styles.seekIconContainer}>
                      <RotateCcw size={28} />
                      <span className={styles.seekNumber}>10</span>
                    </div>
                  </button>
                  <button className={styles.iconBtn} onClick={() => seek(10)}>
                    <div className={styles.seekIconContainer}>
                      <RotateCw size={28} />
                      <span className={styles.seekNumber}>10</span>
                    </div>
                  </button>

                  <div className={styles.timeDisplay}>
                    <span className={styles.currentTime}>{formatTime(currentTime)}</span>
                    <span className={styles.timeDivider}>/</span>
                    <span className={styles.totalTime}>{formatTime(duration)}</span>
                  </div>
                  <div className={styles.volumeContainer} onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
                    <button className={styles.iconBtn} onClick={() => setIsMuted(!isMuted)}>
                      {isMuted || volume === 0 ? <VolumeX size={24} /> : volume < 0.5 ? <Volume1 size={24} /> : <Volume2 size={24} />}
                    </button>
                    <AnimatePresence>
                      {showVolumeSlider && (
                        <motion.div
                          className={styles.volumeSliderWrapper}
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 80, opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                        >
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setVolume(val);
                              setIsMuted(val === 0);
                            }}
                            className={styles.volumeSlider}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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

                  {onNext && (
                    <button
                      className={styles.actionBtn}
                      onClick={onNext}
                    >
                      <SkipForward size={24} />
                    </button>
                  )}

                  <button
                    className={styles.actionBtn}
                    onClick={togglePIP}
                  >
                    <PictureInPicture2 size={24} />
                  </button>

                  <button
                    className={`${styles.actionBtn} ${isFullscreen ? styles.activeAction : ''}`}
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize size={24} color="#e50914" />
                    ) : (
                      <Maximize size={24} />
                    )}
                  </button>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { VideoPlayer };
export default VideoPlayer;
