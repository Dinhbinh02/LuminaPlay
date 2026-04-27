import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    // On mobile, we show fewer numbers to prevent overflow
    const siblingCount = isMobile ? 1 : 2;
    
    if (totalPages <= (isMobile ? 5 : 7)) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage <= (isMobile ? 3 : 4)) {
      const end = isMobile ? 3 : 5;
      for (let i = 2; i <= end; i++) pages.push(i);
      pages.push('ellipsis');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - (isMobile ? 2 : 3)) {
      pages.push('ellipsis');
      const start = totalPages - (isMobile ? 2 : 4);
      for (let i = start; i <= totalPages; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
    } else {
      pages.push('ellipsis');
      for (let i = currentPage - siblingCount; i <= currentPage + siblingCount; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className={styles.paginationWrapper}>
      <div className={styles.pagination}>
        <button 
          className={styles.navBtn}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className={styles.pages}>
          {getPageNumbers().map((page, index) => (
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                <MoreHorizontal size={16} />
              </span>
            ) : (
              <button
                key={page}
                className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </button>
            )
          ))}
        </div>
        
        <button 
          className={styles.navBtn}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
