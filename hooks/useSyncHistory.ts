'use client';

import { useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/store/useStore';

export function useSyncHistory() {
  const { history, user, setUser, setHistory, addToHistory } = useStore();
  const supabase = createClient();

  // Handle Auth state change
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, supabase.auth]);

  // Sync from Supabase to Local
  const fetchHistoryFromCloud = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .order('watched_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching history:', error.message);
      return;
    }

    if (data) {
      const cloudHistory = data.map(item => ({
        id: item.movie_id,
        title: item.title,
        poster: item.poster,
        progress: Number(item.progress),
        slug: item.slug,
        watched_at: item.watched_at,
        episodeNum: item.episode_num,
        seasonNum: item.season_num,
        currentTime: Number(item.playback_time)
      }));

      // Merge logic: prefer cloud history but keep local if it's newer
      // For simplicity, we'll just use cloud history if user is logged in
      setHistory(cloudHistory);
    }
  }, [user, setHistory, supabase]);

  useEffect(() => {
    fetchHistoryFromCloud();
  }, [fetchHistoryFromCloud]);

  // Sync from Local to Supabase
  const syncItemToCloud = useCallback(async (item: any) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('watch_history').upsert({
        user_id: user.id,
        movie_id: item.id,
        title: item.title,
        poster: item.poster,
        slug: item.slug || '',
        progress: item.progress,
        episode_num: item.episodeNum,
        season_num: item.seasonNum,
        playback_time: item.currentTime,
        watched_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,movie_id'
      });

      if (error) {
        console.error('Error syncing to cloud:', error.message);
      }
    } catch (e) {
      console.error('Network error during cloud sync:', e);
    }
  }, [user, supabase]);

  return { syncItemToCloud };
}
