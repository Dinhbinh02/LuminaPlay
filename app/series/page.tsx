'use client';

import React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Header from "@/components/layout/Header";
import MovieGrid from "@/components/movie/MovieGrid";
import { useMovieList } from "@/hooks/useMovie";
import { MovieGridSkeleton } from "@/components/ui/Skeleton";
import { ophim } from "@/lib/ophim";
import Pagination from "@/components/ui/Pagination";

import { Suspense } from 'react';

function SeriesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = Number(searchParams.get('page')) || 1;
  
  const { data, isLoading } = useMovieList('phim-bo', page, 24);

  const movies = data?.data?.items?.map((item: any) => ({
    id: item._id,
    title: item.name,
    poster: ophim.getImageUrl(item.thumb_url, data?.data?.APP_DOMAIN_CDN_IMAGE),
    slug: item.slug,
    year: item.year?.toString(),
    quality: ophim.formatEpisode(item.episode_current || item.quality)
  })) || [];

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {isLoading ? (
        <div style={{ padding: '120px 4%' }}>
          <MovieGridSkeleton />
        </div>
      ) : (
        <>
          <MovieGrid title="TV Series" movies={movies} />
          
          <Pagination 
            currentPage={page}
            totalItems={data?.data?.params?.pagination?.totalItems || 0}
            itemsPerPage={data?.data?.params?.pagination?.totalItemsPerPage || 24}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </>
  );
}

export default function SeriesPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <Header />
      <Suspense fallback={
        <div style={{ padding: '120px 4%' }}>
          <MovieGridSkeleton />
        </div>
      }>
        <SeriesContent />
      </Suspense>
    </main>
  );
}

