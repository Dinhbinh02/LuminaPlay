'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Zap, ChevronRight, ChevronLeft, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, RectangleHorizontal, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import styles from './VideoPlayer.module.css';
import { AnimatePresence, motion } from 'framer-motion';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  startTime?: number;
  autoPlay?: boolean;
  onProgress?: (currentTime: number, duration: number) => void;
  onCapture?: (thumbnail: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onTheaterToggle?: () => void;
  isTheaterMode?: boolean;
}

export interface VideoPlayerRef {
  captureThumbnail: () => string | null;
  seek: (amount: number) => void;
  changePlaybackRate: (delta: number) => void;
  getPlaybackRate: () => number;
  togglePlay: (showIndicatorFlag?: boolean) => void;
  toggleFullscreen: () => void;
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

const VideoPlayer = React.forwardRef<VideoPlayerRef, VideoPlayerProps>(({ src, poster, startTime, autoPlay = false, onProgress, onCapture, onPrev, onNext, onTheaterToggle, isTheaterMode }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  const [indicator, setIndicator] = useState<{ type: 'speed' | 'seek' | 'play' | 'pause', value: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [hoverWidth, setHoverWidth] = useState(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const loadedSrcRef = useRef<string>('');
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const indicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const cumulativeSeekRef = useRef(0);
  const cumulativeSeekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const dragStartX = useRef(0);
  const dragStartTime = useRef(0);

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

  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    if (!showControls) {
      setShowSpeedMenu(false);
    }
  }, [showControls]);

  const isPlayingRef = useRef(isPlaying);
  const showSpeedMenuRef = useRef(showSpeedMenu);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    showSpeedMenuRef.current = showSpeedMenu;
  }, [showSpeedMenu]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Auto-hide controls effect
  useEffect(() => {
    if (showControls && isPlaying && !showSpeedMenu) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying, showSpeedMenu, lastActivity]);

  const showIndicator = (type: 'speed' | 'seek' | 'play' | 'pause', value: string) => {
    setIndicator({ type, value });
    if (indicatorTimeoutRef.current) clearTimeout(indicatorTimeoutRef.current);
    indicatorTimeoutRef.current = setTimeout(() => {
      setIndicator(null);
    }, 1000);
  };

  const togglePlay = (showIndicatorFlag = true) => {
    if (!videoRef.current) return;
    if (isPlayingRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      if (showIndicatorFlag) showIndicator('pause', '');
    } else {
      videoRef.current.play().catch(e => {
        if (e.name !== 'AbortError') console.error(e);
      });
      setIsPlaying(true);
      if (showIndicatorFlag) showIndicator('play', '');
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current || !videoRef.current) return;
    const container = containerRef.current;
    const video = videoRef.current;
    
    const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);

    if (!isFs) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((video as any).webkitEnterFullscreen) {
        // Essential fallback for iPhone/iOS
        (video as any).webkitEnterFullscreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  const handleGlobalMouseMove = () => {
    if (!showControls) setShowControls(true);
    setLastActivity(Date.now());
  };

  React.useImperativeHandle(ref, () => ({
    captureThumbnail: () => {
      const video = videoRef.current;
      if (!video) return null;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', 0.7);
        }
      } catch (e) {
        console.error("Failed to capture thumbnail", e);
      }
      return null;
    },
    seek: (amount: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime += amount;
        
        // Accumulate seek amount
        cumulativeSeekRef.current += amount;
        const total = cumulativeSeekRef.current;
        
        // Show indicator with accumulated amount
        showIndicator('seek', `${total > 0 ? '+' : ''}${total}s`);
        
        // Reset cumulative total after 1 second of inactivity
        if (cumulativeSeekTimeoutRef.current) clearTimeout(cumulativeSeekTimeoutRef.current);
        cumulativeSeekTimeoutRef.current = setTimeout(() => {
          cumulativeSeekRef.current = 0;
        }, 1000);
      }
    },
    changePlaybackRate: (delta: number) => {
      if (videoRef.current) {
        const newRate = Math.round((videoRef.current.playbackRate + delta) * 10) / 10;
        const finalRate = Math.max(0.1, Math.min(4, newRate));
        videoRef.current.playbackRate = finalRate;
        setPlaybackRate(finalRate);
        showIndicator('speed', `${finalRate}x`);
      }
    },
    getPlaybackRate: () => {
      return videoRef.current?.playbackRate || 1;
    },
    togglePlay: (showIndicatorFlag = true) => {
      togglePlay(showIndicatorFlag);
    },
    toggleFullscreen: () => {
      toggleFullscreen();
    }
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Reset source ref for new src
    loadedSrcRef.current = src;

    let hls: Hls | null = null;

    const seekWhenReady = (targetTime: number, maxRetries = 20) => {
      if (targetTime <= 0) return;
      let attempts = 0;
      const trySeek = () => {
        attempts++;
        if (video.seekable && video.seekable.length > 0 && video.seekable.end(0) >= targetTime) {
          video.currentTime = targetTime;
        } else if (attempts < maxRetries) {
          setTimeout(trySeek, 300);
        }
      };
      trySeek();
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      const handleCanPlay = () => {
        seekWhenReady(startTime || 0);
        if (isPlaying) {
          video.play().catch(e => {
            if (e.name !== 'AbortError') console.log('Autoplay blocked', e);
          });
        }
      };
      video.addEventListener('canplay', handleCanPlay, { once: true });
    } else if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      setHlsInstance(hls);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        seekWhenReady(startTime || 0);
        if (isPlaying) {
          video.play().catch(e => {
            if (e.name !== 'AbortError') console.log('Autoplay blocked', e);
          });
        }
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
        setHlsInstance(null);
      }
    };
  }, [src]); // Only re-run when src changes

  // Handle play/pause sync with state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      if (video.paused) {
        video.play().catch(e => {
          if (e.name !== 'AbortError') console.log('Play error', e);
        });
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (isDragging || isSeeking) return;
      setCurrentTime(video.currentTime);
      if (onProgress && video.duration) {
        onProgress(video.currentTime, video.duration);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleSeeked = () => {
      setIsSeeking(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', handleSeeked);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [onProgress]);

  // Removed togglePlay from here as it is hoisted
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    setIsSeeking(true);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pos = x / rect.width;
    setHoverTime(pos * duration);
    setHoverX(x);
    setHoverWidth(rect.width);
  };

  // Removed toggleFullscreen from here as it is hoisted
  const handleVolumeChange = (e: React.FormEvent<HTMLInputElement>) => {
    const val = parseFloat(e.currentTarget.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
    }
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    dragStartX.current = e.touches[0].clientX;
    dragStartTime.current = videoRef.current?.currentTime || 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1 || !videoRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - dragStartX.current;
    
    if (!isDragging && Math.abs(deltaX) > 10) {
      setIsDragging(true);
      setShowControls(true);
    }

    if (isDragging) {
      // Sensitivity: 1.5px = 1 second of video
      const sensitivity = 0.8; 
      const seekAmount = deltaX * sensitivity;
      let newTime = dragStartTime.current + seekAmount;
      newTime = Math.max(0, Math.min(newTime, duration));
      
      setDragTime(newTime);
      setHoverTime(newTime);
      
      if (progressContainerRef.current) {
        const rect = progressContainerRef.current.getBoundingClientRect();
        setHoverWidth(rect.width);
        setHoverX((newTime / duration) * rect.width);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isDragging && dragTime !== null) {
      if (videoRef.current) {
        setIsSeeking(true);
        videoRef.current.currentTime = dragTime;
        setCurrentTime(dragTime);
      }
      // Briefly keep isDragging true to prevent accidental click-to-pause
      setTimeout(() => setIsDragging(false), 50);
    } else {
      setIsDragging(false);
    }
    setDragTime(null);
    setHoverTime(null);
  };

  const handleSpeedChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);

      if (!showSpeedMenu) {
        const displayRate = rate.toFixed(rate % 1 === 0 ? 1 : 2);
        showIndicator('speed', `${displayRate}x`);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${isTheaterMode ? styles.theaterContainer : ''} ${!showControls && isPlaying ? styles.hideCursor : ''}`}
      onMouseMove={handleGlobalMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <AnimatePresence>
        {indicator && indicator.type === 'speed' && (
          <motion.div
            initial={{ opacity: 0, x: '-50%' }}
            animate={{ opacity: 1, x: '-50%' }}
            exit={{ opacity: 0, x: '-50%' }}
            className={styles.topIndicator}
          >
            {indicator.value}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {indicator && indicator.type === 'seek' && (
          <motion.div
            key={indicator.type + (indicator.value.startsWith('-') ? 'left' : 'right')}
            initial={{ opacity: 0, scale: 0.8, y: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 1.2, y: '-50%' }}
            transition={{ duration: 0.2 }}
            className={indicator.value.startsWith('-') ? styles.leftIndicator : styles.rightIndicator}
          >
            <div className={styles.sideIndicatorCircle}>
              <div className={styles.arrowGroup}>
                {indicator.value.startsWith('-') ? (
                  <>
                    <ChevronLeft size={32} />
                    <ChevronLeft size={32} />
                    <ChevronLeft size={32} />
                  </>
                ) : (
                  <>
                    <ChevronRight size={32} />
                    <ChevronRight size={32} />
                    <ChevronRight size={32} />
                  </>
                )}
              </div>
              <span className={styles.indicatorText}>
                {indicator.value.replace('s', '')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {indicator && (indicator.type === 'play' || indicator.type === 'pause') && (
          <motion.div
            key={indicator.type}
            initial={{ opacity: 0, scale: 0.5, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 1.2, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.3 }}
            className={styles.centerIndicator}
          >
            {indicator.type === 'play' && <Play fill="white" size={40} />}
            {indicator.type === 'pause' && <Pause fill="white" size={40} />}
          </motion.div>
        )}
      </AnimatePresence>

      {!isPlaying && !videoRef.current?.currentTime && (
        <div className={styles.posterOverlay} onClick={() => togglePlay(false)}>
          {poster && (
            <Image
              src={poster}
              alt="Movie Poster"
              fill
              className={styles.posterImg}
              priority
              quality={50}
              sizes="100vw"
            />
          )}
          <div className={styles.overlayColor} />
          <button className={styles.playBtn}>
            <div className={styles.playIconWrapper}>
              <Play size={40} fill="white" color="white" />
            </div>
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        className={styles.video}
        playsInline
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {isPlaying || (videoRef.current && videoRef.current.currentTime > 0) ? (
        <div
          className={`${styles.controls} ${showControls ? styles.controlsActive : ''}`}
          onClick={() => !isDragging && togglePlay()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className={styles.bottomControls} 
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <div
              ref={progressContainerRef}
              className={styles.progressContainer}
              onClick={handleProgressClick}
              onMouseMove={handleProgressHover}
              onMouseLeave={() => setHoverTime(null)}
            >
              <div
                className={styles.progressBar}
                style={{ width: `${((dragTime ?? currentTime) / duration) * 100}%` }}
              />
              {hoverTime !== null && (
                <>
                  <div
                    className={styles.progressHover}
                    style={{ width: `${(hoverTime / duration) * 100}%` }}
                  />
                  <div
                    className={styles.previewTooltip}
                    style={{ left: `${Math.max(35, Math.min(hoverWidth - 35, hoverX))}px` }}
                  >
                    <span>{formatTime(hoverTime)}</span>
                  </div>
                </>
              )}
            </div>

            <div className={styles.controlButtons}>
              <div className={styles.leftBtns}>
                {onPrev && (
                  <button className={styles.btn} onClick={onPrev} title="Previous episode">
                    <SkipBack size={20} fill="white" />
                  </button>
                )}
                <button className={styles.btn} onClick={() => togglePlay()}>
                  {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                </button>
                {onNext && (
                  <button className={styles.btn} onClick={onNext} title="Next episode">
                    <SkipForward size={20} fill="white" />
                  </button>
                )}

                <div className={styles.volumeContainer}>
                  <button className={styles.btn} onClick={() => setIsMuted(!isMuted)}>
                    {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    onInput={handleVolumeChange}
                    onClick={(e) => e.stopPropagation()}
                    className={styles.volumeSlider}
                  />
                </div>

                <div className={styles.timeDisplay}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className={styles.rightBtns}>
                <div className={styles.speedWrapper} ref={speedMenuRef}>
                  {showSpeedMenu && (
                    <div className={styles.speedMenu}>
                      <div className={styles.speedCurrent}>
                        {playbackRate.toFixed(playbackRate % 1 === 0 ? 1 : 2)}x
                      </div>

                      <div className={styles.speedSliderWrapper}>
                        <button
                          className={styles.speedAdjustBtn}
                          onClick={() => handleSpeedChange(Math.max(0.1, playbackRate - 0.05))}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="range"
                          min="0.1"
                          max="4"
                          step="0.05"
                          value={playbackRate}
                          onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                          className={styles.speedSlider}
                        />
                        <button
                          className={styles.speedAdjustBtn}
                          onClick={() => handleSpeedChange(Math.min(4, playbackRate + 0.05))}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className={styles.speedPresets}>
                        {[1.0, 1.25, 1.5, 1.75, 2.0, 3.0].map((rate) => (
                          <button
                            key={rate}
                            className={`${styles.speedPresetBtn} ${playbackRate === rate ? styles.active : ''}`}
                            onClick={() => {
                              handleSpeedChange(rate);
                              setShowSpeedMenu(false);
                            }}
                          >
                            {rate.toFixed(rate === 1.0 || rate === 2.0 || rate === 3.0 ? 1 : 2)}x
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    className={`${styles.btn} ${showSpeedMenu ? styles.activeBtn : ''}`}
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  >
                    <Zap size={24} />
                  </button>
                </div>
                {onTheaterToggle && (
                  <button className={`${styles.btn} ${styles.theaterBtn}`} onClick={onTheaterToggle} title="Theater mode (t)">
                    <RectangleHorizontal size={22} color={isTheaterMode ? "#ef4444" : "white"} />
                  </button>
                )}
                <button className={styles.btn} onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
);

export default VideoPlayer;
