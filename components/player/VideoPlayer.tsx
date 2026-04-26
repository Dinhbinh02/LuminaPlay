'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play } from 'lucide-react';
import Image from 'next/image';
import styles from './VideoPlayer.module.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onProgress?: (currentTime: number, duration: number) => void;
}

export default function VideoPlayer({ src, poster, onProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.play().catch(e => console.log('Autoplay blocked', e));
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
        autoStartLoad: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      setHlsInstance(hls);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log('Autoplay blocked', e));
      });
      
      return () => {
        hls.destroy();
      };
    }
  }, [src, isPlaying]);

  // Handle progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (onProgress) {
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
      />
    </div>
  );
}
