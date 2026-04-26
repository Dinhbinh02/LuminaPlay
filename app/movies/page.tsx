'use client';

import React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Header from "@/components/layout/Header";
import MovieGrid from "@/components/movie/MovieGrid";
import { useMovieList } from "@/hooks/useMovie";
import { MovieGridSkeleton } from "@/components/ui/Skeleton";
import { ophim } from "@/lib/ophim";
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Suspense } from 'react';

function MoviesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = Number(searchParams.get('page')) || 1;
  
  const { data, isLoading } = useMovieList('phim-le', page, 24);

  const movies = data?.data?.items?.map((item: any) => ({
    id: item._id,
    title: item.name,
    poster: ophim.getImageUrl(item.thumb_url, data?.data?.APP_DOMAIN_CDN_IMAGE),
    slug: item.slug,
    year: item.year?.toString(),
    quality: item.quality
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
          <MovieGrid title="Movies" movies={movies} />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '20px', 
            paddingBottom: '80px',
            color: 'white'
          }}>
            <button 
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: page === 1 ? 'rgba(255,255,255,0.3)' : 'white'
              }}
            >
              <ChevronLeft size={20} /> Previous
            </button>
            
            <span style={{ fontWeight: '700' }}>Page {page}</span>
            
            <button 
              onClick={() => handlePageChange(page + 1)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'white'
              }}
            >
              Next <ChevronRight size={20} />
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default function MoviesPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#050505' }}>
      <Header />
      <Suspense fallback={
        <div style={{ padding: '120px 4%' }}>
          <MovieGridSkeleton />
        </div>
      }>
        <MoviesContent />
      </Suspense>
    </main>
  );
}

