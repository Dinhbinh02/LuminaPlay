'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { Home, Search, Library, Users } from 'lucide-react';
import { useModalStore } from '@/store/useStore';
import styles from './Sidebar.module.css';
import UserMenu from './UserMenu';
import SearchOverlay from './SearchOverlay';
import WatchPartyModal from '../movie/WatchPartyModal';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const { setIsSearchOpen, isSearchOpen, activeTab, setActiveTab } = useModalStore();
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);

  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    router.prefetch('/search');
    router.prefetch('/mylist');
    router.prefetch('/');
  }, [router]);

  // Save current scroll before path changes, restore when returning
  useEffect(() => {
    const key = `scroll_${pathname}`;
    const saved = sessionStorage.getItem(key);
    if (saved !== null) {
      // Small delay to let the page render first
      requestAnimationFrame(() => {
        window.scrollTo({ top: parseInt(saved, 10), behavior: 'instant' as ScrollBehavior });
      });
    }
    return () => {
      sessionStorage.setItem(`scroll_${pathname}`, String(window.scrollY));
    };
  }, [pathname]);

  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  const contentId = params?.id as string;
  const contentType = pathname?.startsWith('/tv/') ? 'tv' : 'movie';

  const currentPath = optimisticPath || activeTab || pathname || '';

  const menuItems = [
    {
      label: 'Home',
      icon: Home,
      href: '/',
      active: currentPath === '/' || currentPath.startsWith('/movie/') || currentPath.startsWith('/tv/'),
    },
    {
      label: 'Search',
      icon: Search,
      href: '/search',
      active: currentPath.startsWith('/search') || currentPath.startsWith('/provider'),
    },
    {
      label: 'Library',
      icon: Library,
      href: '/mylist',
      active: currentPath === '/mylist',
    },
    {
      label: 'Party',
      icon: Users,
      href: '#',
      active: false,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        setIsPartyModalOpen(true);
      },
    },
  ];

  return (
    <>
      <aside className={styles.sidebar}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logoLink} aria-label="Lumina Play Home">
            <img src="/icons/logo_square_v4.png" alt="Lumina Logo" className={styles.logoIcon} />
          </Link>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <div className={`${styles.navItem} ${item.active ? styles.navItemActive : ''}`}>
                <Icon size={22} className={styles.icon} />
              </div>
            );

            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={styles.navLinkButton}
                  aria-label={item.label}
                >
                  {content}
                </button>
              );
            }

            return (
              <a
                key={item.label}
                href={item.href}
                className={styles.navLink}
                aria-label={item.label}
                onClick={(e) => {
                  e.preventDefault();

                  const isCurrentMain = ['/', '/search', '/mylist'].includes(pathname);
                  const isTargetMain = ['/', '/search', '/mylist'].includes(item.href);

                  if (isCurrentMain && isTargetMain) {
                    // Sync scroll position before leaving
                    sessionStorage.setItem(`scroll_${pathname}`, String(window.scrollY));
                    
                    // Switch tab synchronously in React/Zustand state (0ms delay)
                    setActiveTab(item.href);
                    
                    // Update browser address bar path synchronously
                    window.history.pushState(null, '', item.href);

                    // Restore saved scroll position of the target tab
                    const savedScroll = sessionStorage.getItem(`scroll_${item.href}`);
                    if (savedScroll !== null) {
                      requestAnimationFrame(() => {
                        window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' as ScrollBehavior });
                      });
                    } else {
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }
                  } else {
                    // Fall back to standard route change when leaving detail pages or switching contexts
                    if (pathname !== item.href) {
                      setOptimisticPath(item.href);
                      sessionStorage.setItem(`scroll_${pathname}`, String(window.scrollY));
                      startTransition(() => {
                        router.push(item.href, { scroll: false });
                      });
                    }
                  }
                }}
              >
                {content}
              </a>
            );
          })}
          <UserMenu />
        </nav>
      </aside>

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <WatchPartyModal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        peerId={contentId}
        onJoin={(roomId) => {
          if (contentId) {
            router.push(`/watch/${contentType}/${contentId}?partyId=${roomId}`);
          } else {
            console.log("No content context for Watch Party join");
          }
          setIsPartyModalOpen(false);
        }}
      />
    </>
  );
}
