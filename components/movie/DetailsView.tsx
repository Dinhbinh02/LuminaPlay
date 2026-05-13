'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Users, Plus, Star, ChevronDown, ChevronUp, Loader2, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { tmdb } from '@/lib/tmdb';
import { useTMDBDetails, useTMDBSeason, useMovieDetail, useOphimMapping } from '@/hooks/useMovie';
import styles from './MovieDetails.module.css';
import OphimDetailsView from './OphimDetailsView';
import { useLoadingStore } from '@/hooks/useLoadingStore';
import Header from '@/components/layout/Header';
import WatchPartyModal from './WatchPartyModal';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { useStore } from '@/store/useStore';
import { useSyncHistory } from '@/hooks/useSyncHistory';
import { useToastStore } from '@/store/useToastStore';
import PersonModal from './PersonModal';

interface DetailsViewProps {
  id: string;
  type: 'movie' | 'tv';
}

export default function DetailsView({ id, type }: DetailsViewProps) {
  const router = useRouter();

  const [showPlayer, setShowPlayer] = useState(false);
  const [showIframeControls, setShowIframeControls] = useState(true);
  const [playerConfig, setPlayerConfig] = useState<{ src: string, title: string, subTitle: string, isIframe?: boolean, isTrailer?: boolean, startTime?: number } | null>(null);
  const [selectedServer, setSelectedServer] = useState('vidlink');
  const [showServerMenu, setShowServerMenu] = useState(false);
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
      id: 'vidlink', name: 'VidLink (Clean)', url: (id: string, s: string, e: string, type: string) =>
        type === 'movie' ? `https://vidlink.pro/embed/movie/${id}` : `https://vidlink.pro/embed/tv/${id}/${s}/${e}`
    },
    {
      id: 'vidsrc_to', name: 'VidSrc (.to)', url: (id: string, s: string, e: string, type: string) =>
        type === 'movie' ? `https://vidsrc.to/embed/movie/${id}` : `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
    },
    {
      id: 'vidsrc_xyz', name: 'VidSrc (.xyz)', url: (id: string, s: string, e: string, type: string) =>
        type === 'movie' ? `https://vidsrc.xyz/embed/movie/${id}` : `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`
    },
  ];

  const [currentEpisodeNum, setCurrentEpisodeNum] = useState('1');
  const { setPageLoading } = useLoadingStore();
  const { addToast } = useToastStore();

  // Detect if the id is a TMDB ID (numeric) or an Ophim slug (contains letters)
  const isNumeric = /^\d+$/.test(id);

  const { data: detail, isLoading } = useTMDBDetails(isNumeric ? id : '', type);
  const { history, addToHistory } = useStore();
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
      router.replace(`/${detail.media_type}/${id}`);
    }

    if (!isNumeric && ophimRes?.status === 'success' && ophimRes.data?.item) {
      const movie = ophimRes.data.item;
      const tmdbId = movie.tmdb?.id;
      if (tmdbId) {
        // Use TMDB type if provided by Ophim, otherwise fallback to guessing
        const movieType = movie.tmdb?.type || (movie.type === 'series' || movie.type === 'hoathinh' || movie.type === 'tvshows' ? 'tv' : 'movie');
        router.replace(`/${movieType}/${tmdbId}`);
      }
    }
  }, [isNumeric, detail?.media_type, type, id, ophimRes, router]);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const { data: seasonData, isFetching: isFetchingSeason } = useTMDBSeason(type === 'tv' && isNumeric ? id : '', selectedSeason);

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

  const handlePlay = (episodeNum: string = '1', startTime?: number, seasonNum?: number) => {
    const playSeason = seasonNum || selectedSeason;
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

    if (m3u8Url) {
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
      // Fallback to iframe overlay
      const activeServer = SERVERS.find(s => s.id === selectedServer) || SERVERS[0];
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

  if (!isNumeric) {
    if (isOphimLoading || (ophimRes?.data?.item?.tmdb?.id)) return null;
    return <OphimDetailsView slug={id} />;
  }

  if (!isLoading && !detail) {
    return (
      <div className={styles.main}>
        <div className={styles.error}>Content not found</div>
      </div>
    );
  }

  const logoUrl = detail ? tmdb.getLogoUrl(detail.images) : null;
  const title = detail ? (detail.title || detail.name) : '';
  const rating = detail?.vote_average?.toFixed(1);
  const year = (detail?.release_date || detail?.first_air_date || '').split('-')[0];

  const genres = detail?.genres || [];
  const cast = detail?.credits?.cast?.slice(0, 12) || [];
  const recommendations = detail?.recommendations?.results?.slice(0, 12) || [];
  const trailers = detail?.videos?.results?.filter((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || [];
  // Sort trailers by published_at date (newest first)
  const sortedTrailers = trailers.sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  const trailer = sortedTrailers.find((v: any) => v.iso_639_1 === 'en') || sortedTrailers[0];
  const isTrailerOnly = ophimRes?.data?.item?.status === 'trailer' ||
    ophimRes?.data?.item?.episode_current?.toLowerCase() === 'trailer';

  return (
    <>
      <Header />

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
              <div className={styles.iframeContainer} onClick={(e) => e.stopPropagation()}>
                {!playerConfig.isTrailer && (
                  <div className={styles.iframeServerSwitcher}>
                    <button
                      className={styles.serverBtn}
                      onClick={() => setShowServerMenu(!showServerMenu)}
                    >
                      <Server size={18} />
                      <span>{SERVERS.find(s => s.id === selectedServer)?.name}</span>
                    </button>

                    <AnimatePresence>
                      {showServerMenu && (
                        <motion.div
                          className={styles.serverMenuFloating}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          {SERVERS.map((s) => (
                            <button
                              key={s.id}
                              className={`${styles.serverMenuItem} ${selectedServer === s.id ? styles.activeServer : ''}`}
                              onClick={() => {
                                setSelectedServer(s.id);
                                setShowServerMenu(false);
                                const newUrl = s.url(id as string, selectedSeason.toString(), currentEpisodeNum, type as string);
                                setPlayerConfig({ ...playerConfig, src: newUrl });
                              }}
                            >
                              {s.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                <iframe
                  src={playerConfig.src}
                  className={styles.iframe}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation-by-user-activation allow-presentation"
                  referrerPolicy="origin"
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
      </AnimatePresence>

      <main className={styles.main} style={{ opacity: (!isLoading && detail) ? 1 : 0 }}>
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
              {year && <span>{year}</span>}
              {type === 'tv' && detail?.number_of_seasons && (
                <span>{detail.number_of_seasons} Seasons</span>
              )}
            </div>

            <div className={styles.genreTags}>
              {genres.map((g: any) => (
                <span key={g.id} className={styles.genreTag}>{g.name}</span>
              ))}
            </div>

            <p className={styles.description}>{detail?.overview}</p>

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
                      <div key={provider.provider_id} className={styles.providerIconWrapper} title={provider.provider_name}>
                        <img
                          src={tmdb.getImageUrl(provider.logo_path, 'w300')}
                          alt={provider.provider_name}
                          className={styles.providerIcon}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className={styles.mainActions}>
              {isTrailerOnly ? (
                <button
                  className={styles.btnTrailer}
                  onClick={() => {
                    if (trailer) {
                      setPlayerConfig({
                        src: `https://www.youtube.com/embed/${trailer.key}?autoplay=1`,
                        title: detail?.title || detail?.name || '',
                        subTitle: 'Official Trailer',
                        isIframe: true,
                        isTrailer: true
                      });
                      setShowPlayer(true);
                    } else {
                      addToast("Trailer not available on YouTube.", "error");
                    }
                  }}
                >
                  <Play size={24} fill="currentColor" />
                  <span>Watch Trailer</span>
                </button>
              ) : (
                <>
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
                      } else if (trailer) {
                        setPlayerConfig({
                          src: `https://www.youtube.com/embed/${trailer.key}?autoplay=1`,
                          title: detail?.title || detail?.name || '',
                          subTitle: 'Official Trailer',
                          isIframe: true,
                          isTrailer: true
                        });
                        setShowPlayer(true);
                      }
                    }}
                    disabled={!ophimRes?.data?.item && !isNumeric && !trailer}
                    style={{
                      opacity: (!ophimRes?.data?.item && isNumeric && isOphimLoading) ? 0.6 : 1,
                      cursor: (!ophimRes?.data?.item && isNumeric && isOphimLoading) ? 'wait' : 'pointer'
                    }}
                  >
                    <Play size={24} fill="currentColor" />
                    <span>
                      {(ophimRes?.data?.item || isNumeric)
                        ? (hasHistory ? 'Continue Watching' : 'Play')
                        : trailer
                          ? 'Play Trailer'
                          : 'Not Available'}
                    </span>
                  </button>
                </>
              )}
              <div className={styles.secondaryActions}>
                {trailer && !isTrailerOnly && (
                  <button
                    className={styles.btnTrailer}
                    onClick={() => {
                      setPlayerConfig({
                        src: `https://www.youtube.com/embed/${trailer.key}?autoplay=1`,
                        title: detail?.title || detail?.name || '',
                        subTitle: 'Official Trailer',
                        isIframe: true,
                        isTrailer: true
                      });
                      setShowPlayer(true);
                    }}
                  >
                    <Play size={24} />
                    <span>Trailer</span>
                  </button>
                )}
                <button
                  className={styles.btnWatchParty}
                  onClick={() => setIsPartyModalOpen(true)}
                >
                  <Users size={24} />
                  <span>Watch Party</span>
                </button>
                <button className={styles.btnAdd}>
                  <Plus size={24} />
                </button>
              </div>
            </div>
          </div>

          <PersonModal
            personId={personModalId}
            onClose={() => setPersonModalId(null)}
          />

          <WatchPartyModal
            isOpen={isPartyModalOpen}
            onClose={() => setIsPartyModalOpen(false)}
            peerId={id}
            onJoin={(roomId) => {
              router.push(`/watch/${type}/${id}?partyId=${roomId}`);
            }}
          />
          <motion.div
            className={styles.scrollIndicator}
            initial={{ opacity: 0 }}
            animate={{ opacity: showScrollIndicator ? 1 : 0 }}
            style={{ pointerEvents: showScrollIndicator ? 'auto' : 'none' }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
              });
            }}
          >
            <ChevronDown size={32} className={styles.scrollArrow} />
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

              {type === 'tv' && detail?.networks?.length > 0 && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Network</span>
                  <div className={styles.productionLogos}>
                    {detail.networks.slice(0, 1).map((network: any) => (
                      network.logo_path ? (
                        <div key={network.id} className={styles.infoLogoWrapper} title={network.name}>
                          <img 
                            src={tmdb.getImageUrl(network.logo_path, 'w300')} 
                            alt={network.name}
                            className={styles.infoLogo}
                          />
                        </div>
                      ) : (
                        <span key={network.id} className={styles.companyName}>{network.name}</span>
                      )
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

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Production</span>
                <div className={styles.productionLogos}>
                  {detail?.production_companies?.slice(0, 1).map((company: any) => (
                    company.logo_path ? (
                      <div key={company.id} className={styles.infoLogoWrapper} title={company.name}>
                        <img 
                          key={company.id}
                          src={tmdb.getImageUrl(company.logo_path, 'w300')} 
                          alt={company.name}
                          className={styles.infoLogo}
                        />
                      </div>
                    ) : (
                      <span key={company.id} className={styles.companyName}>{company.name}</span>
                    )
                  ))}
                </div>
              </div>
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
                <div className={styles.seasonDropdownWrapper} ref={dropdownRef}>
                  <button
                    className={styles.seasonDropdownToggle}
                    onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                    disabled={isFetchingSeason}
                  >
                    Season {selectedSeason}
                    {isFetchingSeason ? (
                      <Loader2 size={20} className={styles.spinner} />
                    ) : isSeasonDropdownOpen ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>

                  <AnimatePresence>
                    {isSeasonDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={styles.seasonDropdownMenu}
                      >
                        {Array.from({ length: detail.number_of_seasons }, (_, i) => i + 1).map(seasonNum => (
                          <button
                            key={seasonNum}
                            className={`${styles.seasonDropdownItem} ${selectedSeason === seasonNum ? styles.active : ''}`}
                            onClick={() => {
                              setSelectedSeason(seasonNum);
                              setIsSeasonDropdownOpen(false);
                            }}
                          >
                            Season {seasonNum}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className={`${styles.episodesList} ${isFetchingSeason ? styles.fetching : ''}`}>
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
                          <Play size={32} fill="#fff" />
                        </div>
                        {epHistory && epHistory.progress > 0 && (
                          <div className={styles.episodeProgressContainer}>
                            <div
                              className={styles.episodeProgressBar}
                              style={{ width: `${epHistory.progress}%` }}
                            />
                          </div>
                        )}
                        {isCurrentWatching && (
                          <div className={styles.watchingBadge}>Watching</div>
                        )}
                      </div>
                      <div className={styles.episodeInfo}>
                        <div className={styles.episodeHeader}>Episode {ep.episode_number}</div>
                        <h4 className={styles.episodeTitle}>{ep.name}</h4>
                        {ep.runtime && <p className={styles.episodeRuntime}>{ep.runtime}m</p>}
                        <p className={styles.episodeDesc}>{ep.overview || 'No description available.'}</p>
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
              <div className={styles.similarGrid}>
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
            </section>
          )}

        </div>
      </main>
    </>
  );
}
