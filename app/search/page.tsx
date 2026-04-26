'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from "@/components/layout/Header";
import { ophim } from "@/lib/ophim";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './SearchPage.module.css';

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
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        let data;
        if (keyword) {
          setTitle(`Search results for: "${keyword}"`);
          data = await ophim.search(keyword, page);
        } else if (country) {
          setTitle(`Movies from: ${country.replace(/-/g, ' ')}`);
          data = await ophim.getMovies('quoc-gia', country, { page });
        } else if (genre) {
          setTitle(`Genre: ${genre.replace(/-/g, ' ')}`);
          data = await ophim.getMovies('the-loai', genre, { page });
        } else if (category) {
          setTitle(`Category: ${category.replace(/-/g, ' ')}`);
          data = await ophim.getMovies('danh-sach', category, { page });
        }

        if (data) {
          setResults(data.data?.items || []);
          setCdnDomain(data.data?.APP_DOMAIN_CDN_IMAGE || '');
          setPagination(data.data?.params?.pagination);
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
      <h1 className={styles.title}>{title}</h1>

      {isLoading ? (
        <div className={styles.loading}>Searching...</div>
      ) : (
        <>
          <div className={styles.grid}>
            {results.map((movie, index) => (
              <motion.div 
                key={movie._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/watch/${movie.slug}`}>
                  <div className={styles.card}>
                    <img 
                      src={ophim.getImageUrl(movie.thumb_url, cdnDomain)} 
                      alt={movie.name} 
                      crossOrigin="anonymous"
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
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                <ChevronLeft size={20} />
                <span>Prev</span>
              </button>
              
              <div className={styles.pageInfo}>
                Page <span>{page}</span> of {totalPages}
              </div>

              <button 
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </button>
            </div>
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
      <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
        <SearchResults />
      </Suspense>
    </main>
  );
}
