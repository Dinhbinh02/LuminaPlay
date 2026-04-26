'use client';

import React, { useEffect, useState } from 'react';
import Header from "@/components/layout/Header";
import Hero from "@/components/movie/Hero";
import MovieSection from "@/components/movie/MovieSection";
import ContinueWatching from "@/components/movie/ContinueWatching";
import { useMovieList } from "@/hooks/useMovie";
import { ophim } from "@/lib/ophim";
import styles from './page.module.css';

function HistorySkeleton() {
  return (
    <div className={styles.historySkeleton}>
      <div className={styles.historySkeletonTitle} />
      <div className={styles.historySkeletonList}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.historySkeletonCard} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: heroData, isLoading: isHeroLoading } = useMovieList('phim-moi', 1, 20);

  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryChecked, setIsHistoryChecked] = useState(false);

  useEffect(() => {
    const watchHistory = localStorage.getItem('watch_history');
    if (watchHistory) {
      try {
        setHistory(JSON.parse(watchHistory).slice(0, 10));
      } catch (e) {
        console.error("Failed to parse watch history", e);
      }
    }
    setIsHistoryChecked(true);
  }, []);

  // Filter and sort for best hero movies: High rating (> 7) and both image assets
  const heroMovies = heroData?.data?.items
    ?.filter((item: any) => {
      const rating = item.tmdb?.vote_average || item.imdb?.vote_average || 0;
      return item.poster_url && item.thumb_url && rating >= 7;
    })
    ?.sort((a: any, b: any) => {
      const ratingA = a.tmdb?.vote_average || a.imdb?.vote_average || 0;
      const ratingB = b.tmdb?.vote_average || b.imdb?.vote_average || 0;
      return ratingB - ratingA; // Highest rating first
    })
    ?.slice(0, 6)
    ?.map((item: any, index: number) => ({
      title: item.name,
      description: item.origin_name,
      backdrop: ophim.getImageUrl(item.poster_url, heroData?.data?.APP_DOMAIN_CDN_IMAGE),
      poster: ophim.getImageUrl(item.thumb_url, heroData?.data?.APP_DOMAIN_CDN_IMAGE),
      slug: item.slug,
      quality: item.quality,
      year: item.year,
      lang: item.lang,
      genres: item.category?.map((c: any) => ({ name: c.name, slug: c.slug })) || [],
      rating: item.tmdb?.vote_average || item.imdb?.vote_average,
      rank: index + 1,
      episode: item.episode_current
    })) || [];

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <Header />

      {isHeroLoading ? (
        <div className={styles.heroLoading} />
      ) : (
        <Hero movies={heroMovies} />
      )}

      <div className={styles.contentWrapper}>
        {isHistoryChecked && history.length > 0 && (
          <ContinueWatching movies={history} />
        )}
        {!isHistoryChecked && (
          <HistorySkeleton />
        )}

        {/* Dynamic Sections with Infinite Scroll */}
        <MovieSection title="Trending Now" type="danh-sach" slug="phim-moi" />
        <MovieSection title="Cinema Movies" type="danh-sach" slug="phim-chieu-rap" />

        <MovieSection title="TV Series" type="danh-sach" slug="phim-bo" />

        <MovieSection title="Movies" type="danh-sach" slug="phim-le" />

        <MovieSection title="Korean TV Dramas" type="quoc-gia" slug="han-quoc" />

        <MovieSection title="Anime" type="danh-sach" slug="hoat-hinh" params={{ country: 'nhat-ban' }} />

        <MovieSection title="Chinese Dramas" type="quoc-gia" slug="trung-quoc" />

        <MovieSection title="Hollywood Hits" type="quoc-gia" slug="au-my" />

        <MovieSection title="Thai Dramas" type="quoc-gia" slug="thai-lan" />

        <MovieSection title="Action & Adventure" type="the-loai" slug="hanh-dong" />

        <MovieSection title="Sci-Fi & Fantasy" type="the-loai" slug="vien-tuong" />

        <MovieSection title="Horror & Thriller" type="the-loai" slug="kinh-di" />

        <MovieSection title="Romance" type="the-loai" slug="tinh-cam" />

        <MovieSection title="Comedy" type="the-loai" slug="hai-huoc" />

        <MovieSection title="Reality & Variety TV" type="danh-sach" slug="tv-shows" />

        <MovieSection title="Coming Soon" type="danh-sach" slug="phim-sap-chieu" />
      </div>


    </main>
  );
}
