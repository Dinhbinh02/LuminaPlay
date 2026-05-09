'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function LazySection({ children, height = '300px' }: { children: React.ReactNode, height?: string }) {
  const [isIntersecting, setIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: isIntersecting ? 'auto' : height }}>
      {isIntersecting ? children : null}
    </div>
  );
}
