'use client';

import React, { useEffect, useState } from 'react';
import Header from "@/components/layout/Header";
import Hero from "@/components/movie/Hero";
import MovieSection from "@/components/movie/MovieSection";
import TopTrendingSection from "@/components/movie/TopTrendingSection";
import ContinueWatching from "@/components/movie/ContinueWatching";
import { 
  useMovieList, 
  useRegionalTrending, 
  useTrendingWithLogos, 
  useTMDBRecommendations, 
  useGeoLocation,
  useTMDBPopular,
  useTMDBUpcoming,
  useTMDBByGenre
} from "@/hooks/useMovie";
import { ophim } from "@/lib/ophim";
import { tmdb } from "@/lib/tmdb";
import styles from './page.module.css';
import { useStore } from "@/store/useStore";
import LazySection from "@/components/layout/LazySection";

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
  const { data: geo } = useGeoLocation();
  const { data: regionalTrending, isLoading: isRegionalLoading } = useRegionalTrending('movie');
  const { data: heroData, isLoading: isHeroLoading } = useTrendingWithLogos('all', 6, geo?.countryCode);
  
  // New TMDB Hooks for restructured home
  const { data: popularTV } = useTMDBPopular('tv');
  const { data: upcomingMovies } = useTMDBUpcoming();
  const { data: actionMovies } = useTMDBByGenre(28); // Action
  const { data: romanceMovies } = useTMDBByGenre(10749); // Romance
  const { data: horrorMovies } = useTMDBByGenre(27); // Horror
  const { data: sciFiMovies } = useTMDBByGenre(878); // Sci-Fi
  const { data: animationMovies } = useTMDBByGenre(16); // Animation
  const { data: docMovies } = useTMDBByGenre(99); // Documentary

  const { history: globalHistory } = useStore();
  const [isHistoryChecked, setIsHistoryChecked] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle Zustand hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Sync global history to local state for internal logic
  useEffect(() => {
    if (isHydrated) {
      // Group by show ID and take only the latest one per show for the homepage list
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
  const lastWatchedId = lastWatched?.id;
  const lastWatchedType = lastWatched?.seasonNum ? 'tv' : 'movie';
  
  const { data: recData, isLoading: isRecLoading } = useTMDBRecommendations(
    lastWatchedId || '', 
    lastWatchedType
  );

  // Simple static mapping for TMDB genre IDs
  const tmdbGenres: Record<number, string> = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
    10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "Politics"
  };

  // Hero movies from TMDB trending with logos
  const heroMovies = heroData?.map((item: any, index: number) => {
    // Map genre IDs to names
    const mappedGenres = (item.genre_ids || []).map((id: number) => ({
      name: tmdbGenres[id] || "Unknown",
      slug: id.toString()
    })).filter((g: any) => g.name !== "Unknown");

    return {
      id: item.id,
      title: item.title || item.name,
      description: item.overview,
      backdrop: tmdb.getImageUrl(item.backdrop_path, 'original'),
      poster: tmdb.getImageUrl(item.poster_path, 'original'), // High-res for mobile hero
      logo: item.logo,
      media_type: item.media_type || (item.title ? 'movie' : 'tv'),
      year: new Date(item.release_date || item.first_air_date).getFullYear(),
      rating: item.vote_average,
      rank: index + 1,
      genres: mappedGenres
    };
  }) || [];



  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <Header />

      <div className={styles.heroWrapper}>
        {heroMovies.length > 0 ? (
          <Hero movies={heroMovies} />
        ) : (
          <div className={styles.heroLoading} />
        )}
      </div>

      <div className={styles.contentWrapper}>
        {isHistoryChecked && history.length > 0 && (
          <ContinueWatching movies={history} />
        )}
        {!isHistoryChecked && (
          <HistorySkeleton />
        )}

        {/* 1. Regional Trending (TMDB) */}
        {!isRegionalLoading && regionalTrending?.results && (
          <LazySection height="450px">
            <TopTrendingSection 
              movies={regionalTrending.results} 
              title={`Top 10 in ${regionalTrending.countryName} Today`} 
            />
          </LazySection>
        )}

        {/* 3. Anime (Ophim) */}
        <LazySection height="350px">
          <MovieSection title="Anime" type="danh-sach" slug="hoat-hinh" params={{ country: 'nhat-ban' }} />
        </LazySection>

        {/* 4. K-Drama (Ophim) */}
        <LazySection height="350px">
          <MovieSection title="K-Drama" type="quoc-gia" slug="han-quoc" />
        </LazySection>

        {/* 4. Global Popular TV (TMDB) */}
        {popularTV?.results && (
          <LazySection height="350px">
            <MovieSection 
              title="Global Popular Series" 
              movies={popularTV.results} 
            />
          </LazySection>
        )}
        
        {/* 5. Recently Added (Ophim) */}
        <LazySection height="350px">
          <MovieSection title="New on LuminaPlay" type="danh-sach" slug="phim-moi" />
        </LazySection>

        {/* 6. Action Blockbusters (TMDB Genre) */}
        {actionMovies?.results && (
          <LazySection height="350px">
            <MovieSection 
              title="Action & Adventure Hits" 
              movies={actionMovies.results} 
            />
          </LazySection>
        )}

        {/* 7. Personalized Recommendations (TMDB) */}
        {!isRecLoading && recData?.results?.length > 0 && lastWatched && (
          <LazySection height="400px">
            <MovieSection 
              title={`Because you watched ${lastWatched.title}`}
              movies={recData.results} 
            />
          </LazySection>
        )}

        {/* 8. Romance Stories (TMDB Genre) */}
        {romanceMovies?.results && (
          <LazySection height="350px">
            <MovieSection 
              title="Romantic Stories" 
              movies={romanceMovies.results} 
            />
          </LazySection>
        )}

        {/* 9. Horror & Thriller (TMDB) */}
        {horrorMovies?.results && (
          <LazySection height="350px">
            <MovieSection 
              title="Horror & Thriller" 
              movies={horrorMovies.results} 
            />
          </LazySection>
        )}

        {/* 10. Sci-Fi & Fantasy (TMDB) */}
        {sciFiMovies?.results && (
          <LazySection height="350px">
            <MovieSection 
              title="Sci-Fi & Fantasy" 
              movies={sciFiMovies.results} 
            />
          </LazySection>
        )}

        {/* 11. International Animation (TMDB) */}
        {animationMovies?.results && (
          <LazySection height="350px">
            <MovieSection 
              title="International Animation" 
              movies={animationMovies.results} 
            />
          </LazySection>
        )}

        {/* 12. Documentaries (TMDB) */}
        {docMovies?.results && (
          <LazySection height="350px">
            <MovieSection 
              title="Real Life Stories & Docs" 
              movies={docMovies.results} 
            />
          </LazySection>
        )}

        {/* 13. Chinese Dramas (Ophim) */}
        <LazySection height="350px">
          <MovieSection title="Chinese Dramas" type="quoc-gia" slug="trung-quoc" />
        </LazySection>

        {/* 14. Reality & Variety TV (Ophim) */}
        <LazySection height="350px">
          <MovieSection title="Reality & Variety TV" type="danh-sach" slug="tv-shows" />
        </LazySection>

        {/* 15. Coming Soon (TMDB Upcoming) */}
        {upcomingMovies?.results && (
          <LazySection height="350px">
            <MovieSection 
              title="Coming Soon to Theaters" 
              movies={upcomingMovies.results} 
            />
          </LazySection>
        )}
      </div>
    </main>
  );
}
