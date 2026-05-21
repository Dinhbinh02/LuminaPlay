'use client';

import React, { useEffect, useState } from 'react';
import Header from "@/components/layout/Header";
import Hero from "@/components/movie/Hero";
import MovieSection from "@/components/movie/MovieSection";
import TopTrendingSection from "@/components/movie/TopTrendingSection";
import ContinueWatching from "@/components/movie/ContinueWatching";
import {
  useRegionalTrending,
  useTrendingWithLogos,
  useInfiniteTMDBRecommendations,
  useGeoLocation,
  useInfiniteTMDBPopular,
  useInfiniteTMDBByGenre,
  useInfiniteNetflixContent,
  useInfiniteHBOContent,
  useInfiniteAppleContent
} from "@/hooks/useMovie";
import { tmdb } from "@/lib/tmdb";
import styles from '@/app/page.module.css';
import { useStore } from "@/store/useStore";
import LazySection from "@/components/layout/LazySection";
import { useLoadingStore } from "@/hooks/useLoadingStore";

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

export default function HomeView() {
  const { data: geo } = useGeoLocation();
  const { data: heroData, isLoading: isHeroLoading } = useTrendingWithLogos('all', 6, geo?.countryCode);
  const { hasLoadedInitial, markInitialLoaded, setInitialProgress } = useLoadingStore();

  // Simple static mapping for TMDB genre IDs
  const tmdbGenres: Record<number, string> = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
    10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "Politics"
  };

  // Hero movies from TMDB trending with logos
  const heroMovies = heroData?.map((item: any, index: number) => {
    const mappedGenres = (item.genre_ids || []).map((id: number) => ({
      name: tmdbGenres[id] || "Unknown",
      slug: id.toString()
    })).filter((g: any) => g.name !== "Unknown");

    return {
      id: item.id,
      title: item.title || item.name,
      description: item.overview,
      backdrop: item.textless_backdrop || tmdb.getImageUrl(item.backdrop_path, 'original'),
      poster: tmdb.getImageUrl(item.poster_path, 'original'),
      textless_poster: item.textless_poster || null,
      logo: item.logo,
      media_type: item.media_type || (item.title ? 'movie' : 'tv'),
      year: new Date(item.release_date || item.first_air_date).getFullYear(),
      rating: item.vote_average,
      rank: index + 1,
      genres: mappedGenres
    };
  }) || [];

  // Simulate progress from 10% to 35% while fetching API
  useEffect(() => {
    if (hasLoadedInitial) return;

    setInitialProgress(10);

    const interval = setInterval(() => {
      setInitialProgress((prev) => {
        if (prev >= 35) {
          clearInterval(interval);
          return 35;
        }
        return prev + 2;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [hasLoadedInitial, setInitialProgress]);

  // Preload top 3 hero images
  useEffect(() => {
    if (hasLoadedInitial) return;

    if (heroMovies.length > 0) {
      const targetCount = Math.min(3, heroMovies.length);
      const imagesToPreload = heroMovies.slice(0, targetCount);
      
      let loadedCount = 0;
      const handleImageLoad = () => {
        loadedCount++;
        // Calculate progress starting from 40% and ending at 100%
        const currentProgress = 40 + Math.round((loadedCount / targetCount) * 60);
        setInitialProgress(currentProgress);

        if (loadedCount >= targetCount) {
          // Small delay for smooth transition
          setTimeout(() => {
            markInitialLoaded();
          }, 800);
        }
      };

      // Set progress to 40% when API finishes and image preloading starts
      setInitialProgress(40);

      imagesToPreload.forEach(movie => {
        const img = new window.Image();
        img.src = movie.backdrop;
        img.onload = handleImageLoad;
        img.onerror = handleImageLoad;
      });
    } else if (!isHeroLoading && heroMovies.length === 0) {
      // Fallback if no hero movies found
      setInitialProgress(100);
      markInitialLoaded();
    }
  }, [heroMovies.length, isHeroLoading, hasLoadedInitial, markInitialLoaded, setInitialProgress]);

  return (
    <>
      <Header />
      <main style={{ 
        minHeight: '100vh', 
        backgroundColor: '#000000', 
        opacity: hasLoadedInitial ? 1 : 0, 
        transition: 'opacity 0.8s ease' 
      }}>

        <div className={styles.heroWrapper}>
          {heroMovies.length > 0 ? (
            <Hero movies={heroMovies} />
          ) : (
            <div className={styles.heroLoading} />
          )}
        </div>

        {/* Delay mounting all other sections to prioritize network for hero images */}
        {hasLoadedInitial && <HomeViewContent />}
      </main>
    </>
  );
}

function HomeViewContent() {
  const { data: geo } = useGeoLocation();
  const { data: regionalTrending, isLoading: isRegionalLoading } = useRegionalTrending('movie');

  const popularTVInfinite = useInfiniteTMDBPopular('tv');
  const actionMoviesInfinite = useInfiniteTMDBByGenre(28); // Action
  const romanceMoviesInfinite = useInfiniteTMDBByGenre(10749); // Romance
  const horrorMoviesInfinite = useInfiniteTMDBByGenre(27); // Horror
  const sciFiMoviesInfinite = useInfiniteTMDBByGenre(878); // Sci-Fi
  const animationMoviesInfinite = useInfiniteTMDBByGenre(16); // Animation
  const docMoviesInfinite = useInfiniteTMDBByGenre(99); // Documentary
  const netflixInfinite = useInfiniteNetflixContent();
  const hboInfinite = useInfiniteHBOContent();
  const appleInfinite = useInfiniteAppleContent();

  const { history: globalHistory } = useStore();
  const [isHistoryChecked, setIsHistoryChecked] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle Zustand hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Sync global history to local state
  useEffect(() => {
    if (isHydrated) {
      const uniqueHistory = globalHistory.reduce((acc: any[], current: any) => {
        const existing = acc.find(item => item.id === current.id);
        if (!existing) {
          return [...acc, current];
        }
        return acc;
      }, []);

      setHistory(uniqueHistory.slice(0, 10));
      setIsHistoryChecked(true);
    }
  }, [globalHistory, isHydrated]);

  // Recommendations logic
  const lastWatched = history[0];
  const lastWatchedType = lastWatched?.seasonNum ? 'tv' : 'movie';
  const recInfinite = useInfiniteTMDBRecommendations(lastWatched?.id, lastWatchedType);
  const { isLoading: isRecLoading } = recInfinite;

  return (
    <div className={styles.contentWrapper}>
      {isHistoryChecked && history.length > 0 && (
        <ContinueWatching movies={history} />
      )}
      {!isHistoryChecked && (
        <HistorySkeleton />
      )}

      {!isRegionalLoading && regionalTrending?.results && (
        <LazySection height="450px">
          <TopTrendingSection
            movies={regionalTrending.results}
            title={`Top 10 in ${regionalTrending.countryName} Today`}
          />
        </LazySection>
      )}

      <LazySection height="350px">
        <MovieSection title="Anime" type="danh-sach" slug="hoat-hinh" params={{ country: 'nhat-ban' }} />
      </LazySection>

      <LazySection height="350px">
        <MovieSection title="K-Drama" type="quoc-gia" slug="han-quoc" />
      </LazySection>

      <LazySection height="350px">
        <MovieSection title="Global Popular Series" infiniteData={popularTVInfinite} />
      </LazySection>

      <LazySection height="350px">
        <MovieSection title="Netflix Originals" infiniteData={netflixInfinite} href="/provider/8?type=watch" />
      </LazySection>

      <LazySection height="350px">
        <MovieSection title="HBO Max Originals" infiniteData={hboInfinite} href="/provider/1899?type=watch" />
      </LazySection>

      <LazySection height="350px">
        <MovieSection title="Apple TV+ Originals" infiniteData={appleInfinite} href="/provider/350?type=watch" />
      </LazySection>

      <LazySection height="350px">
        <MovieSection title="Action Movies" infiniteData={actionMoviesInfinite} />
      </LazySection>

      <LazySection height="350px">
        <MovieSection title="Romance Movies" infiniteData={romanceMoviesInfinite} />
      </LazySection>

      <LazySection height="350px">
        <MovieSection title="Horror Movies" infiniteData={horrorMoviesInfinite} />
      </LazySection>

      <LazySection height="350px">
        <MovieSection title="Sci-Fi Movies" infiniteData={sciFiMoviesInfinite} />
      </LazySection>

      <LazySection height="350px">
        <MovieSection title="Animation" infiniteData={animationMoviesInfinite} />
      </LazySection>

      <LazySection height="350px">
        <MovieSection title="Documentary" infiniteData={docMoviesInfinite} />
      </LazySection>

      <LazySection height="350px">
        <MovieSection title="Reality & Variety TV" type="danh-sach" slug="tv-shows" />
      </LazySection>

      {!isRecLoading && recInfinite?.data?.pages[0]?.results?.length > 0 && lastWatched && (
        <LazySection height="400px">
          <MovieSection title={`Because you watched ${lastWatched.title}`} infiniteData={recInfinite} />
        </LazySection>
      )}
    </div>
  );
}
