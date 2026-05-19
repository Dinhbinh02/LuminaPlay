'use client';

import React, { useState, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams, useParams } from 'next/navigation';
import { tmdb } from '@/lib/tmdb';
import MovieSection from '@/components/movie/MovieSection';
import Header from '@/components/layout/Header';
import Pagination from '@/components/ui/Pagination';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './ProviderPage.module.css';

interface ProviderPageProps {
  params: Promise<{ id: string }>;
}

type FilterType = 'all' | 'movie' | 'tv';
type SortType = 'popularity.desc' | 'primary_release_date.desc';

const GENRE_MAP: Record<string, string> = {
  '28': 'Action',
  '12': 'Adventure',
  '16': 'Animation',
  '35': 'Comedy',
  '80': 'Crime',
  '99': 'Documentary',
  '18': 'Drama',
  '10751': 'Family',
  '14': 'Fantasy',
  '36': 'History',
  '27': 'Horror',
  '10402': 'Music',
  '9648': 'Mystery',
  '10749': 'Romance',
  '878': 'Sci-Fi',
  '53': 'Thriller',
  '10752': 'War',
  '37': 'Western',
  '10759': 'Action & Adventure',
  '10762': 'Kids',
  '10763': 'News',
  '10764': 'Reality',
  '10765': 'Sci-Fi & Fantasy',
  '10766': 'Soap',
  '10767': 'Talk',
  '10768': 'War & Politics'
};

export default function ProviderPage({ params: paramsPromise }: ProviderPageProps) {
  const params = useParams();
  const id = params?.id as string;
  const searchParams = useSearchParams();
  const urlType = searchParams.get('type'); // 'company' or 'network' or 'genre' or 'special'
  
  const { scrollY } = useScroll();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeSort, setActiveSort] = useState<SortType>('primary_release_date.desc');
  const [page, setPage] = useState(1);

  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);
  const contentY = useTransform(scrollY, [0, 400], [0, -100]);

  const { data: detailData, isLoading: isDetailLoading } = useQuery({
    queryKey: ['tmdb', 'provider-detail', id, urlType],
    queryFn: async () => {
      if (urlType === 'genre') {
        const genreName = GENRE_MAP[id] || 'Genre';
        return {
          name: `${genreName} Collection`,
          logo: '',
          color: '#E50914',
          gradient: 'linear-gradient(to bottom, rgba(229, 9, 20, 0.25) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)',
          customTagline: `Step into worlds of ${genreName.toLowerCase()}. Browse top movies and TV shows.`
        };
      }

      if (urlType === 'special') {
        if (id === 'trending') {
          return {
            name: 'Trending Collection',
            logo: '',
            color: '#E1118C',
            gradient: 'linear-gradient(to bottom, rgba(225, 17, 140, 0.25) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)',
            customTagline: 'Keep up with the most popular movies and shows today.'
          };
        }
        if (id === 'top_rated') {
          return {
            name: 'Top Rated Collection',
            logo: '',
            color: '#8D67AB',
            gradient: 'linear-gradient(to bottom, rgba(141, 103, 171, 0.25) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)',
            customTagline: 'Explore the highest critically-acclaimed movies and TV series.'
          };
        }
      }

      // Configuration for major providers
      const providerConfigs: Record<string, { color: string, gradient?: string, tagline?: string, className?: string }> = {
        '8': { // Netflix
          color: '#E50914',
          gradient: 'linear-gradient(to bottom, rgba(229, 9, 20, 0.2) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)',
          tagline: 'Stream the world\'s most popular stories. Only on Netflix.'
        },
        '350': { // Apple TV+
          color: '#ffffff',
          gradient: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)',
          tagline: 'All Apple Originals. Produced by the world\'s greatest storytellers.'
        },
        '384': { // HBO
          color: '#9945FF',
          gradient: 'linear-gradient(to bottom, rgba(153, 69, 255, 0.15) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)',
          tagline: 'The home of groundbreaking series and blockbuster movies.'
        },
        '1899': { // Max
          color: '#002BE7',
          gradient: 'linear-gradient(to bottom, rgba(0, 43, 231, 0.2) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)',
          tagline: 'The one to watch for HBO, DC, and the best of discovery.'
        },
        '337': { // Disney+
          color: '#0063e5',
          gradient: 'linear-gradient(to bottom, rgba(0, 99, 229, 0.2) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)',
          tagline: 'The best stories in the world, all in one place.'
        },
        '1024': { // Amazon Prime Video
          color: '#00A8E1',
          gradient: 'linear-gradient(to bottom, rgba(0, 168, 225, 0.15) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)',
          tagline: 'Watch movies and TV shows, including award-winning Amazon Originals.'
        }
      };

      let name = '';
      let logo = '';
      let lookupId = id;

      // Map common Watch Provider IDs to Company IDs for better logo discovery
      if (urlType === 'watch') {
        lookupId = tmdb.getCompanyIdFromProvider(id);
      }

      // Parallelize basic details and image discovery
      const [basicRes, imagesRes] = await Promise.allSettled([
        // 1. Fetch Basic Details
        (async () => {
          if (urlType === 'watch') {
            const providers = await tmdb.getWatchProviders('movie');
            return providers?.results?.find((p: any) => p.provider_id.toString() === id);
          } else if (urlType === 'network') {
            return tmdb.fetch(`network/${id}`);
          } else {
            return tmdb.fetch(`company/${id}`);
          }
        })(),
        // 2. Fetch High-Quality Logos using Company or Network Images API
        (async () => {
          // Try company images first, then network if that fails or if it's a known network ID
          const isKnownNetwork = ['453', '49', '213', '2552', '3353', '1024'].includes(lookupId);
          if (isKnownNetwork) {
            return tmdb.getNetworkImages(lookupId);
          } else {
            try {
              return await tmdb.getCompanyImages(lookupId);
            } catch (e) {
              return tmdb.getNetworkImages(lookupId);
            }
          }
        })()
      ]);

      // Process Basic Results
      if (basicRes.status === 'fulfilled' && basicRes.value) {
        const data: any = basicRes.value;
        name = data.provider_name || data.name || '';
        logo = data.logo_path || '';
      }

      // Process Image Results (High Quality Override)
      if (imagesRes.status === 'fulfilled' && imagesRes.value?.logos?.length > 0) {
        const bestLogo = [...imagesRes.value.logos].sort((a, b) => {
          const ratioA = a.aspect_ratio || 1;
          const ratioB = b.aspect_ratio || 1;
          const scoreA = ratioA * (a.vote_count || 1);
          const scoreB = ratioB * (b.vote_count || 1);
          return scoreB - scoreA;
        })[0];
        
        if (bestLogo) {
          logo = tmdb.getImageUrl(bestLogo.file_path, 'original', 'negate,000,666');
        }
      } else if (logo && !logo.startsWith('http')) {
        // Fallback to basic logo from details
        logo = tmdb.getImageUrl(logo, 'original', 'negate,000,666');
      }

      const config = providerConfigs[id] || providerConfigs[lookupId] || { color: '#E50914' };

      if (name) return { 
        name, 
        logo, 
        color: config.color,
        gradient: config.gradient,
        customTagline: config.tagline
      };
      return null;
    },
    staleTime: 1000 * 60 * 60 // 1 hour
  });

  const providerName = detailData?.name || '';
  const providerLogo = detailData?.logo || '';
  const providerBrandColor = detailData?.color || '#E50914';
  const tagline = detailData?.customTagline || (detailData?.name 
    ? `Explore the best originals and exclusives from ${detailData.name}.`
    : `Explore the best originals and exclusives from this provider.`);

  const { data, isLoading } = useQuery({
    queryKey: ['tmdb', 'provider-results', id, activeFilter, activeSort, page, urlType],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const requests: any[] = [];

      if (urlType === 'genre') {
        let movieParams: any = { page: page.toString(), sort_by: activeSort, with_genres: id, 'primary_release_date.lte': today, 'vote_count.gte': '5' };
        let tvParams: any = { page: page.toString(), sort_by: activeSort === 'primary_release_date.desc' ? 'first_air_date.desc' : 'popularity.desc', with_genres: id, 'first_air_date.lte': today, 'vote_count.gte': '5' };
        
        if (activeFilter === 'all' || activeFilter === 'movie') requests.push(tmdb.discover('movie', movieParams));
        if (activeFilter === 'all' || activeFilter === 'tv') requests.push(tmdb.discover('tv', tvParams));
      } else if (urlType === 'special') {
        if (id === 'trending') {
          if (activeFilter === 'all' || activeFilter === 'movie') requests.push(tmdb.fetch('/trending/movie/week', { page: page.toString() }));
          if (activeFilter === 'all' || activeFilter === 'tv') requests.push(tmdb.fetch('/trending/tv/week', { page: page.toString() }));
        } else if (id === 'top_rated') {
          if (activeFilter === 'all' || activeFilter === 'movie') requests.push(tmdb.getTopRated('movie', page));
          if (activeFilter === 'all' || activeFilter === 'tv') requests.push(tmdb.getTopRated('tv', page));
        }
      } else {
        let movieParams: any = { page: page.toString(), sort_by: activeSort, 'primary_release_date.lte': today, 'vote_count.gte': '5' };
        let tvParams: any = { page: page.toString(), sort_by: activeSort === 'primary_release_date.desc' ? 'first_air_date.desc' : 'popularity.desc', 'first_air_date.lte': today, 'vote_count.gte': '5' };

        if (urlType === 'watch') {
          movieParams.with_watch_providers = id;
          movieParams.watch_region = 'US';
          tvParams.with_watch_providers = id;
          tvParams.watch_region = 'US';
        } else if (urlType === 'company') {
          movieParams.with_companies = id;
          tvParams.with_companies = id;
        } else if (urlType === 'network') {
          tvParams.with_networks = id;
        } else {
          movieParams.with_companies = id;
          tvParams.with_networks = id;
        }

        if (activeFilter === 'all' || activeFilter === 'movie') requests.push(tmdb.discover('movie', movieParams));
        if (activeFilter === 'all' || activeFilter === 'tv') requests.push(tmdb.discover('tv', tvParams));
      }

      const responses = await Promise.all(requests);
      
      let combined: any[] = [];
      let totalResults = 0;

      if (activeFilter === 'all') {
        const [movies, tv] = responses;
        const movieResults = (movies?.results || []).map((m: any) => ({ ...m, media_type: 'movie' }));
        const tvResults = (tv?.results || []).map((t: any) => ({ ...t, media_type: 'tv' }));
        combined = [...movieResults, ...tvResults];
        totalResults = (movies?.total_results || 0) + (tv?.total_results || 0);
      } else {
        const [results] = responses;
        combined = (results?.results || []).map((r: any) => ({ ...r, media_type: activeFilter }));
        totalResults = results?.total_results || 0;
      }

      // Sort combined results
      combined.sort((a, b) => {
        if (activeSort === 'popularity.desc') {
          return (b.popularity || 0) - (a.popularity || 0);
        } else {
          const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
          const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
          return dateB - dateA;
        }
      });

      // Ensure exactly 20 results per page for consistent pagination UI
      return {
        results: combined.slice(0, 20),
        totalItems: totalResults,
      };
    },
    staleTime: 1000 * 60 * 60,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const firstMovie = data?.results[0];

  return (
    <div className={styles.container}>
      <Header />
      
      <section className={styles.hero}>
        <motion.div 
          className={styles.heroBackground}
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          {firstMovie?.backdrop_path && (
            <img 
              src={tmdb.getImageUrl(firstMovie.backdrop_path, 'original')} 
              alt="" 
              className={styles.backdropImage}
            />
          )}
          <div 
            className={styles.heroGradient} 
            style={{ 
              background: detailData?.gradient ? `${detailData.gradient}, radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.9) 100%), linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)` : undefined
            }} 
          />
        </motion.div>
        
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={styles.brandContainer}
          >
            {isDetailLoading ? (
              <div className={styles.brandSkeleton}>
                <div className={styles.logoSkeleton} />
                <div className={styles.taglineSkeleton} />
              </div>
            ) : (
              <>
                {providerLogo ? (
                  <img 
                    src={providerLogo} 
                    alt={providerName} 
                    className={styles.providerLogo} 
                  />
                ) : (
                  <h1 className={styles.providerTitle}>{providerName}</h1>
                )}
              </>
            )}
          </motion.div>
        </div>
      </section>

      <motion.main 
        className={styles.content}
        style={{ y: contentY }}
      >
        <div className={styles.sectionHeader}>
          <h2 className={styles.gridTitle}>
            <span className={styles.accent} style={{ backgroundColor: providerBrandColor }} />
            {providerName.endsWith('Collection') ? providerName : `${providerName} Collection`}
          </h2>
          
          <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
              <button 
                className={activeFilter === 'all' ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => { setActiveFilter('all'); setPage(1); }}
              >
                All
              </button>
              <button 
                className={activeFilter === 'movie' ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => { setActiveFilter('movie'); setPage(1); }}
              >
                Movies
              </button>
              <button 
                className={activeFilter === 'tv' ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => { setActiveFilter('tv'); setPage(1); }}
              >
                TV Shows
              </button>
            </div>
            
            <div className={styles.vSeparator} />
            
            <div className={styles.filterGroup}>
              <button 
                className={activeSort === 'popularity.desc' ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => { setActiveSort('popularity.desc'); setPage(1); }}
              >
                Trending
              </button>
              <button 
                className={activeSort === 'primary_release_date.desc' ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => { setActiveSort('primary_release_date.desc'); setPage(1); }}
              >
                Latest
              </button>
            </div>
          </div>
        </div>

        <MovieSection 
          title="" 
          movies={data?.results}
          gridMode={true} 
        />

        <div className={styles.paginationSection}>
          <Pagination 
            currentPage={page}
            totalItems={data?.totalItems || 0}
            itemsPerPage={activeFilter === 'all' ? 40 : 20}
            onPageChange={handlePageChange}
          />
        </div>
      </motion.main>
    </div>
  );
}
