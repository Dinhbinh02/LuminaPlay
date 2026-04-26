'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from "@/components/layout/Header";
import { ophim } from "@/lib/ophim";
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Pagination from "@/components/ui/Pagination";
import styles from './SearchPage.module.css';

function SearchCard({ movie, cdnDomain, index }: { movie: any, cdnDomain: string, index: number }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/watch/${movie.slug}`}>
        <div className={styles.card}>
          {!isLoaded && <div className={styles.skeleton} />}
          <Image
            src={ophim.getImageUrl(movie.thumb_url, cdnDomain)}
            alt={movie.name}
            fill
            sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1200px) 18vw, 200px"
            style={{ 
              objectFit: 'cover',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.4s ease'
            }}
            onLoadingComplete={() => setIsLoaded(true)}
            quality={70}
          />
          <div className={styles.cardInfo}>
            <h3>{movie.name}</h3>
            <div className={styles.meta}>
              <span>{movie.year}</span>
              <span className={styles.quality}>{movie.quality}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const keyword = searchParams.get('q');
  const country = searchParams.get('country');
  const genre = searchParams.get('genre');
  const category = searchParams.get('category');
  const page = parseInt(searchParams.get('page') || '1');

  const [results, setResults] = useState<any[]>([]);
  const [cdnDomain, setCdnDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [pagination, setPagination] = useState<any>(null);

  const [currentQuery, setCurrentQuery] = useState(searchParams.toString());

  if (searchParams.toString() !== currentQuery) {
    setCurrentQuery(searchParams.toString());
    setResults([]);
    setIsLoading(true);
    setTitle('');
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setTitle('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        let data;
        if (keyword) {
          setTitle(`Search results for: "${keyword}"`);
          data = await ophim.search(keyword, page);
        } else if (country) {
          data = await ophim.getMovies('quoc-gia', country, { page });
        } else if (genre) {
          data = await ophim.getMovies('the-loai', genre, { page });
        } else if (category) {
          data = await ophim.getMovies('danh-sach', category, { page });
        }

        if (data) {
          setResults(data.data?.items || []);
          setCdnDomain(data.data?.APP_DOMAIN_CDN_IMAGE || '');
          setPagination(data.data?.params?.pagination);

          if (data.data?.titlePage) {
            setTitle(data.data.titlePage);
          } else if (data.data?.seoOnPage?.titleHead) {
            setTitle(data.data.seoOnPage.titleHead);
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [keyword, country, genre, category, page]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/search?${params.toString()}`);
  };

  const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.totalItemsPerPage) : 0;

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.skeletonTitle} />
      ) : (
        <h1 className={styles.title}>
          {title}{title && page > 1 ? ` (${page})` : ''}
        </h1>
      )}

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {results.map((movie, index) => (
              <SearchCard 
                key={movie._id} 
                movie={movie} 
                cdnDomain={cdnDomain} 
                index={index} 
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination 
              currentPage={page}
              totalItems={pagination?.totalItems || 0}
              itemsPerPage={pagination?.totalItemsPerPage || 24}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {!isLoading && results.length === 0 && (
        <div className={styles.noResults}>No movies found matching your criteria.</div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className={styles.main}>
      <Header />
      <Suspense fallback={
        <div className={styles.container}>
          <div className={styles.skeletonTitle} />
          <div className={styles.grid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </main>
  );
}
