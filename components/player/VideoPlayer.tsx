'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play } from 'lucide-react';
import Image from 'next/image';
import styles from './VideoPlayer.module.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  startTime?: number;
  autoPlay?: boolean;
  onProgress?: (currentTime: number, duration: number) => void;
  onCapture?: (thumbnail: string) => void;
}

export interface VideoPlayerRef {
  captureThumbnail: () => string | null;
}

const VideoPlayer = React.forwardRef<VideoPlayerRef, VideoPlayerProps>(({ src, poster, startTime, autoPlay = false, onProgress, onCapture }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);

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
    }
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    if (hlsInstance) {
      hlsInstance.destroy();
    }

    // Simple seek logic from old version
    const seekWhenReady = (targetTime: number, maxRetries = 30) => {
      if (targetTime <= 0) return;
      let attempts = 0;
      
      const trySeek = () => {
        attempts++;
        
        // Check if seekable ranges are available and contain targetTime
        const isSeekable = video.seekable && video.seekable.length > 0;
        const canSeekNow = isSeekable && video.seekable.end(0) >= targetTime;
        
        if (canSeekNow) {
          video.currentTime = targetTime;
          console.log(`Seeked to ${targetTime} after ${attempts} attempts`);
        } else if (attempts < maxRetries) {
          setTimeout(trySeek, 300);
        }
      };
      
      // Also listen for loadedmetadata as a primary trigger
      video.addEventListener('loadedmetadata', trySeek, { once: true });
      trySeek();
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari/iOS)
      video.src = src;
      video.addEventListener('canplay', () => {
        seekWhenReady(startTime || 0);
        video.play().catch(e => {
          console.log('Autoplay blocked', e);
          setIsPlaying(false);
        });
      }, { once: true });
    } else if (Hls.isSupported()) {
      // Simple Hls.js logic
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      setHlsInstance(hls);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        seekWhenReady(startTime || 0);
        video.play().catch(e => {
          console.log('Autoplay blocked', e);
          setIsPlaying(false);
        });
      });
      
      return () => {
        hls.destroy();
      };
    }
  }, [src, isPlaying, startTime]);

  // Handle progress for history saving
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (onProgress && video.duration) {
        onProgress(video.currentTime, video.duration);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [onProgress]);

  const handleStartPlay = () => {
    setIsPlaying(true);
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video !== document.pictureInPictureElement) {
        await video.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    } catch (e) {
      console.error("PiP failed", e);
    }
  };

  const isPiPSupported = typeof document !== 'undefined' && !!document.pictureInPictureEnabled;

  // Auto PiP on tab switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.visibilityState === 'hidden') {
        if (isPlaying && !document.pictureInPictureElement) {
          video.requestPictureInPicture().catch(e => {
            console.log('Auto-PiP blocked or failed', e);
          });
        }
      } else if (document.visibilityState === 'visible') {
        // Exit PiP if any element is in PiP mode when we return
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture().catch(e => {
            console.log('Exit PiP failed', e);
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  // Handle auto PiP attribute
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Set attribute directly to avoid TS error
      (video as any).autoPictureInPicture = true;
    }
  }, []);

  return (
    <div className={styles.container}>
      {!isPlaying && (
        <div className={styles.posterOverlay} onClick={handleStartPlay}>
          {poster && (
            <Image 
              src={poster} 
              alt="Movie Poster" 
              fill
              className={styles.posterImg}
              priority
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
        className={`${styles.video} ${!isPlaying ? styles.hidden : ''}`} 
        controls={isPlaying}
        playsInline
        crossOrigin="anonymous"
      />
    </div>
  );
}
);

export default VideoPlayer;
