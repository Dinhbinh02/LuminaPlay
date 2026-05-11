'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ophim } from '@/lib/ophim';
import { tmdb } from '@/lib/tmdb';
import { useLoadingStore } from '@/hooks/useLoadingStore';

export default function WatchCatchAll({ params }: { params: Promise<{ paths: string[] }> }) {
  const router = useRouter();
  const { paths } = React.use(params);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setPageLoading } = useLoadingStore();

  useEffect(() => {
    setPageLoading(isRedirecting);
    return () => setPageLoading(false);
  }, [isRedirecting, setPageLoading]);

  useEffect(() => {
    async function handleLegacySlug() {
      if (paths.length === 1) {
        const slug = paths[0];
        setIsRedirecting(true);
        try {
          // 1. Get Ophim detail to find TMDB/IMDB ID
          const res = await ophim.getMovieDetail(slug);
          if (res.status === 'success' && res.data?.item) {
            const movie = res.data.item;
            let tmdbId = movie.tmdb?.id;
            
            // 2. Decide where to redirect
            if (tmdbId) {
              const type = movie.type === 'series' || movie.type === 'hoathinh' || movie.type === 'tvshows' ? 'tv' : 'movie';
              router.replace(`/${type}/${tmdbId}`);
              return;
            } else {
              // Fallback directly to Ophim Details using Slug
              router.replace(`/movie/${slug}`);
              return;
            }
          }
          setError("This movie does not exist in our system.");
          setIsRedirecting(false);
        } catch (err) {
          console.error("Redirect error:", err);
          setError("An error occurred while fetching movie information.");
          setIsRedirecting(false);
        }
      }
    }

    handleLegacySlug();
  }, [paths, router]);

  if (paths.length === 2) {
    // This is the new structure [type]/[id]
    // We need to return the player component
    // But since this is a catch-all, we can just render the WatchPage logic here
    return <WatchPageWrapper paths={paths} />;
  }

  if (isRedirecting) {
    return null;
  }

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff', flexDirection: 'column', gap: '20px' }}>
        <h2>{error}</h2>
        <button onClick={() => router.push('/')} style={{ padding: '10px 20px', background: '#e50914', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
          Go back to Home
        </button>
      </div>
    );
  }

  return null;
}

// Re-implementing the watch logic for the catch-all
import { useSearchParams } from 'next/navigation';
import Header from "@/components/layout/Header";
import { ArrowLeft, Star, Calendar, Info, Server } from 'lucide-react';
import { useTMDBDetails, useOphimMapping, useMovieDetail, useTMDBSeason } from "@/hooks/useMovie";
import VideoPlayer from "@/components/player/VideoPlayer";
import Link from 'next/link';
import styles from './WatchPage.module.css';
import { useStore } from '@/store/useStore';
import { useSyncHistory } from '@/hooks/useSyncHistory';
import { motion, AnimatePresence } from 'framer-motion';

function WatchPageWrapper({ paths }: { paths: string[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setPageLoading } = useLoadingStore();
  
  const type = paths[0] as 'movie' | 'tv';
  const id = paths[1] as string;
  const isNumeric = /^\d+$/.test(id);

  const [selectedServer, setSelectedServer] = useState('vidlink');
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const SERVERS = [
    { id: 'vidlink', name: 'VidLink (Clean)', url: (id: string, s: string, e: string, type: string) => 
      type === 'movie' ? `https://vidlink.pro/embed/movie/${id}` : `https://vidlink.pro/embed/tv/${id}/${s}/${e}` 
    },
    { id: 'vidsrc_to', name: 'VidSrc (.to)', url: (id: string, s: string, e: string, type: string) => 
      type === 'movie' ? `https://vidsrc.to/embed/movie/${id}` : `https://vidsrc.to/embed/tv/${id}/${s}/${e}` 
    },
    { id: 'vidsrc_xyz', name: 'VidSrc (.xyz)', url: (id: string, s: string, e: string, type: string) => 
      type === 'movie' ? `https://vidsrc.xyz/embed/movie/${id}` : `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` 
    },
  ];
  
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';

  const { addToHistory } = useStore();
  const { syncItemToCloud } = useSyncHistory();
  
  const { data: detail, isLoading } = useTMDBDetails(isNumeric ? id : '', type);
  const { data: seasonData } = useTMDBSeason(type === 'tv' && isNumeric ? id : '', parseInt(season));
  const titleTMDB = detail?.title || detail?.name || '';
  const originalTitleTMDB = detail?.original_title || detail?.original_name || '';
  const yearTMDB = (detail?.release_date || detail?.first_air_date || '').split('-')[0];
  
  // If not numeric, we use the id as the slug directly
  const effectiveSlug = isNumeric ? null : id;
  const { data: ophimSlug, isLoading: isMappingLoading } = useOphimMapping(
    titleTMDB, 
    yearTMDB, 
    originalTitleTMDB,
    type,
    id,
    type === 'tv' ? season : undefined
  );
  
  const finalSlug = effectiveSlug || ophimSlug;
  const { data: ophimDetail, isLoading: isOphimLoading } = useMovieDetail(finalSlug || '');

  let videoUrl = '';
  let useIframe = true;

  // Handle iframe controls visibility
  useEffect(() => {
    if (!useIframe) {
      setShowControls(true);
      return;
    }

    let timeout: NodeJS.Timeout;
    const resetTimeout = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('mousedown', resetTimeout);
    window.addEventListener('touchstart', resetTimeout);
    resetTimeout();

    return () => {
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('mousedown', resetTimeout);
      window.removeEventListener('touchstart', resetTimeout);
      clearTimeout(timeout);
    };
  }, [useIframe]);


  if (ophimDetail?.data?.item) {
    const movieData = ophimDetail.data.item;
    const server = movieData.episodes?.[0];
    if (server) {
      const epData = type === 'tv' 
        ? (
            server.server_data.find((e: any) => e.name === episode) ||
            server.server_data.find((e: any) => e.slug?.includes(`tap-${episode}`)) ||
            server.server_data.find((e: any) => e.name?.includes(`(${episode})`)) ||
            // Fallback: If absolute number fails, try relative index if episode is small, 
            // or if it's a known multi-season split, take the first one as a last resort
            (parseInt(episode) < server.server_data.length ? server.server_data[parseInt(episode) - 1] : server.server_data[0])
          )
        : server.server_data[0];
      if (epData?.link_m3u8) {
        videoUrl = epData.link_m3u8;
        useIframe = false;
      }
    }
  }

  const activeServer = SERVERS.find(s => s.id === selectedServer) || SERVERS[0];
  const embedUrl = activeServer.url(id, season, episode, type);

  const isLoadingTotal = (isNumeric && isMappingLoading && !ophimSlug) || (isOphimLoading && !ophimDetail);

  useEffect(() => {
    setPageLoading(isLoadingTotal);
    return () => setPageLoading(false);
  }, [isLoadingTotal, setPageLoading]);

  // Progress Handler
  const handleProgress = (currentTime: number, duration: number, forceSync: boolean = false) => {
    if (!detail && !ophimDetail?.data?.item) return;
    
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const movieTitle = detail?.title || 
                      detail?.name || 
                      ophimDetail?.data?.item?.origin_name || 
                      ophimDetail?.data?.item?.name;

    // Find episode thumbnail if it's a TV show
    const epDetail = seasonData?.episodes?.find((e: any) => e.episode_number.toString() === episode);
    const epImage = epDetail?.still_path;

    const historyItem = {
      id: isNumeric ? id : (ophimDetail?.data?.item?._id || id),
      title: movieTitle,
      poster: epImage || (detail?.poster_path ? tmdb.getImageUrl(detail.poster_path) : (ophimDetail?.data?.item ? ophim.getImageUrl(ophimDetail.data.item.thumb_url) : '')),
      progress,
      currentTime,
      episodeNum: type === 'tv' ? parseInt(episode) : undefined,
      seasonNum: type === 'tv' ? parseInt(season) : undefined,
      slug: paths.join('/'),
      watched_at: new Date().toISOString()
    };

    if (movieTitle) {
      addToHistory(historyItem);
      syncItemToCloud(historyItem, forceSync);
    }
  };

  // Initial Save to History
  useEffect(() => {
    if (detail || ophimDetail?.data?.item) {
      handleProgress(0, 100); // Initial entry
    }
  }, [detail, ophimDetail]); // Initial save only when data is ready


  if (isLoadingTotal) return null;

  if (!detail && !ophimDetail?.data?.item) {
    return (
      <main className={styles.main}>
        <Header />
        <div className={styles.error}>This content is currently unavailable.</div>
      </main>
    );
  }

  const title = detail?.title || detail?.name || ophimDetail?.data?.item?.name || '';
  const subTitle = type === 'tv' ? `Season ${season} : Episode ${episode}` : (yearTMDB || ophimDetail?.data?.item?.year);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.playerSection}>
          <div className={styles.aspectRatio}>
            {!useIframe && videoUrl ? (
              <VideoPlayer 
                src={videoUrl} 
                title={title}
                subTitle={subTitle}
                poster={detail ? tmdb.getImageUrl(detail.backdrop_path, 'original') : ophim.getImageUrl(ophimDetail?.data?.item?.thumb_url)}
                partyId={searchParams.get('partyId') || undefined}
                onProgress={(ct, d, f) => handleProgress(ct, d, f)}
                onClose={(finalTime, finalDuration) => {
                  handleProgress(finalTime, finalDuration, true); // Force sync on exit
                  router.back();
                }}
              />
            ) : (
              <div className={styles.iframeWrapper}>
                <div className={`${styles.playerControls} ${!showControls ? styles.hidden : ''}`}>
                  <button className={styles.backBtn} onClick={() => router.back()}>
                    <ArrowLeft size={24} />
                  </button>

                  <div className={styles.serverSwitcher}>
                    <button 
                      className={styles.serverBtn}
                      onClick={() => setShowServerMenu(!showServerMenu)}
                    >
                      <Server size={20} />
                      <span>{activeServer.name}</span>
                    </button>

                    <AnimatePresence>
                      {showServerMenu && (
                        <motion.div 
                          className={styles.serverMenu}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {SERVERS.map((s) => (
                            <button
                              key={s.id}
                              className={`${styles.serverMenuItem} ${selectedServer === s.id ? styles.activeServer : ''}`}
                              onClick={() => {
                                setSelectedServer(s.id);
                                setShowServerMenu(false);
                              }}
                            >
                              {s.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <iframe 
                  src={embedUrl} 
                  className={styles.iframe} 
                  allowFullScreen 
                  frameBorder="0" 
                  scrolling="no" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation-by-user-activation allow-presentation"
                  referrerPolicy="origin"
                ></iframe>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
