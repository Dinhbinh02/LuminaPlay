'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Play, 
  Trash2, 
  Heart, 
  History, 
  BarChart2, 
  Search, 
  Grid, 
  List, 
  Film, 
  Tv, 
  Clock, 
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import styles from '@/app/mylist/MyListPage.module.css';
import cwStyles from '@/components/movie/ContinueWatching.module.css';
import { useFavorites } from '@/hooks/useFavorites';
import { motion, AnimatePresence } from 'framer-motion';

type SubTab = 'watchlist' | 'history' | 'stats';
type MediaType = 'all' | 'movie' | 'tv';
type SortOption = 'recently_added' | 'az' | 'za';
type ViewMode = 'grid' | 'list';

const getPosterUrl = (posterPath: string) => {
  if (!posterPath) return '';
  if (posterPath.startsWith('http')) return posterPath;
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
};

export default function MyListView() {
  const { 
    favorites, 
    history, 
    removeFromFavorites, 
    removeFromHistory, 
    setHistory 
  } = useStore();
  const { removeFavoriteFromCloud } = useFavorites();

  // State controls
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('watchlist');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaType>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recently_added');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleRemoveFavorite = (id: string) => {
    removeFromFavorites(id);
    removeFavoriteFromCloud(id);
  };

  const handleRemoveHistory = (id: string, seasonNum?: number, episodeNum?: number) => {
    removeFromHistory(id, seasonNum, episodeNum);
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire watch history?')) {
      setHistory([]);
    }
  };

  // Helper to determine if an item is a show (TV) or a movie
  const isTVShow = (item: any) => {
    // If it has season/episode number in history, or slug contains 'tv', or title indicates show
    return !!item.seasonNum || !!item.episodeNum || item.slug?.includes('/tv/') || false;
  };

  // 1. Process & filter Watchlist
  const processedWatchlist = useMemo(() => {
    let list = [...favorites];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => item.title.toLowerCase().includes(q));
    }

    // Filter by media type
    if (mediaTypeFilter !== 'all') {
      list = list.filter(item => {
        const isTv = isTVShow(item);
        return mediaTypeFilter === 'tv' ? isTv : !isTv;
      });
    }

    // Sort options
    if (sortOption === 'az') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'za') {
      list.sort((a, b) => b.title.localeCompare(a.title));
    }
    // 'recently_added' keeps store order (most recent first)

    return list;
  }, [favorites, searchQuery, mediaTypeFilter, sortOption]);

  // 2. Process & filter History
  const processedHistory = useMemo(() => {
    let list = [...history];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => item.title.toLowerCase().includes(q));
    }
    return list;
  }, [history, searchQuery]);

  // 3. Stats calculations
  const stats = useMemo(() => {
    const totalFavorites = favorites.length;
    const totalHistory = history.length;
    
    // Completed items (progress > 85%)
    const completedItems = history.filter(item => item.progress >= 85).length;
    
    // Genre Breakdown logic (simulated/extracted dynamically from titles)
    const genresList = ["Action", "Sci-Fi", "Anime", "Drama", "Horror", "Romance"];
    const genreCounts: Record<string, number> = {};
    genresList.forEach(g => { genreCounts[g] = 0; });

    const getGenreForTitle = (title: string) => {
      const lower = title.toLowerCase();
      if (lower.includes('hoạt hình') || lower.includes('anime') || lower.includes('jojo') || lower.includes('dragon') || lower.includes('naruto') || lower.includes('conan')) return 'Anime';
      if (lower.includes('hành động') || lower.includes('hành') || lower.includes('iron man') || lower.includes('action') || lower.includes('avengers') || lower.includes('spider')) return 'Action';
      if (lower.includes('romance') || lower.includes('tình cảm') || lower.includes('hẹn hò') || lower.includes('love') || lower.includes('cưới')) return 'Romance';
      if (lower.includes('kinh dị') || lower.includes('horror') || lower.includes('ma') || lower.includes('dead') || lower.includes('quỷ')) return 'Horror';
      if (lower.includes('viễn tưởng') || lower.includes('sci-fi') || lower.includes('star wars') || lower.includes('matrix')) return 'Sci-Fi';
      
      // Deterministic fallback using hash
      let hash = 0;
      for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
      }
      return genresList[Math.abs(hash) % genresList.length];
    };

    // Count genres based on both watchlist and history
    const allTitles = [...favorites.map(f => f.title), ...history.map(h => h.title)];
    allTitles.forEach(title => {
      const genre = getGenreForTitle(title);
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    const totalCalculated = allTitles.length || 1;
    const genrePercentages = Object.entries(genreCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalCalculated) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalFavorites,
      totalHistory,
      completedItems,
      genrePercentages
    };
  }, [favorites, history]);

  // Card hover animations variants
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  return (
    <main className={styles.main}>
      <Header isSolid />
      
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Heart size={32} color="#e50914" fill="#e50914" />
            <h1>My Space</h1>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabButton} ${activeSubTab === 'watchlist' ? styles.tabButtonActive : ''}`}
            onClick={() => { setActiveSubTab('watchlist'); setSearchQuery(''); }}
          >
            {activeSubTab === 'watchlist' && (
              <motion.div 
                layoutId="activeTabHighlight" 
                className={styles.activeTabHighlight}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className={styles.tabText}>Watchlist ({favorites.length})</span>
          </button>
          <button 
            className={`${styles.tabButton} ${activeSubTab === 'history' ? styles.tabButtonActive : ''}`}
            onClick={() => { setActiveSubTab('history'); setSearchQuery(''); }}
          >
            {activeSubTab === 'history' && (
              <motion.div 
                layoutId="activeTabHighlight" 
                className={styles.activeTabHighlight}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className={styles.tabText}>
              <span className={styles.hideMobile}>Watch </span>History ({history.length})
            </span>
          </button>
          <button 
            className={`${styles.tabButton} ${activeSubTab === 'stats' ? styles.tabButtonActive : ''}`}
            onClick={() => { setActiveSubTab('stats'); setSearchQuery(''); }}
          >
            {activeSubTab === 'stats' && (
              <motion.div 
                layoutId="activeTabHighlight" 
                className={styles.activeTabHighlight}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className={styles.tabText}>
              Insights<span className={styles.hideMobile}> & Stats</span>
            </span>
          </button>
        </div>



        {/* Dynamic Sub-tab content Rendering */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: WATCHLIST */}
          {activeSubTab === 'watchlist' && (
            <motion.div
              key="watchlist-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {processedWatchlist.length === 0 ? (
                <div className={styles.empty}>
                  <p>
                    {searchQuery 
                      ? "No titles match your search in watchlist." 
                      : "Your watchlist is empty. Add some movies to watch them later!"}
                  </p>
                  {!searchQuery && <Link href="/" className={styles.browseBtn}>Browse Movies</Link>}
                </div>
              ) : (
                <div className={viewMode === 'grid' ? styles.grid : styles.listLayout}>
                  <AnimatePresence>
                    {processedWatchlist.map((item) => (
                      <motion.div 
                        key={item.id} 
                        className={viewMode === 'grid' ? styles.card : styles.listCard}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layoutId={`card-${item.id}`}
                      >
                        {viewMode === 'grid' ? (
                          /* GRID MODE */
                          <>
                            <div className={styles.posterWrapper}>
                              <img src={getPosterUrl(item.poster)} alt={item.title} className={styles.poster} />
                              <div className={styles.playOverlay}>
                                <Link href={`/watch/${item.slug || `movie/${item.id}`}`} className={styles.playBtn}>
                                  <Play size={24} fill="currentColor" />
                                </Link>
                              </div>
                            </div>
                            <div className={styles.info}>
                              <h3 className={styles.title} title={item.title}>{item.title}</h3>
                              <div className={styles.cardMeta}>
                                <span className={styles.rating}>{item.progress > 0 ? `${item.progress.toFixed(1)} ★` : '7.8 ★'}</span>
                                <span className={styles.mediaTypeIcon} title={isTVShow(item) ? "TV Show" : "Movie"}>
                                  {isTVShow(item) ? <Tv size={14} /> : <Film size={14} />}
                                </span>
                              </div>
                              <div className={styles.actions}>
                                <button 
                                  className={styles.deleteBtn}
                                  onClick={() => handleRemoveFavorite(item.id)}
                                  title="Remove from watchlist"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          /* LIST MODE */
                          <>
                            <img src={getPosterUrl(item.poster)} alt={item.title} className={styles.listPoster} />
                            <div className={styles.listInfo}>
                              <div className={styles.listTitleSection}>
                                <h3 className={styles.listTitle}>{item.title}</h3>
                                <div className={styles.listMeta}>
                                  <span className={styles.rating}>{item.progress > 0 ? `${item.progress.toFixed(1)} ★` : '7.8 ★'}</span>
                                  <span>{isTVShow(item) ? 'TV Show' : 'Movie'}</span>
                                </div>
                              </div>
                              <div className={styles.listActions}>
                                <Link href={`/watch/${item.slug || `movie/${item.id}`}`} className={styles.listPlayBtn}>
                                  <Play size={16} fill="currentColor" /> Play Now
                                </Link>
                                <button 
                                  className={styles.deleteBtn}
                                  onClick={() => handleRemoveFavorite(item.id)}
                                  title="Remove from watchlist"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: WATCH HISTORY */}
          {activeSubTab === 'history' && (
            <motion.div
              key="history-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {processedHistory.length === 0 ? (
                <div className={styles.empty}>
                  <p>
                    {searchQuery 
                      ? "No titles match your search in watch history." 
                      : "You haven't watched anything yet. Start streaming to build history!"}
                  </p>
                  {!searchQuery && <Link href="/" className={styles.browseBtn}>Browse Collection</Link>}
                </div>
              ) : (
                <>
                  <div className={styles.historyActionsRow}>
                    <span style={{ color: '#888', fontSize: '14px' }}>Showing {processedHistory.length} recently watched items</span>
                    <button onClick={handleClearAllHistory} className={styles.clearAllBtn}>
                      Clear All
                    </button>
                  </div>

                  <div className={viewMode === 'grid' ? styles.historyGrid : styles.listLayout}>
                    <AnimatePresence>
                      {processedHistory.map((item, idx) => (
                        <motion.div 
                          key={`${item.id}-${idx}`} 
                          className={viewMode === 'grid' ? cwStyles.cardWrapper : styles.listCard}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          style={viewMode === 'grid' ? { width: '100%', flex: '1 1 auto' } : undefined}
                        >
                          {viewMode === 'grid' ? (
                            /* GRID MODE: EXACT COPY OF CONTINUE WATCHING CARD */
                            <Link 
                              href={`/${isTVShow(item) ? 'tv' : 'movie'}/${item.id}`} 
                              className={cwStyles.card}
                            >
                              <div className={cwStyles.thumbnailWrapper}>
                                <Image
                                  src={getPosterUrl(item.poster)}
                                  alt={item.title}
                                  fill
                                  className={cwStyles.thumbnail}
                                  sizes="(max-width: 768px) 240px, 300px"
                                  quality={70}
                                  unoptimized={item.poster.startsWith('http')}
                                />
                                <div className={cwStyles.overlay}>
                                  <Play size={32} fill="white" className={cwStyles.playIcon} />
                                </div>
                                <div className={cwStyles.progressBar}>
                                  <div
                                    className={cwStyles.progressFill}
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                              </div>
                              <div className={cwStyles.info}>
                                <h3 className={cwStyles.movieTitle}>{item.title}</h3>
                                <div className={cwStyles.metaRow}>
                                  <p className={cwStyles.meta}>
                                    {item.seasonNum && item.episodeNum 
                                      ? `S${item.seasonNum} : E${item.episodeNum}`
                                      : `${Math.round(item.progress)}% watched`}
                                  </p>
                                  <button 
                                    className={styles.deleteBtn}
                                    style={{ 
                                      padding: '2px', 
                                      color: 'rgba(255, 255, 255, 0.4)',
                                      marginLeft: 'auto',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      zIndex: 2
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRemoveHistory(item.id, item.seasonNum, item.episodeNum);
                                    }}
                                    title="Remove from history"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </Link>
                          ) : (
                            /* LIST MODE */
                            <>
                              <Link 
                                href={`/${isTVShow(item) ? 'tv' : 'movie'}/${item.id}`}
                                className={styles.listCardLink}
                              >
                                <img src={getPosterUrl(item.poster)} alt={item.title} className={styles.listPoster} />
                                <div className={styles.historyListInfo}>
                                  <div className={styles.listTitleSection}>
                                    <h3 className={styles.listTitle}>{item.title}</h3>
                                    <div className={styles.listMeta}>
                                      {item.seasonNum && item.episodeNum ? (
                                        <span className={styles.episodeInfo}>Season {item.seasonNum} Episode {item.episodeNum}</span>
                                      ) : (
                                        <span>Movie</span>
                                      )}
                                      <span>{Math.round(item.progress)}% watched</span>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                              <div className={styles.listCardActions}>
                                <button 
                                  className={styles.deleteBtn}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveHistory(item.id, item.seasonNum, item.episodeNum);
                                  }}
                                  title="Remove from history"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* TAB 3: STATS & INSIGHTS */}
          {activeSubTab === 'stats' && (
            <motion.div
              key="stats-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* Stat cards grid */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <Heart size={24} fill="currentColor" />
                  </div>
                  <div className={styles.statDetails}>
                    <span className={styles.statValue}>{stats.totalFavorites}</span>
                    <span className={styles.statLabel}>Watchlist Size</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <Clock size={24} />
                  </div>
                  <div className={styles.statDetails}>
                    <span className={styles.statValue}>{stats.totalHistory}</span>
                    <span className={styles.statLabel}>Items Watched</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <CheckCircle size={24} />
                  </div>
                  <div className={styles.statDetails}>
                    <span className={styles.statValue}>{stats.completedItems}</span>
                    <span className={styles.statLabel}>Completed Streamings</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <TrendingUp size={24} />
                  </div>
                  <div className={styles.statDetails}>
                    <span className={styles.statValue}>
                      {stats.totalFavorites > 0 
                        ? `${Math.round((stats.completedItems / (stats.totalHistory || 1)) * 100)}%` 
                        : '0%'}
                    </span>
                    <span className={styles.statLabel}>Completion Rate</span>
                  </div>
                </div>
              </div>

              {/* Genre chart card */}
              <div className={styles.chartCard}>
                <h2>Genre Breakdown</h2>
                {favorites.length === 0 && history.length === 0 ? (
                  <p style={{ color: '#666', textAlign: 'center', padding: '20px 0' }}>
                    Add titles to your watchlist or watch content to view your custom genre profile.
                  </p>
                ) : (
                  <div className={styles.genreChart}>
                    {stats.genrePercentages.map((genre) => (
                      <div key={genre.name} className={styles.chartRow}>
                        <span className={styles.chartLabel} title={genre.name}>
                          {genre.name}
                        </span>
                        <div className={styles.chartBarWrapper}>
                          <motion.div 
                            className={styles.chartBar}
                            initial={{ width: 0 }}
                            animate={{ width: `${genre.percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                        <span className={styles.chartValue}>
                          {genre.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
