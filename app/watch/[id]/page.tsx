'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from "@/components/layout/Header";
import VideoPlayer from "@/components/player/VideoPlayer";
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMovieDetail, useMovieCast } from "@/hooks/useMovie";
import { ophim } from "@/lib/ophim";
import styles from './WatchPage.module.css';

export default function WatchPage() {
  const params = useParams();
  const slug = params.id as string;
  const { data: movieData, isLoading } = useMovieDetail(slug);
  const { data: castData } = useMovieCast(slug);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const progressRef = useRef({ currentTime: 0, duration: 0 });

  const saveHistory = useCallback((currentTime?: number, duration?: number) => {
    if (!movieData?.data?.item) return;
    
    const movie = movieData.data.item;
    const history = localStorage.getItem('watch_history');
    let historyList = history ? JSON.parse(history) : [];
    
    historyList = historyList.filter((item: any) => item.slug !== movie.slug);
    
    const newItem = {
      id: movie._id,
      title: movie.name,
      poster: ophim.getImageUrl(movie.thumb_url, movieData.data.APP_DOMAIN_CDN_IMAGE),
      backdrop: ophim.getImageUrl(movie.poster_url || movie.thumb_url, movieData.data.APP_DOMAIN_CDN_IMAGE),
      slug: movie.slug,
      year: movie.year,
      currentTime: currentTime ?? progressRef.current.currentTime,
      duration: duration ?? progressRef.current.duration,
      lastWatched: new Date().toISOString()
    };
    
    historyList.unshift(newItem);
    localStorage.setItem('watch_history', JSON.stringify(historyList.slice(0, 20)));
  }, [movieData]);

  // Initial save on load
  useEffect(() => {
    if (movieData?.data?.item) {
      saveHistory();
    }
  }, [movieData, saveHistory]);

  const handleProgress = (currentTime: number, duration: number) => {
    progressRef.current = { currentTime, duration };
    // Save every 30 seconds or so to avoid excessive writes, 
    // but also save on end or significant progress
    if (Math.floor(currentTime) % 15 === 0) {
      saveHistory(currentTime, duration);
    }
  };

  if (isLoading) return (
    <div className="bg-black min-h-screen">
      <Header />
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <div className="aspect-video bg-white/5 rounded-xl animate-pulse" />
      </div>
    </div>
  );

  const movie = movieData?.data?.item;
  if (!movie) return <div className="text-white text-center pt-40">Movie not found</div>;

  const episodes = movie.episodes?.[0]?.server_data || [];
  const videoSrc = episodes[currentEpisode]?.link_m3u8;

  return (
    <main className={styles.main}>
      <Header />
      
      <div className={styles.content}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={styles.playerWrapper}
        >
          <VideoPlayer 
            src={videoSrc} 
            poster={ophim.getImageUrl(movie.poster_url || movie.thumb_url, movieData.data.APP_DOMAIN_CDN_IMAGE)}
            onProgress={handleProgress} 
          />
        </motion.div>

        <div className={styles.movieDetails}>
          <div className={styles.infoCol}>
            <h1 className={styles.title}>{movie.name}</h1>
            <div className={styles.meta}>
              <span className={styles.metaItem}>{movie.year}</span>
              <span className={styles.metaItem}>{movie.time}</span>
              <span className={styles.metaItem}>{movie.quality}</span>
              <span className={styles.imdb}>IMDb: {movie.imdb?.vote_average || 'N/A'}</span>
            </div>
            <p className={styles.description}>{movie.content?.replace(/<[^>]*>?/gm, '')}</p>

            <div className={styles.castSection}>
              <h3>Cast</h3>
              <div className={styles.castGrid}>
                {castData?.data?.peoples?.slice(0, 6).map((person: any) => (
                  <div key={person.tmdb_people_id} className={styles.castCard}>
                    <img 
                      src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://via.placeholder.com/185x278?text=No+Image'} 
                      alt={person.name} 
                      crossOrigin="anonymous"
                    />
                    <span>{person.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.epCol}>
            <h3>Episodes</h3>
            <div className={styles.epList}>
              {episodes.map((ep: any, index: number) => (
                <button 
                  key={index}
                  className={`${styles.epBtn} ${currentEpisode === index ? styles.epActive : ''}`}
                  onClick={() => setCurrentEpisode(index)}
                >
                  {ep.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
