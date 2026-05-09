'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Users, Plus, Star, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { tmdb } from '@/lib/tmdb';
import { useTMDBDetails, useTMDBSeason, useMovieDetail, useOphimMapping } from '@/hooks/useMovie';
import styles from './MovieDetails.module.css';
import OphimDetailsView from './OphimDetailsView';
import { useLoadingStore } from '@/hooks/useLoadingStore';
import Header from '@/components/layout/Header';
import WatchPartyModal from './WatchPartyModal';
import VideoPlayer from '@/components/player/VideoPlayer';
import { useStore } from '@/store/useStore';
import { useSyncHistory } from '@/hooks/useSyncHistory';

interface DetailsViewProps {
  id: string;
  type: 'movie' | 'tv';
}

export default function DetailsView({ id, type }: DetailsViewProps) {
  const router = useRouter();
  
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerConfig, setPlayerConfig] = useState<{src: string, title: string, subTitle: string, isIframe?: boolean, startTime?: number} | null>(null);
  const [currentEpisodeNum, setCurrentEpisodeNum] = useState('1');
  const { setPageLoading } = useLoadingStore();

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
  const yearTMDB = (detail?.release_date || detail?.first_air_date || '').split('-')[0];

  const { data: mappingSlug, isLoading: isMappingLoading } = useOphimMapping(
    titleTMDB,
    yearTMDB,
    originalTitleTMDB,
    type === 'tv' ? selectedSeason.toString() : undefined
  );

  const finalSlug = isNumeric ? mappingSlug : id;
  const { data: ophimRes, isLoading: isOphimLoading } = useMovieDetail(finalSlug || '');
  
  useEffect(() => {
    if (!isNumeric && ophimRes?.status === 'success' && ophimRes.data?.item) {
      const movie = ophimRes.data.item;
      const tmdbId = movie.tmdb?.id;
      if (tmdbId) {
        const movieType = movie.type === 'series' || movie.type === 'hoathinh' || movie.type === 'tvshows' ? 'tv' : 'movie';
        router.replace(`/${movieType}/${tmdbId}`);
      }
    }
  }, [isNumeric, ophimRes, router]);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const { data: seasonData, isFetching: isFetchingSeason } = useTMDBSeason(type === 'tv' && isNumeric ? id : '', selectedSeason);

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

    if (!m3u8Url && type === 'tv') {
      return;
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
      // Fallback to iframe overlay (e.g. Vidsrc)
      const embedUrl = type === 'movie' 
        ? `https://vidsrc.me/embed/movie?tmdb=${id}`
        : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${playSeason}&episode=${episodeNum}`;
      
      setPlayerConfig({
        src: embedUrl,
        title: detail?.title || detail?.name || movieData?.name || '',
        subTitle: displaySubTitle,
        isIframe: true
      });
      setShowPlayer(true);
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

  return (
    <>
      <Header />

      <AnimatePresence>
        {showPlayer && playerConfig && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className={styles.playerOverlay}
          >
            {playerConfig.isIframe ? (
              <div className={styles.iframeContainer}>
                <div className={styles.iframeTopBar}>
                  <button className={styles.iframeBackBtn} onClick={() => setShowPlayer(false)}>
                    <ArrowLeft size={32} />
                  </button>
                  <div className={styles.iframeInfo}>
                    <div className={styles.iframeTitle}>{playerConfig.title}</div>
                    <div className={styles.iframeSubTitle}>{playerConfig.subTitle}</div>
                  </div>
                </div>
                <iframe 
                  src={playerConfig.src} 
                  className={styles.iframe} 
                  allowFullScreen 
                  allow="autoplay; encrypted-media"
                />
              </div>
            ) : (
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
                episodes={seasonData?.episodes}
                currentEpisode={parseInt(currentEpisodeNum)}
                onEpisodeSelect={handlePlay}
                onNext={
                  seasonData?.episodes?.some((ep: any) => ep.episode_number === parseInt(currentEpisodeNum) + 1)
                    ? () => handlePlay((parseInt(currentEpisodeNum) + 1).toString())
                    : undefined
                }
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main className={styles.main} style={{ opacity: (!isLoading && detail) ? 1 : 0 }}>
        <section className={styles.hero}>
          <div className={styles.backdropWrapper}>
            {detail?.backdrop_path && (
              <img 
                src={tmdb.getImageUrl(detail.backdrop_path, 'original')} 
                alt={title}
                className={styles.backdrop}
                style={{ opacity: isImageLoaded ? 1 : 0, transition: 'opacity 1s ease' }}
                onLoad={() => setIsImageLoaded(true)}
              />
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
              {year && <span>{year}</span>}
              {rating && (
                <span className={styles.rating}>
                  <Star size={16} fill="currentColor" />
                  {rating}
                </span>
              )}
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

            <div className={styles.mainActions}>
              <button 
                className={styles.btnPlay}
                onClick={() => {
                  const trailer = detail?.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
                  if (ophimRes?.data?.item) {
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
                      isIframe: true
                    });
                    setShowPlayer(true);
                  }
                }}
                disabled={!ophimRes?.data?.item && !detail?.videos?.results?.some((v: any) => v.type === 'Trailer')}
                style={{ 
                  opacity: (!ophimRes?.data?.item && (isOphimLoading || (isNumeric && !mappingSlug))) ? 0.6 : 1, 
                  cursor: (!ophimRes?.data?.item && (isOphimLoading || (isNumeric && !mappingSlug))) ? 'wait' : 'pointer' 
                }}
              >
                <Play size={24} fill="currentColor" />
                <span>
                  {(!ophimRes?.data?.item && (isOphimLoading || (isNumeric && !mappingSlug))) 
                    ? 'Loading...' 
                    : ophimRes?.data?.item 
                      ? (hasHistory ? 'Continue Watching' : 'Play')
                      : detail?.videos?.results?.some((v: any) => v.type === 'Trailer') 
                        ? 'Play Trailer' 
                        : 'Not Available'}
                </span>
              </button>
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

          <WatchPartyModal 
            isOpen={isPartyModalOpen}
            onClose={() => setIsPartyModalOpen(false)}
            peerId={id}
            onJoin={(roomId) => {
              router.push(`/watch/${type}/${id}?partyId=${roomId}`);
            }}
          />
        </section>

        <div className={styles.sections}>
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
                  // Only highlight the ABSOLUTE LATEST watched episode as "Watching"
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

          {cast.length > 0 && (
            <section className={styles.castSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionBar} />
                <h3 className={styles.sectionTitle}>Actors</h3>
              </div>
              <div className={styles.castGrid}>
                {cast.map((person: any) => (
                  <Link key={person.id} href={`/person/${person.id}`} className={styles.castCard}>
                    <img 
                      src={tmdb.getPersonImage(person.profile_path) || 'https://via.placeholder.com/185x278?text=No+Image'} 
                      alt={person.name}
                      className={styles.castAvatar}
                    />
                    <div className={styles.castInfo}>
                      <h4>{person.name}</h4>
                      <p>{person.character}</p>
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
