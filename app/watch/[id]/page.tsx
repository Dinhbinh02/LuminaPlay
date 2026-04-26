'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from "@/components/layout/Header";
import VideoPlayer, { VideoPlayerRef } from "@/components/player/VideoPlayer";
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMovieDetail, useMovieCast, useMovies } from "@/hooks/useMovie";
import { ophim } from "@/lib/ophim";
import Link from 'next/link';
import styles from './WatchPage.module.css';

function RelatedMoviesSection({ movie, cdnDomain }: { movie: any, cdnDomain: string }) {
  const genreSlug = movie.category?.[0]?.slug;
  const { data: relatedData } = useMovies('the-loai', genreSlug, { limit: 10 });
  
  const relatedMovies = relatedData?.data?.items?.filter((m: any) => m.slug !== movie.slug) || [];

  if (relatedMovies.length === 0) return null;

  return (
    <div className={styles.relatedSection}>
      <h3>Related Movies</h3>
      <div className={styles.relatedList}>
        {relatedMovies.map((m: any) => (
          <Link key={m._id} href={`/watch/${m.slug}`} className={styles.relatedCard}>
            <div className={styles.relatedThumb}>
              <img src={ophim.getImageUrl(m.thumb_url, cdnDomain)} alt={m.name} />
            </div>
            <div className={styles.relatedInfo}>
              <h4>{m.name}</h4>
              <span>{m.year} • {m.quality}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function WatchPage() {
  const params = useParams();
  const slug = params.id as string;
  const { data: movieData, isLoading } = useMovieDetail(slug);
  const { data: castData } = useMovieCast(slug);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const progressRef = useRef({ currentTime: 0, duration: 0 });
  const playerRef = useRef<VideoPlayerRef>(null);
  const lastCaptureRef = useRef<number>(0);

  // Load last watched position
  useEffect(() => {
    if (movieData?.data?.item) {
      const history = localStorage.getItem('watch_history');
      if (history) {
        const historyList = JSON.parse(history);
        const savedItem = historyList.find((item: any) => item.slug === movieData.data.item.slug);
        if (savedItem) {
          setInitialTime(savedItem.currentTime || 0);
        }
      }
    }
  }, [movieData]);

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
      lastWatched: new Date().toISOString(),
      thumbnail: playerRef.current?.captureThumbnail() || undefined
    };
    
    historyList.unshift(newItem);
    localStorage.setItem('watch_history', JSON.stringify(historyList.slice(0, 20)));
  }, [movieData]);

  const handleProgress = (currentTime: number, duration: number) => {
    progressRef.current = { currentTime, duration };
    
    // Save history periodically
    if (currentTime > 1) {
      const now = Date.now();
      // Save metadata every 15s, but only try to capture thumbnail if it's been at least 30s
      if (Math.floor(currentTime) % 15 === 0) {
        saveHistory(currentTime, duration);
      }
    }
  };

  if (isLoading) return (
    <main className={styles.main}>
      <Header />
      <div className={styles.content}>
        <div className={styles.mainGrid}>
          <div className={styles.playerCol}>
            <div className={styles.playerWrapper} style={{ animation: 'pulse 1.5s infinite' }} />
          </div>
          <div className={styles.sidebarCol}>
            <div className={styles.epSection} style={{ height: '400px', animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>
      </div>
    </main>
  );

  const movie = movieData?.data?.item;
  if (!movie) return <div className="text-white text-center pt-40">Movie not found</div>;

  const episodes = movie.episodes?.[0]?.server_data || [];
  const videoSrc = episodes[currentEpisode]?.link_m3u8;

  return (
    <main className={styles.main}>
      <Header />
      
      <div className={styles.content}>
        <div className={styles.mainGrid}>
          <div className={styles.playerCol}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={styles.playerWrapper}
            >
              <VideoPlayer 
                ref={playerRef}
                src={videoSrc} 
                poster={ophim.getImageUrl(movie.poster_url || movie.thumb_url, movieData.data.APP_DOMAIN_CDN_IMAGE)}
                startTime={initialTime}
                onProgress={handleProgress} 
              />
            </motion.div>

            <div className={styles.movieInfo}>
              <h1 className={styles.title}>{movie.name}</h1>
              <div className={styles.meta}>
                <span className={styles.metaItem}>{movie.year}</span>
                <span className={styles.metaItem}>{movie.time}</span>
                <span className={styles.metaItem}>{movie.quality}</span>
                <span className={styles.metaItem}>{movie.lang}</span>
                <span className={styles.imdb}>IMDb: {movie.imdb?.vote_average || 'N/A'}</span>
              </div>
              <p className={styles.description}>{movie.content?.replace(/<[^>]*>?/gm, '')}</p>

              {castData?.data?.peoples && castData.data.peoples.length > 0 && (
                <div className={styles.castSection}>
                  <h3>Cast</h3>
                  <div className={styles.castGrid}>
                    {castData.data.peoples.slice(0, 10).map((person: any) => (
                      <a 
                        key={person.tmdb_people_id} 
                        href={`https://www.google.com/search?q=${encodeURIComponent(person.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.castCard}
                      >
                        <img 
                          src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://via.placeholder.com/185x185?text=Actor'} 
                          alt={person.name} 
                          crossOrigin="anonymous"
                        />
                        <span>{person.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.sidebarCol}>
            <div className={styles.epSection}>
              <h3>
                Episodes 
                <span className={styles.epCount}>{episodes.length} Total</span>
              </h3>
              <div className={styles.epList}>
                {episodes.map((ep: any, index: number) => (
                  <button 
                    key={index}
                    className={`${styles.epBtn} ${currentEpisode === index ? styles.epActive : ''}`}
                    onClick={() => {
                      setCurrentEpisode(index);
                      setInitialTime(0); // Reset time when changing episode
                    }}
                  >
                    {ep.name}
                  </button>
                ))}
              </div>
            </div>

            <RelatedMoviesSection movie={movie} cdnDomain={movieData.data.APP_DOMAIN_CDN_IMAGE} />
          </div>
        </div>
      </div>
    </main>
  );
}
