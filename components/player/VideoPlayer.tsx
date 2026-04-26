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
  onProgress?: (currentTime: number, duration: number) => void;
  onCapture?: (thumbnail: string) => void;
}

export interface VideoPlayerRef {
  captureThumbnail: () => string | null;
}

const VideoPlayer = React.forwardRef<VideoPlayerRef, VideoPlayerProps>(({ src, poster, startTime, onProgress, onCapture }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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
      // Native HLS (Safari/iOS)
      video.src = src;
      video.addEventListener('canplay', () => {
        seekWhenReady(startTime || 0);
        video.play().catch(e => console.log('Autoplay blocked', e));
      }, { once: true });
    } else if (Hls.isSupported()) {
      // Simple Hls.js logic
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      setHlsInstance(hls);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        seekWhenReady(startTime || 0);
        video.play().catch(e => console.log('Autoplay blocked', e));
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
});

export default VideoPlayer;
