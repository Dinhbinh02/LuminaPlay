'use client';

import { useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/store/useStore';

export function useSyncHistory({ init = false } = {}) {
  const { history, user, setUser, setHistory, addToHistory } = useStore();
  const supabase = createClient();

  // Handle Auth state change
  useEffect(() => {
    if (!init) return;

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [init, setUser, supabase.auth]);

  // Sync from Supabase to Local
  const fetchHistoryFromCloud = useCallback(async () => {
    if (!user || !init) return;

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
        id: item.movie_id.includes('_S') ? item.movie_id.split('_S')[0] : item.movie_id,
        title: item.title,
        poster: item.poster,
        progress: Number(item.progress),
        slug: item.slug,
        watched_at: item.watched_at,
        episodeNum: item.episode_num,
        season_num: item.season_num,
        seasonNum: item.season_num,
        currentTime: Number(item.playback_time)
      }));

      setHistory(cloudHistory);
    }
  }, [user, setHistory, supabase, init]);

  useEffect(() => {
    if (init) {
      fetchHistoryFromCloud();
    }
  }, [init, fetchHistoryFromCloud]);

  const lastSyncRef = useRef<number>(0);

  // Sync from Local to Supabase (Throttled)
  const syncItemToCloud = useCallback(async (item: any, force: boolean = false) => {
    if (!user) return;

    const now = Date.now();
    // Ultra-efficient sync: only update cloud every 5 minutes (300,000ms)
    // or when forced (on close/exit)
    if (!force && now - lastSyncRef.current < 300000) {
      return;
    }

    try {
      lastSyncRef.current = now;
      // Generate a unique ID for episodes to avoid overwriting show-level history in cloud
      const cloudMovieId = item.seasonNum ? `${item.id}_S${item.seasonNum}_E${item.episodeNum}` : item.id;

      const { error } = await supabase.from('watch_history').upsert({
        user_id: user.id,
        movie_id: cloudMovieId,
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
