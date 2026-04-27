'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from "@/components/layout/Header";
import VideoPlayer, { VideoPlayerRef } from "@/components/player/VideoPlayer";
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMovieDetail, useMovieCast, useMovies, useSearch } from "@/hooks/useMovie";
import { ophim } from "@/lib/ophim";
import Link from 'next/link';
import styles from './WatchPage.module.css';

function RelatedMoviesSection({ movie, cdnDomain }: { movie: any, cdnDomain: string }) {
  // Extract base title (e.g., "Tiến Sĩ Đá" from "Tiến Sĩ Đá: Hồi Sinh Thế Giới (Phần 4)")
  // We take the part before the first colon, parenthesis, or dash
  const baseTitle = movie.name.split(/[:(-]/)[0].trim();
  
  const { data: searchData } = useSearch(baseTitle);
  const genreSlug = movie.category?.[0]?.slug;
  const { data: categoryData } = useMovies('the-loai', genreSlug, { limit: 12 });

  const searchResults = searchData?.data?.items || [];
  const categoryResults = categoryData?.data?.items || [];

  // Combine and deduplicate
  // Prioritize search results (same series)
  const combinedMovies = [...searchResults, ...categoryResults]
    .filter((m: any, index: number, self: any[]) => 
      m.slug !== movie.slug && // Exclude current movie
      index === self.findIndex((t) => t.slug === m.slug) // Deduplicate
    )
    .slice(0, 12);

  if (combinedMovies.length === 0) return null;

  return (
    <div className={styles.relatedSection}>
      <h3>Related Movies</h3>
      <div className={styles.relatedList}>
        {combinedMovies.map((m: any) => (
          <Link key={m._id} href={`/watch/${m.slug}`} className={styles.relatedCard}>
            <div className={styles.relatedThumb}>
              <img src={ophim.getImageUrl(m.thumb_url, cdnDomain)} alt={m.name} />
            </div>
            <div className={styles.relatedInfo}>
              <h4>{m.name}</h4>
              <span>{m.year} • {m.quality || m.episode_current || ''}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function YouTubeEmbed({ url }: { url: string }) {
  const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
  if (!videoId) return null;

  return (
    <div className={styles.youtubeWrapper}>
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default function WatchPage() {
  const params = useParams();
  const slug = params.id as string;
  const { data: movieData, isLoading } = useMovieDetail(slug);
  const { data: castData } = useMovieCast(slug);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const currentEpisodeRef = useRef(0);
  const [initialTime, setInitialTime] = useState(0);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const progressRef = useRef({ currentTime: 0, duration: 0 });
  const playerRef = useRef<VideoPlayerRef>(null);
  const lastThumbnailRef = useRef<string | undefined>(undefined);

  // Sync ref with state
  useEffect(() => {
    currentEpisodeRef.current = currentEpisode;
  }, [currentEpisode]);

  useEffect(() => {
    if (movieData?.data?.item) {
      const history = localStorage.getItem('watch_history');
      if (history) {
        try {
          const historyList = JSON.parse(history);
          const savedItem = historyList.find((item: any) => item.slug === movieData.data.item.slug);
          if (savedItem) {
            const savedTime = savedItem.currentTime || 0;
            const savedEp = typeof savedItem.episodeIndex === 'number' ? savedItem.episodeIndex : 0;
            
            setInitialTime(savedTime);
            setCurrentEpisode(savedEp);
            currentEpisodeRef.current = savedEp;
            progressRef.current = { currentTime: savedTime, duration: savedItem.duration || 0 };
            lastThumbnailRef.current = savedItem.thumbnail;
          }
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      }
      setIsHistoryLoaded(true);
    }
  }, [movieData]);

  const saveHistory = useCallback((currentTime?: number, duration?: number) => {
    if (!movieData?.data?.item || !isHistoryLoaded) return;

    const finalTime = currentTime ?? progressRef.current.currentTime;
    const finalDuration = duration ?? progressRef.current.duration;

    if (finalTime < 1 && progressRef.current.currentTime < 1) return;

    const movie = movieData.data.item;
    const history = localStorage.getItem('watch_history');
    let historyList = history ? JSON.parse(history) : [];

    historyList = historyList.filter((item: any) => item.slug !== movie.slug);

    const episodes = movie.episodes?.[0]?.server_data || [];
    const episodeIdx = currentEpisodeRef.current;
    const currentEpData = episodes[episodeIdx];

    if (finalTime < 1 && progressRef.current.currentTime > 1) return;

    // Try to capture new thumb, otherwise use last known thumb
    const newThumb = playerRef.current?.captureThumbnail();
    if (newThumb) lastThumbnailRef.current = newThumb;

    const newItem = {
      id: movie._id,
      title: movie.name,
      poster: ophim.getImageUrl(movie.thumb_url, movieData.data.APP_DOMAIN_CDN_IMAGE),
      backdrop: ophim.getImageUrl(movie.poster_url || movie.thumb_url, movieData.data.APP_DOMAIN_CDN_IMAGE),
      slug: movie.slug,
      year: movie.year,
      currentTime: finalTime,
      duration: finalDuration,
      episodeIndex: episodeIdx,
      episodeName: currentEpData?.name,
      totalEpisodes: episodes.length,
      lastUpdated: Date.now(),
      thumbnail: lastThumbnailRef.current
    };

    historyList.unshift(newItem);
    localStorage.setItem('watch_history', JSON.stringify(historyList.slice(0, 20)));
  }, [movieData, isHistoryLoaded]);

  const handleProgress = (currentTime: number, duration: number) => {
    if (currentTime > 0) {
      progressRef.current = { currentTime, duration };
    }

    if (currentTime > 1) {
      // Capture thumbnail every 10 seconds to keep it fresh
      if (Math.floor(currentTime) % 10 === 0) {
        const thumb = playerRef.current?.captureThumbnail();
        if (thumb) lastThumbnailRef.current = thumb;
      }

      // Save metadata every 30s as heartbeat
      if (Math.floor(currentTime) % 30 === 0) {
        saveHistory(currentTime, duration);
      }
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveHistory();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      saveHistory();
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveHistory]);

  const movie = movieData?.data?.item;
  if (isLoading) {
    return (
      <main className={styles.main}>
        <Header />
      </main>
    );
  }
  
  if (!movie) return <div className="text-white text-center pt-40">Movie not found</div>;

  const episodes = movie.episodes?.[0]?.server_data || [];
  const videoSrc = episodes[currentEpisode]?.link_m3u8;
  const isTrailerOnly = movie.status === 'trailer' || !videoSrc;

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
              {isHistoryLoaded && videoSrc ? (
                <VideoPlayer
                  ref={playerRef}
                  src={videoSrc}
                  poster={ophim.getImageUrl(movie.poster_url || movie.thumb_url, movieData.data.APP_DOMAIN_CDN_IMAGE)}
                  startTime={initialTime}
                  autoPlay={true}
                  onProgress={handleProgress}
                />
              ) : !isHistoryLoaded ? (
                <div className={styles.noVideo}>
                  <p>Loading history...</p>
                </div>
              ) : movie.trailer_url ? (
                <YouTubeEmbed url={movie.trailer_url} />
              ) : (
                <div className={styles.noVideo}>
                  <p>Phim hiện chưa có video. Vui lòng quay lại sau!</p>
                </div>
              )}
            </motion.div>

            <div className={styles.movieInfo}>
              {isTrailerOnly && (
                <div className={styles.trailerBadge}>Đang chiếu Trailer</div>
              )}
              <h1 className={styles.title}>{movie.name}</h1>
              {movie.origin_name && movie.origin_name !== movie.name && (
                <h2 className={styles.originTitle}>{movie.origin_name}</h2>
              )}
              <div className={styles.meta}>
                {movie.year && movie.year !== '?' && movie.year !== '0' ? (
                  <span className={styles.metaItem}>{movie.year}</span>
                ) : null}
                {movie.time && !movie.time.includes('?') ? (
                  <span className={styles.metaItem}>{movie.time}</span>
                ) : null}
                {movie.quality && movie.quality !== '?' && movie.quality.toLowerCase() !== 'n/a' ? (
                  <span className={styles.metaItem}>{movie.quality}</span>
                ) : null}
                {movie.lang && movie.lang !== '?' && movie.lang.toLowerCase() !== 'n/a' ? (
                  <span className={styles.metaItem}>{movie.lang}</span>
                ) : null}
                {movie.imdb?.vote_average && Number(movie.imdb.vote_average) > 0 ? (
                  <span className={styles.imdb}>IMDb: {movie.imdb.vote_average}</span>
                ) : null}
              </div>
              <p className={styles.description}>{movie.content?.replace(/<[^>]*>?/gm, '')}</p>

              <div className={styles.genres}>
                {movie.category?.map((genre: any, idx: number) => (
                  <Link
                    key={idx}
                    href={`/search?genre=${genre.slug}`}
                    className={styles.genreTag}
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

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
                        {person.profile_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                            alt={person.name} 
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {person.name.charAt(0)}
                          </div>
                        )}
                        <span>{person.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.sidebarCol}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={styles.sidebarWrapper}
            >
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
                        saveHistory();
                        setCurrentEpisode(index);
                        setInitialTime(0); 
                        progressRef.current = { currentTime: 0, duration: 0 };
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {ep.name || (isTrailerOnly ? 'Trailer' : 'Full')}
                    </button>
                  ))}
                </div>
              </div>

              <RelatedMoviesSection movie={movie} cdnDomain={movieData.data.APP_DOMAIN_CDN_IMAGE} />
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
