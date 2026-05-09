'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, LogOut, Settings, History, Heart, LogIn } from 'lucide-react';
import styles from './UserMenu.module.css';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error('Error logging in:', error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.refresh();
  };

  if (loading) return <div className={styles.avatarBtn} style={{ opacity: 0.5 }} />;

  if (!user) {
    return (
      <button className={styles.loginBtn} onClick={handleLogin}>
        <LogIn size={18} />
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <div className={styles.menuWrapper} ref={dropdownRef}>
      <button className={styles.avatarBtn} onClick={() => setIsOpen(!isOpen)}>
        {user.user_metadata?.avatar_url ? (
          <img src={user.user_metadata.avatar_url} alt="Avatar" className={styles.avatarImage} />
        ) : (
          <User size={22} color="white" />
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.user_metadata?.full_name || 'User'}</span>
            <span className={styles.userEmail}>{user.email}</span>
          </div>

          <button className={styles.menuItem} onClick={() => { setIsOpen(false); router.push('/history'); }}>
            <History size={18} />
            <span>Watch History</span>
          </button>

          <button className={styles.menuItem} onClick={() => { setIsOpen(false); router.push('/mylist'); }}>
            <Heart size={18} />
            <span>My List</span>
          </button>

          <button className={styles.menuItem} onClick={() => { setIsOpen(false); router.push('/settings'); }}>
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <button className={`${styles.menuItem} ${styles.logoutBtn}`} onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
