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

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    
    return pages;
  };

  return (
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
  );
}
