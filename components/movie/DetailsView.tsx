'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { PictureInPicture2, ChevronLeft, Globe, Play, Plus, Heart, Star, ChevronDown, ChevronUp, Loader2, Server, ChevronRight, Info, Share2, Film, Check, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { tmdb } from '@/lib/tmdb';
import { useTMDBDetails, useTMDBAllSeasons, useMovieDetail, useOphimMapping } from '@/hooks/useMovie';
import styles from './MovieDetails.module.css';
import { useLoadingStore } from '@/hooks/useLoadingStore';
import Header from '@/components/layout/Header';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { useStore, useModalStore } from '@/store/useStore';
import { useSyncHistory } from '@/hooks/useSyncHistory';
import { useToastStore } from '@/store/useToastStore';
import PersonModal from './PersonModal';


interface DetailsViewProps {
  id: string;
  type: 'movie' | 'tv';
}

export default function DetailsView({ id, type }: DetailsViewProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [showPlayer, setShowPlayer] = useState(false);
  const [showIframeControls, setShowIframeControls] = useState(true);
  const [playerConfig, setPlayerConfig] = useState<{ src: string, title: string, subTitle: string, isIframe?: boolean, isTrailer?: boolean, startTime?: number } | null>(null);
  const [selectedServer, setSelectedServer] = useState('ophim');

  useEffect(() => {
    const saved = localStorage.getItem(`preferredServer_${id}`);
    if (saved) {
      setSelectedServer(saved);
    } else {
      setSelectedServer('ophim');
    }
  }, [id]);

  useEffect(() => {
    if (selectedServer) {
      localStorage.setItem(`preferredServer_${id}`, selectedServer);
    }
  }, [id, selectedServer]);

  const [showServerMenu, setShowServerMenu] = useState(false);
  const [isTrailerLoading, setIsTrailerLoading] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  const handlePlayTrailer = (trailerKey: string, trailerTitle: string) => {
    setPlayerConfig({
      src: `https://www.youtube.com/embed/${trailerKey}?autoplay=1&vq=hd1080`,
      title: trailerTitle,
      subTitle: 'Official Trailer',
      isIframe: true,
      isTrailer: true
    });
    setShowPlayer(true);
  };

  const handleIframeMouseMove = () => {
    setShowIframeControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!showServerMenu) {
        setShowIframeControls(false);
      }
    }, 3000);
  };
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [collection, setCollection] = useState<any>(null);
  const [personModalId, setPersonModalId] = useState<string | null>(null);
  const [contentRating, setContentRating] = useState<string | null>(null);

  // Lock body scroll when player is active
  useEffect(() => {
    if (showPlayer) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';

      return () => {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      };
    }
  }, [showPlayer]);

  const SERVERS = [
    {
      id: 'ophim', name: 'Ophim (Fast)', url: (id: string, s: string, e: string, type: string) => ''
    },
    {
      id: 'videasy', name: 'Videasy (Stable)', url: (id: string, s: string, e: string, type: string) =>
        type === 'movie' ? `https://player.videasy.net/movie/${id}` : `https://player.videasy.net/tv/${id}/${s}/${e}`
    },
    {
      id: 'vidsrc', name: 'VidSrc (Unstable)', url: (id: string, s: string, e: string, type: string) =>
        type === 'movie' ? `https://vidsrc.to/embed/movie/${id}` : `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
    },
  ];

  const [currentEpisodeNum, setCurrentEpisodeNum] = useState('1');
  const { setPageLoading } = useLoadingStore();
  const { addToast } = useToastStore();

  // Detect if the id is a TMDB ID (numeric) or an Ophim slug (contains letters)
  const isNumeric = /^\d+$/.test(id);

  const { data: detail, isLoading } = useTMDBDetails(isNumeric ? id : '', type);
  const { history, addToHistory, favorites, addToFavorites, removeFromFavorites } = useStore();
  const { activeDetailId, activeDetailType, setActiveDetail } = useModalStore();
  const { syncItemToCloud } = useSyncHistory();

  // Find all history entries for this movie/show
  const showHistory = history.filter((h: any) => h.id === id);
  // The most recent one for resume button
  const latestHistory = showHistory[0];
  const hasHistory = showHistory.length > 0;

  const [selectedSeason, setSelectedSeason] = useState(1);

  // Auto-set season from history on mount
  useEffect(() => {
    if (latestHistory?.seasonNum) {
      setSelectedSeason(latestHistory.seasonNum);
    }
  }, [latestHistory?.seasonNum]);

  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const similarScrollRef = useRef<HTMLDivElement>(null);

  const scrollSimilar = (direction: 'left' | 'right') => {
    if (similarScrollRef.current) {
      const { scrollLeft, clientWidth } = similarScrollRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth * 0.8
        : scrollLeft + clientWidth * 0.8;

      similarScrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSeasonDropdownOpen(false);
      }
    };

    if (isSeasonDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSeasonDropdownOpen]);

  // Mapping logic to find Ophim slug from TMDB info
  const titleTMDB = detail?.title || detail?.name || '';
  const originalTitleTMDB = detail?.original_title || detail?.original_name || '';

  // For TV shows, use the air date of the selected season if available for better mapping accuracy
  const seasonAirDate = type === 'tv' ? detail?.seasons?.find((s: any) => s.season_number === selectedSeason)?.air_date : null;
  const yearTMDB = (seasonAirDate || detail?.release_date || detail?.first_air_date || '').split('-')[0];

  const { data: mappingSlug, isLoading: isMappingLoading } = useOphimMapping(
    titleTMDB,
    yearTMDB,
    originalTitleTMDB,
    type,
    id,
    type === 'tv' ? selectedSeason.toString() : undefined
  );

  const finalSlug = isNumeric ? mappingSlug : id;
  const { data: ophimRes, isLoading: isOphimLoading } = useMovieDetail(finalSlug || '');

  useEffect(() => {
    if (isNumeric && detail?.media_type && detail.media_type !== type) {
      // Redirect to the correct type route if TMDB reports a different media type
      if (activeDetailId && activeDetailType) {
        setActiveDetail(id, detail.media_type);
        window.history.replaceState({ isOverlay: true }, '', `/${detail.media_type}/${id}`);
      } else {
        router.replace(`/${detail.media_type}/${id}`);
      }
    }

    if (!isNumeric && ophimRes?.status === 'success' && ophimRes.data?.item) {
      const movie = ophimRes.data.item;
      const tmdbId = movie.tmdb?.id;
      if (tmdbId) {
        // Use TMDB type if provided by Ophim, otherwise fallback to guessing
        const movieType = movie.tmdb?.type || (movie.type === 'series' || movie.type === 'hoathinh' || movie.type === 'tvshows' ? 'tv' : 'movie');
        if (activeDetailId && activeDetailType) {
          setActiveDetail(tmdbId.toString(), movieType);
          window.history.replaceState({ isOverlay: true }, '', `/${movieType}/${tmdbId}`);
        } else {
          router.replace(`/${movieType}/${tmdbId}`);
        }
      }
    }
  }, [isNumeric, detail?.media_type, type, id, ophimRes, router, activeDetailId, activeDetailType, setActiveDetail]);

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Preload all seasons
  const seasonsQueries = useTMDBAllSeasons(
    type === 'tv' && isNumeric ? id : '',
    detail?.number_of_seasons || 0
  );

  // Get data for the selected season
  const seasonData = seasonsQueries[selectedSeason - 1]?.data;
  const isFetchingSeason = seasonsQueries[selectedSeason - 1]?.isFetching;
  const isAnySeasonLoading = seasonsQueries.some(q => q.isLoading);

  // Fetch Collection Details
  useEffect(() => {
    if (detail?.belongs_to_collection?.id) {
      tmdb.getCollectionDetails(detail.belongs_to_collection.id).then(setCollection);
    } else {
      setCollection(null);
    }
  }, [detail?.belongs_to_collection?.id]);

  // Fetch Content Rating
  useEffect(() => {
    if (detail) {
      if (type === 'movie') {
        const usRating = detail.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US')
          ?.release_dates?.find((rd: any) => rd.certification)?.certification;
        setContentRating(usRating || null);
      } else {
        const usRating = detail.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating;
        setContentRating(usRating || null);
      }
    }
  }, [detail, type]);

  const handlePlay = (episodeNum: string = '1', startTime?: number, seasonNum?: number, forcedServer?: string) => {
    const playSeason = seasonNum || selectedSeason;
    const activeServerIdForThisPlay = forcedServer || selectedServer;
    setCurrentEpisodeNum(episodeNum);
    if (seasonNum) setSelectedSeason(seasonNum); // Sync UI if needed

    const movieData = ophimRes?.data?.item;
    const server = movieData?.episodes?.[0];

    // Find episode name from TMDB season data
    const episodeDetail = seasonData?.episodes?.find((e: any) => e.episode_number.toString() === episodeNum);
    const episodeName = episodeDetail?.name ? `: ${episodeDetail.name}` : '';
    const displaySubTitle = type === 'tv'
      ? `Episode ${episodeNum}${episodeName}`
      : (detail?.release_date || '').split('-')[0];

    let m3u8Url = '';
    if (server) {
      const epData = type === 'tv'
        ? (
          server.server_data.find((e: any) => e.name === episodeNum) ||
          server.server_data.find((e: any) => e.slug?.includes(`tap-${episodeNum}`)) ||
          server.server_data.find((e: any) => e.name?.includes(`(${episodeNum})`)) ||
          (parseInt(episodeNum) <= server.server_data.length ? server.server_data[parseInt(episodeNum) - 1] : null)
        )
        : server.server_data[0];

      if (epData?.link_m3u8) {
        m3u8Url = epData.link_m3u8;
      }
    }

    if (m3u8Url && activeServerIdForThisPlay === 'ophim') {
      setPlayerConfig({
        src: m3u8Url,
        title: detail?.title || detail?.name || movieData?.name || '',
        subTitle: displaySubTitle,
        isIframe: false,
        startTime: startTime // Pass saved time
      });
      setShowPlayer(true);
      // Save initial history entry
      handleProgress(startTime || 0, 100, episodeNum);
    } else {
      // Fallback or explicit iframe
      let activeServerId = activeServerIdForThisPlay;

      // Auto-fallback if 'ophim' was default but not available
      if (activeServerId === 'ophim' && !m3u8Url) {
        activeServerId = 'videasy';
        setSelectedServer('videasy'); // Update UI
      }

      const activeServer = SERVERS.find(s => s.id === activeServerId) || SERVERS[1];
      const embedUrl = activeServer.url(id as string, playSeason.toString(), episodeNum, type as string);

      setPlayerConfig({
        src: embedUrl,
        title: detail?.title || detail?.name || movieData?.name || '',
        subTitle: displaySubTitle,
        isIframe: true
      });
      setShowPlayer(true);

      if (!m3u8Url) {
        if (!movieData) {
          addToast("Using fallback playback source.", "info");
        } else {
          addToast(`Episode ${episodeNum} is playing from a fallback source.`, "info");
        }
      }
    }
  };

  const handleProgress = (currentTime: number, duration: number, explicitEpisodeNum?: string, forceSync: boolean = false) => {
    if (!detail) return;
    const epToSave = explicitEpisodeNum || currentEpisodeNum;
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Find episode thumbnail if it's a TV show
    const epDetail = seasonData?.episodes?.find((e: any) => e.episode_number.toString() === epToSave);
    const epImage = epDetail?.still_path;

    const historyItem = {
      id: isNumeric ? id : (ophimRes?.data?.item?._id || id),
      title: detail?.title || detail?.name || ophimRes?.data?.item?.name || '',
      poster: epImage || detail?.backdrop_path || ophimRes?.data?.item?.thumb_url || '',
      progress,
      currentTime,
      episodeNum: type === 'tv' ? parseInt(epToSave) : undefined,
      seasonNum: type === 'tv' ? selectedSeason : undefined,
      slug: isNumeric ? undefined : id,
      watched_at: new Date().toISOString()
    };

    addToHistory(historyItem);
    syncItemToCloud(historyItem, forceSync);
  };

  // Synchronize with global loader
  useEffect(() => {
    // Keep loading if TMDB is fetching OR if we are in mapping phase OR waiting for Ophim detail
    const isMappingReady = isNumeric ? (!!mappingSlug && !isMappingLoading) : true;
    const isRedirecting = !isNumeric && !isOphimLoading && ophimRes?.data?.item?.tmdb?.id;

    // We stay loading until TMDB details ARE HERE AND (if numeric) mapping is done AND ophim detail is fetched
    // Optimization: ONLY show full page loading on INITIAL load (when detail is not yet available)
    const isInitialLoad = !detail;
    const shouldShowLoading = isInitialLoad && (isLoading || (isNumeric && !isMappingReady) || isOphimLoading || isRedirecting);

    setPageLoading(shouldShowLoading);
    return () => {
      // Only hide loader if we are NOT in the middle of a redirection
      if (isNumeric || !ophimRes?.data?.item?.tmdb?.id) {
        setPageLoading(false);
      }
    };
  }, [isLoading, isMappingLoading, isOphimLoading, isNumeric, mappingSlug, ophimRes, setPageLoading]);

  useEffect(() => {
    if (detail && !detail.backdrop_path) {
      setIsImageLoaded(true);
    }
  }, [detail]);

  // Handle iframe controls visibility
  useEffect(() => {
    if (!showPlayer || !playerConfig?.isIframe) {
      setShowIframeControls(true);
      return;
    }

    let timeout: NodeJS.Timeout;
    const resetTimeout = () => {
      setShowIframeControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowIframeControls(false);
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
  }, [showPlayer, playerConfig?.isIframe]);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoUrl = detail ? tmdb.getLogoUrl(detail.images) : null;
  const title = detail ? (detail.title || detail.name) : '';
  const rating = detail?.vote_average?.toFixed(1);
  const year = (detail?.release_date || detail?.first_air_date || '').split('-')[0];

  const genres = detail?.genres || [];
  const cast = detail?.credits?.cast?.slice(0, 12) || [];
  const recommendations = detail?.recommendations?.results?.slice(0, 12) || [];

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (similarScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = similarScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  }, []);

  useEffect(() => {
    const el = similarScrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [recommendations, checkScroll]);

  if (isLoading || !detail) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <button 
            className={styles.backButton} 
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            aria-label="Go Back"
          >
            <ArrowLeft size={24} />
          </button>
          <section className={styles.hero}>
            <div className={styles.backdropWrapper}>
              <div className={`${styles.backdrop} ${styles.skeletonShimmer}`} style={{ opacity: 0.15, height: '100%' }} />
              <div className={styles.overlay} />
            </div>

            <div className={styles.heroContent}>
              {/* Title / Logo Placeholder */}
              <div className={`${styles.logoWrapper} ${styles.skeletonShimmer}`} style={{ width: 'min(380px, 70vw)', height: 'min(160px, 30vh)', marginBottom: '30px', borderRadius: '12px' }} />

              {/* Meta Badges Placeholder */}
              <div className={styles.meta}>
                <div className={`${styles.skeletonShimmer}`} style={{ width: '80px', height: '26px', borderRadius: '4px' }} />
                <div className={`${styles.skeletonShimmer}`} style={{ width: '60px', height: '26px', borderRadius: '4px' }} />
                <div className={`${styles.skeletonShimmer}`} style={{ width: '90px', height: '26px', borderRadius: '4px' }} />
              </div>

              {/* Genres Placeholder */}
              <div className={styles.genreTags}>
                <div className={`${styles.skeletonShimmer}`} style={{ width: '90px', height: '28px', borderRadius: '4px' }} />
                <div className={`${styles.skeletonShimmer}`} style={{ width: '80px', height: '28px', borderRadius: '4px' }} />
              </div>

              {/* Description Placeholder */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px', maxWidth: '650px', width: '100%' }}>
                <div className={`${styles.skeletonShimmer}`} style={{ height: '18px', width: '90%', borderRadius: '4px' }} />
                <div className={`${styles.skeletonShimmer}`} style={{ height: '18px', width: '85%', borderRadius: '4px' }} />
                <div className={`${styles.skeletonShimmer}`} style={{ height: '18px', width: '60%', borderRadius: '4px' }} />
              </div>


              {/* Buttons Placeholder */}
              <div className={styles.mainActions}>
                <div className={`${styles.skeletonShimmer}`} style={{ width: '150px', height: '48px', borderRadius: '8px' }} />
                <div className={styles.secondaryActions}>
                  <div className={`${styles.skeletonShimmer}`} style={{ width: '130px', height: '48px', borderRadius: '8px' }} />
                  <div className={`${styles.skeletonShimmer}`} style={{ width: '48px', height: '48px', borderRadius: '8px' }} />
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  if (!isLoading && !detail) {
    return (
      <div className={styles.main}>
        <div className={styles.error}>Content not found</div>
      </div>
    );
  }
  const trailers = detail?.videos?.results?.filter((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || [];
  // Sort trailers by published_at date (newest first)
  const sortedTrailers = trailers.sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  const trailer = sortedTrailers.find((v: any) => v.iso_639_1 === 'en') || sortedTrailers[0];
  const isTrailerOnly = ophimRes?.data?.item?.status === 'trailer' ||
    ophimRes?.data?.item?.episode_current?.toLowerCase() === 'trailer';

  return (
    <>
      <Header />

      {mounted && createPortal(
        <AnimatePresence>
          {showPlayer && playerConfig && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.playerOverlay}
              onClick={() => setShowPlayer(false)}
              style={{
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                willChange: "auto"
              }}
            >
              {playerConfig.isIframe ? (
                <div
                  className={styles.iframeContainer}
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={handleIframeMouseMove}
                  onMouseMove={handleIframeMouseMove}
                  onMouseLeave={() => {
                    setShowIframeControls(false);
                    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
                  }}
                >
                  {!playerConfig.isTrailer && (
                    <div className={`${styles.iframeTopBar} ${!showIframeControls ? styles.hidden : ''}`}>
                      <div className={styles.iframeTopLeft}>
                        <button
                          className={styles.iframeBackBtn}
                          onClick={() => setShowPlayer(false)}
                        >
                          <ArrowLeft size={32} />
                        </button>
                        <div className={styles.iframeInfo}>
                          <span className={styles.iframeTitle}>
                            {playerConfig.subTitle || playerConfig.title}
                          </span>
                        </div>
                      </div>


                      <div className={styles.serverContainer}>
                        <button className={styles.serverButton} onClick={() => setShowServerMenu(!showServerMenu)}>
                          <Globe size={20} />
                          <span>{SERVERS.find(s => s.id === selectedServer)?.name.split(' ')[0] || 'Server'}</span>
                        </button>
                        <AnimatePresence>
                          {showServerMenu && (
                            <motion.div
                              className={styles.serverMenuFloating}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                            >
                              <div className={styles.menuHeader}>Select Server</div>
                              {SERVERS.map((s) => (
                                <button
                                  key={s.id}
                                  className={`${styles.serverMenuItem} ${selectedServer === s.id ? styles.activeServer : ''}`}
                                  onClick={() => {
                                    setSelectedServer(s.id);
                                    setShowServerMenu(false);
                                    handlePlay(currentEpisodeNum, undefined, selectedSeason, s.id);
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
                  )}
                  <iframe
                    src={playerConfig.src}
                    className={styles.iframe}
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className={styles.iframeContainer} onClick={(e) => e.stopPropagation()}>
                  <VideoPlayer
                    src={playerConfig.src}
                    title={playerConfig.title}
                    subTitle={playerConfig.subTitle}
                    poster={detail?.backdrop_path ? tmdb.getImageUrl(detail.backdrop_path, 'w1280') : undefined}
                    startTime={playerConfig.startTime}
                    onProgress={(ct, d, f) => handleProgress(ct, d, undefined, f)}
                    onClose={(finalTime, finalDuration) => {
                      handleProgress(finalTime, finalDuration, undefined, true); // Force sync on exit
                      setShowPlayer(false);
                    }}
                    autoPlay
                    servers={SERVERS}
                    currentServerId={selectedServer}
                    onServerSelect={(sid) => {
                      setSelectedServer(sid);
                      handlePlay(currentEpisodeNum, undefined, selectedSeason, sid);
                    }}
                    onNext={
                      seasonData?.episodes?.some((ep: any) => ep.episode_number === parseInt(currentEpisodeNum) + 1)
                        ? () => handlePlay((parseInt(currentEpisodeNum) + 1).toString())
                        : undefined
                    }
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <main className={styles.main} style={{ opacity: (!isLoading && detail) ? 1 : 0 }}>
        <button 
          className={styles.backButton} 
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.push('/');
            }
          }}
          aria-label="Go Back"
        >
          <ArrowLeft size={24} />
        </button>
        <section className={styles.hero}>
          <div className={styles.backdropWrapper}>
            {(detail?.backdrop_path || detail?.poster_path) && (
              <picture>
                <source
                  media="(max-width: 768px)"
                  srcSet={tmdb.getTextlessPosterUrl(detail.images) || tmdb.getImageUrl(detail.poster_path || detail.backdrop_path, 'original')}
                />
                <img
                  src={tmdb.getTextlessBackdropUrl(detail.images) || tmdb.getImageUrl(detail.backdrop_path || detail.poster_path, 'original')}
                  alt={title}
                  className={styles.backdrop}
                  style={{ opacity: isImageLoaded ? 1 : 0, transition: 'opacity 1s ease' }}
                  onLoad={() => setIsImageLoaded(true)}
                />
              </picture>
            )}
            <div className={styles.overlay} />
          </div>

          <div className={styles.heroContent}>
            {logoUrl ? (
              <div className={styles.logoWrapper}>
                <img src={logoUrl} alt={title} className={styles.logo} />
              </div>
            ) : (
              <h1 className={styles.title}>{title}</h1>
            )}

            <div className={styles.meta}>
              {rating && (
                <div className={styles.rating}>
                  <span className={styles.imdbText}>IMDb</span>
                  <div className={styles.ratingValue}>
                    <Star size={14} fill="currentColor" />
                    <span>{rating}</span>
                  </div>
                </div>
              )}
              {year && <span className={styles.metaBadge}>{year}</span>}
              {type === 'tv' && detail?.number_of_seasons && (
                <span className={styles.metaBadge}>{detail.number_of_seasons} Seasons</span>
              )}
            </div>

            <div className={styles.genreTags}>
              {genres.map((g: any) => (
                <span key={g.id} className={styles.genreTag}>{g.name}</span>
              ))}
            </div>

            <p className={styles.description}>{detail?.overview}</p>

            {/* Studios and Watch Providers */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
              {/* Studios */}
              {detail?.production_companies?.some((c: any) => c.logo_path) && (
                <div className={styles.watchProviders}>
                  <span className={styles.watchLabel}>Studio:</span>
                  <div className={styles.providerIcons}>
                    {detail.production_companies
                      .filter((c: any) => c.logo_path)
                      .slice(0, 1) // Only show the primary studio to keep UI clean
                      .map((company: any) => (
                        <Link
                          href={`/provider/${company.id}?type=company`}
                          key={company.id}
                          className={styles.providerIconWrapper}
                          title={company.name}
                        >
                          <img
                            src={tmdb.getImageUrl(company.logo_path, 'w300', 'negate,000,666')}
                            alt={company.name}
                            className={styles.providerIcon}
                          />
                        </Link>
                      ))}
                  </div>
                </div>
              )}

              {/* Watch Providers */}
              {detail?.['watch/providers']?.results?.US?.flatrate && (
                <div className={styles.watchProviders}>
                  <span className={styles.watchLabel}>Streaming on:</span>
                  <div className={styles.providerIcons}>
                    {detail['watch/providers'].results.US.flatrate
                      .reduce((acc: any[], provider: any) => {
                        const isDuplicate = acc.find(p =>
                          p.provider_name.toLowerCase().includes(provider.provider_name.toLowerCase().split(' ')[0]) ||
                          provider.provider_name.toLowerCase().includes(p.provider_name.toLowerCase().split(' ')[0])
                        );
                        if (!isDuplicate) acc.push(provider);
                        return acc;
                      }, [])
                      .map((provider: any) => (
                        <Link
                          href={`/provider/${provider.provider_id}?type=watch`}
                          key={provider.provider_id}
                          className={styles.providerIconWrapper}
                          title={provider.provider_name}
                        >
                          <img
                            src={tmdb.getImageUrl(provider.logo_path, 'w300')}
                            alt={provider.provider_name}
                            className={styles.providerIcon}
                          />
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.mainActions}>
              {(isOphimLoading || isMappingLoading) ? (
                <button
                  className={styles.btnPlay}
                  disabled
                  style={{ opacity: 0.8, cursor: 'wait' }}
                >
                  <Loader2 size={24} className={styles.spinner} />
                  <span>Loading...</span>
                </button>
              ) : (
                <button
                  className={styles.btnPlay}
                  onClick={() => {
                    if (ophimRes?.data?.item || isNumeric) {
                      if (hasHistory) {
                        handlePlay(
                          latestHistory.episodeNum?.toString() || '1',
                          latestHistory.currentTime,
                          latestHistory.seasonNum
                        );
                      } else {
                        handlePlay('1');
                      }
                    } else {
                      addToast("This movie is not available yet.", "info");
                    }
                  }}
                >
                  <Play size={24} fill="currentColor" />
                  <span>{hasHistory ? 'Resume' : 'Play'}</span>
                </button>
              )}
              <div className={styles.secondaryActions}>
                <button
                  className={styles.btnTrailer}
                  onClick={() => {
                    if (trailer) {
                      handlePlayTrailer(trailer.key, title);
                    } else {
                      addToast("Trailer not available on YouTube.", "error");
                    }
                  }}
                >
                  <Play size={24} />
                  <span>Trailer</span>
                </button>
                <button
                  className={`${styles.btnAdd} ${favorites.some(f => String(f.id) === String(detail?.id)) ? styles.active : ''}`}
                  onClick={() => {
                    if (!detail) return;
                    const isFav = favorites.some(f => String(f.id) === String(detail.id));
                    if (isFav) {
                      removeFromFavorites(String(detail.id));
                      addToast('Removed from My List', 'info');
                    } else {
                      addToFavorites({
                        id: String(detail.id),
                        title: detail.title || detail.name || '',
                        poster: detail.poster_path || detail.backdrop_path || '',
                        progress: 0,
                        slug: detail.id.toString()
                      });
                      addToast('Added to My List', 'success');
                    }
                  }}
                  title={favorites.some(f => String(f.id) === String(detail?.id)) ? "Remove from My List" : "Add to My List"}
                >
                  <Heart
                    size={24}
                    fill={favorites.some(f => String(f.id) === String(detail?.id)) ? "var(--primary)" : "none"}
                    color={favorites.some(f => String(f.id) === String(detail?.id)) ? "var(--primary)" : "currentColor"}
                  />
                </button>
              </div>
            </div>
          </div>

          <PersonModal
            personId={personModalId}
            onClose={() => setPersonModalId(null)}
          />

          <motion.div
            className={styles.scrollIndicator}
            initial={{ opacity: 0 }}
            animate={{ opacity: showScrollIndicator ? 1 : 0 }}
            style={{ pointerEvents: showScrollIndicator ? 'auto' : 'none' }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight - 22,
                behavior: 'smooth'
              });
            }}
          >
            <ChevronDown size={28} className={styles.scrollArrow} />
          </motion.div>
        </section>

        <div className={styles.sections}>
          <section className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBar} />
              <h3 className={styles.sectionTitle}>Information</h3>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status</span>
                <span className={styles.infoValue}>{detail?.status}</span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Content Rating</span>
                <span className={styles.infoValue}>{contentRating || 'N/A'}</span>
              </div>

              {(type === 'tv' ? detail?.networks : detail?.production_companies)?.length > 0 && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{type === 'tv' ? 'Network' : 'Studio'}</span>
                  <div className={styles.productionLogos}>
                    {(type === 'tv' ? detail.networks : detail.production_companies)
                      .filter((c: any) => c.logo_path)
                      .slice(0, 1)
                      .map((company: any) => (
                        <Link
                          href={`/provider/${company.id}?type=${type === 'tv' ? 'network' : 'company'}`}
                          key={company.id}
                          className={styles.infoLogoWrapper}
                          title={company.name}
                        >
                          <img
                            src={tmdb.getImageUrl(company.logo_path, 'w300')}
                            alt={company.name}
                            className={company.name === 'Marvel Studios' ? styles.marvelLogo : styles.infoLogo}
                          />
                        </Link>
                      ))}
                  </div>
                </div>
              )}

              {type === 'movie' && detail?.runtime > 0 && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Runtime</span>
                  <span className={styles.infoValue}>
                    {Math.floor(detail.runtime / 60)}h {detail.runtime % 60}m
                  </span>
                </div>
              )}

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Original Title</span>
                <span className={styles.infoValue}>{detail?.original_title || detail?.original_name}</span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Release Date</span>
                <span className={styles.infoValue}>{detail?.release_date || detail?.first_air_date}</span>
              </div>

              {type === 'tv' && detail?.last_air_date && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Last Air Date</span>
                  <span className={styles.infoValue}>{detail.last_air_date}</span>
                </div>
              )}

              {type === 'tv' && detail?.number_of_episodes > 0 && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Total Episodes</span>
                  <span className={styles.infoValue}>{detail.number_of_episodes}</span>
                </div>
              )}

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Origin Country</span>
                <span className={styles.infoValue}>
                  {detail?.origin_country?.join(' • ') || detail?.production_countries?.map((c: any) => c.iso_3166_1).join(' • ')}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Spoken Languages</span>
                <span className={styles.infoValue}>
                  {detail?.spoken_languages?.map((l: any) => l.english_name).join(' • ')}
                </span>
              </div>

              {type === 'movie' && detail?.budget > 0 && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Budget</span>
                  <span className={styles.infoValue}>${detail.budget.toLocaleString()}</span>
                </div>
              )}

              {type === 'movie' && detail?.revenue > 0 && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Revenue</span>
                  <span className={styles.infoValue}>${detail.revenue.toLocaleString()}</span>
                </div>
              )}


            </div>
          </section>

          {cast.length > 0 && (
            <section className={styles.castSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionBar} />
                <h3 className={styles.sectionTitle}>Actors</h3>
              </div>
              <div className={styles.castGrid}>
                {cast.map((person: any) => (
                  <div
                    key={person.id}
                    className={styles.castCard}
                    onClick={() => setPersonModalId(person.id.toString())}
                  >
                    <img
                      src={tmdb.getPersonImage(person.profile_path) || 'https://via.placeholder.com/185x278?text=No+Image'}
                      alt={person.name}
                      className={styles.castAvatar}
                    />
                    <div className={styles.castInfo}>
                      <h4>{person.name}</h4>
                      <p>{person.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {type === 'tv' && (
            <section className={styles.episodesSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionBar} />
                <h3 className={styles.sectionTitle}>Episodes</h3>
              </div>

              {detail?.number_of_seasons && (
                <div className={styles.seasonChips}>
                  {Array.from({ length: detail.number_of_seasons }, (_, i) => i + 1).map(seasonNum => (
                    <button
                      key={seasonNum}
                      className={`${styles.seasonChip} ${selectedSeason === seasonNum ? styles.seasonChipActive : ''}`}
                      onClick={() => setSelectedSeason(seasonNum)}
                      disabled={isFetchingSeason}
                    >
                      Season {seasonNum}
                    </button>
                  ))}
                  {isFetchingSeason && <Loader2 size={20} className={styles.spinner} />}
                </div>
              )}

              <div className={`${styles.episodesGrid} ${isFetchingSeason ? styles.fetching : ''}`}>
                {seasonData?.episodes?.map((ep: any) => {
                  const epHistory = showHistory.find((h: any) =>
                    h.episodeNum === ep.episode_number &&
                    h.seasonNum === selectedSeason
                  );
                  const isCurrentWatching = latestHistory &&
                    latestHistory.episodeNum === ep.episode_number &&
                    latestHistory.seasonNum === selectedSeason &&
                    latestHistory.progress < 95;

                  return (
                    <div
                      key={ep.id}
                      className={`${styles.episodeCard} ${isCurrentWatching ? styles.watchingCard : ''}`}
                      onClick={() => {
                        handlePlay(ep.episode_number.toString(), epHistory ? epHistory.currentTime : 0, selectedSeason);
                      }}
                    >
                      <div className={styles.episodeThumbWrapper}>
                        <img
                          src={tmdb.getEpisodeImage(ep.still_path) || (detail?.backdrop_path ? tmdb.getImageUrl(detail.backdrop_path, 'w300') : undefined)}
                          alt={ep.name}
                          className={styles.episodeThumb}
                        />
                        <div className={styles.playOverlay}>
                          <Play size={24} fill="#fff" />
                        </div>
                        {epHistory && epHistory.progress > 0 && (
                          <div className={styles.episodeProgressContainer}>
                            <div
                              className={styles.episodeProgressBar}
                              style={{ width: `${epHistory.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <div className={styles.episodeInfo}>
                        <div className={styles.episodeNumber}>E{ep.episode_number}</div>
                        <h4 className={styles.episodeTitle}>{ep.name}</h4>
                        {ep.runtime && <p className={styles.episodeRuntime}>{ep.runtime}m</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {collection && collection.parts?.length > 1 && (
            <section className={styles.collectionSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionBar} />
                <h3 className={styles.sectionTitle}>{collection.name}</h3>
              </div>
              <div className={styles.collectionGrid}>
                {collection.parts
                  ?.sort((a: any, b: any) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime())
                  ?.map((item: any) => (
                    <Link
                      key={item.id}
                      href={`/movie/${item.id}`}
                      className={`${styles.collectionCard} ${item.id.toString() === id ? styles.activeItem : ''}`}
                    >
                      <div className={styles.collectionPosterWrapper}>
                        <img
                          src={tmdb.getImageUrl(item.poster_path, 'w342')}
                          alt={item.title}
                          className={styles.collectionPoster}
                        />
                        {item.id.toString() === id && (
                          <div className={styles.nowPlayingBadge}>Now Playing</div>
                        )}
                      </div>
                      <div className={styles.collectionInfo}>
                        <div className={styles.collectionTitle}>{item.title}</div>
                        <div className={styles.collectionYear}>{(item.release_date || '').split('-')[0]}</div>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          )}

          {recommendations.length > 0 && (
            <section className={styles.similarSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionBar} />
                <h3 className={styles.sectionTitle}>Similar Shows</h3>
              </div>
              <div className={styles.sliderWrapper}>
                {canScrollLeft && (
                  <button className={`${styles.controlBtn} ${styles.left}`} onClick={() => scrollSimilar('left')}>
                    <ChevronLeft size={28} />
                  </button>
                )}
                <div className={styles.similarGrid} ref={similarScrollRef}>
                  {recommendations.map((item: any) => (
                    <Link
                      key={item.id}
                      href={type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`}
                      className={styles.similarCard}
                    >
                      <div className={styles.similarPosterWrapper}>
                        <img
                          src={tmdb.getImageUrl(item.poster_path, 'w342')}
                          alt={item.title || item.name}
                          className={styles.similarPoster}
                        />
                      </div>
                      <div className={styles.similarInfo}>
                        <div className={styles.similarTitle}>{item.title || item.name}</div>
                        <div className={styles.similarYear}>{(item.release_date || item.first_air_date || '').split('-')[0]}</div>
                      </div>
                    </Link>
                  ))}
                </div>
                {canScrollRight && (
                  <button className={`${styles.controlBtn} ${styles.right}`} onClick={() => scrollSimilar('right')}>
                    <ChevronRight size={28} />
                  </button>
                )}
              </div>
            </section>
          )}

        </div>
      </main>
    </>
  );
}
