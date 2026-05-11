'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Star, Calendar, Globe, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ophim } from '@/lib/ophim';
import { useMovieDetail } from '@/hooks/useMovie';
import styles from './MovieDetails.module.css';
import { useLoadingStore } from '@/hooks/useLoadingStore';
import Header from '@/components/layout/Header';

interface OphimDetailsViewProps {
  slug: string;
}

export default function OphimDetailsView({ slug }: OphimDetailsViewProps) {
  const router = useRouter();
  const { data: res, isLoading } = useMovieDetail(slug);
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const movie = res?.data?.item;
  const isPageReady = !isLoading && movie;
  const { setPageLoading } = useLoadingStore();

  useEffect(() => {
    setPageLoading(isLoading);
    return () => setPageLoading(false);
  }, [isLoading, setPageLoading]);

  if (!isLoading && (res?.status !== 'success' || !movie)) {
    return (
      <div className={styles.main}>
        <div className={styles.error}>Content not found in our database</div>
      </div>
    );
  }

  const episodes = movie?.episodes || [];
  const title = movie?.name || '';
  const originTitle = movie?.origin_name || '';
  const year = movie?.year;
  const description = movie?.content?.replace(/<[^>]*>?/gm, '') || 'Đang cập nhật nội dung...';
  const type = movie?.type === 'series' || movie?.type === 'hoathinh' || movie?.type === 'tvshows' ? 'tv' : 'movie';

  // OPhim images
  const backdropUrl = movie?.poster_url || movie?.thumb_url;
  const posterUrl = movie?.thumb_url || movie?.poster_url;

  return (
    <>
      <Header />


      <main className={styles.main} style={{ opacity: isPageReady ? 1 : 0 }}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.backdropWrapper}>
            {backdropUrl && (
              <img 
                src={ophim.getImageUrl(backdropUrl)} 
                alt={title}
                className={styles.backdrop}
                style={{ opacity: isImageLoaded ? 1 : 0, transition: 'opacity 1s ease' }}
                onLoad={() => setIsImageLoaded(true)}
              />
            )}
            <div className={styles.overlay} />
          </div>



        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={styles.title}>{title}</h1>
          <h2 style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '1rem' }}>{originTitle}</h2>

          <div className={styles.meta}>
            {year && (
              <span className={styles.year}>
                <Calendar size={16} style={{ marginRight: '6px' }} />
                {year}
              </span>
            )}
            <span className={styles.rating}>
              <Globe size={16} style={{ marginRight: '6px' }} />
              {movie?.country?.[0]?.name}
            </span>
            <span className={styles.qualityBadge}>
              <Film size={16} style={{ marginRight: '6px' }} />
              {movie?.quality} {movie?.lang}
            </span>
          </div>

          <div className={styles.genreTags}>
            {movie?.category?.map((g: any) => (
              <span key={g.id} className={styles.genreTag}>{g.name}</span>
            ))}
          </div>

          <p className={styles.description}>{description}</p>

          <div className={styles.mainActions}>
            <Link href={`/watch/${slug}`} className={styles.btnPlay}>
              <Play size={24} fill="currentColor" />
              <span>Watch Now</span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Details Sections */}
      <div className={styles.sections}>
        
        {/* Episodes Section */}
        {episodes.length > 0 && (
          <section className={styles.episodesSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionBar} />
              <h3 className={styles.sectionTitle}>Episodes</h3>
            </div>

            {episodes.length > 1 && (
              <select 
                className={styles.seasonSelect}
                value={selectedServerIndex}
                onChange={(e) => setSelectedServerIndex(Number(e.target.value))}
              >
                {episodes.map((server: any, i: number) => (
                  <option key={i} value={i}>{server.server_name}</option>
                ))}
              </select>
            )}

            <div className={styles.episodesList} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
              {episodes[selectedServerIndex]?.server_data?.map((ep: any, i: number) => (
                <Link 
                  key={i} 
                  href={`/watch/${slug}?episode=${ep.name}`} 
                  className={styles.episodeCard}
                  style={{ padding: '15px', justifyContent: 'center', textAlign: 'center', height: 'auto' }}
                >
                  <div className={styles.episodeNumber} style={{ position: 'static', margin: '0' }}>
                    {ep.name}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Info Section */}
        <section className={styles.castSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBar} />
            <h3 className={styles.sectionTitle}>Additional Information</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', color: '#ccc' }}>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '8px' }}>Status</h4>
              <p>{movie?.status === 'completed' ? 'Completed' : 'Updating'}</p>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '8px' }}>Episodes</h4>
              <p>{movie?.episode_current} / {movie?.episode_total}</p>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '8px' }}>Director</h4>
              <p>{movie?.director?.join(', ') || 'Updating'}</p>
            </div>
          </div>
        </section>
      </div>
      </main>
    </>
  );
}
