'use client';

import React, { useEffect, useState } from 'react';
import Header from "@/components/layout/Header";
import Hero from "@/components/movie/Hero";
import MovieSection from "@/components/movie/MovieSection";
import ContinueWatching from "@/components/movie/ContinueWatching";
import { useMovieList } from "@/hooks/useMovie";
import { ophim } from "@/lib/ophim";
import styles from './page.module.css';

export default function Home() {
  // Hero Section - Keep this for the top slider
  const { data: heroData, isLoading: isHeroLoading } = useMovieList('phim-moi', 1, 5);
  
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const watchHistory = localStorage.getItem('watch_history');
    if (watchHistory) {
      try {
        setHistory(JSON.parse(watchHistory).slice(0, 10));
      } catch (e) {
        console.error("Failed to parse watch history", e);
      }
    }
  }, []);

  const heroMovies = heroData?.data?.items?.map((item: any, index: number) => ({
    title: item.name,
    description: item.origin_name,
    backdrop: ophim.getImageUrl(item.poster_url, heroData?.data?.APP_DOMAIN_CDN_IMAGE),
    poster: ophim.getImageUrl(item.thumb_url, heroData?.data?.APP_DOMAIN_CDN_IMAGE),
    slug: item.slug,
    quality: item.quality,
    year: item.year,
    lang: item.lang,
    genres: item.category?.map((c: any) => c.name) || [],
    rating: item.tmdb?.vote_average || item.imdb?.vote_average,
    rank: index + 1,
    episode: item.episode_current
  })) || [];

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#050505' }}>
      <Header />

      {isHeroLoading ? (
        <div style={{ height: '85vh', backgroundColor: '#111' }} />
      ) : (
        <Hero movies={heroMovies} />
      )}

      <div className={styles.contentWrapper}>
        {history.length > 0 && (
          <ContinueWatching movies={history} />
        )}

        {/* Dynamic Sections with Infinite Scroll */}
        <MovieSection title="Trending Now" type="danh-sach" slug="phim-chieu-rap" />
        
        <MovieSection title="Korean TV Dramas" type="quoc-gia" slug="han-quoc" />
        
        <MovieSection title="Anime Favorites" type="danh-sach" slug="hoat-hinh" params={{ country: 'nhat-ban' }} />

        <MovieSection title="Chinese Dramas" type="quoc-gia" slug="trung-quoc" />

        <MovieSection title="Hollywood Hits" type="quoc-gia" slug="au-my" />

        <MovieSection title="Action & Adventure" type="the-loai" slug="hanh-dong" />

        <MovieSection title="Sci-Fi & Fantasy" type="the-loai" slug="vien-tuong" />

        <MovieSection title="Horror & Thriller" type="the-loai" slug="kinh-di" />

        <MovieSection title="Historical Dramas" type="the-loai" slug="co-trang" />

        <MovieSection title="Reality & Variety TV" type="danh-sach" slug="tv-shows" />

        <MovieSection title="Coming Soon" type="danh-sach" slug="phim-sap-chieu" />
      </div>

      <footer style={{ padding: '80px 4%', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
        <p>© 2026 LUMINA PLAY. All rights reserved.</p>
      </footer>
    </main>
  );
}
