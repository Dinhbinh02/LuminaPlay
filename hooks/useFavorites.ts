'use client';

import { useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/store/useStore';

export function useFavorites() {
  const { favorites, user, setFavorites } = useStore();
  const supabase = createClient();

  // Sync from Supabase to Local
  const fetchFavoritesFromCloud = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error.message);
        return;
      }

      if (data) {
        const cloudFavorites = data.map(item => ({
          id: item.movie_id,
          title: item.title,
          poster: item.poster,
          progress: 0,
          slug: item.slug,
          watched_at: item.created_at
        }));
        setFavorites(cloudFavorites);
      }
    } catch (e) {
      console.error('Network error during favorites fetch:', e);
    }
  }, [user, setFavorites, supabase]);

  useEffect(() => {
    fetchFavoritesFromCloud();
  }, [fetchFavoritesFromCloud]);

  // Sync actions to Cloud
  const addFavoriteToCloud = async (item: any) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('favorites').upsert({
        user_id: user.id,
        movie_id: item.id,
        title: item.title,
        poster: item.poster,
        slug: item.slug || ''
      }, {
        onConflict: 'user_id,movie_id'
      });

      if (error) {
        console.error('Error adding to favorites:', error.message);
      }
    } catch (e) {
      console.error('Network error during favorite add:', e);
    }
  };

  const removeFavoriteFromCloud = async (movieId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId);

      if (error) {
        console.error('Error removing from favorites:', error.message);
      }
    } catch (e) {
      console.error('Network error during favorite removal:', e);
    }
  };

  return { addFavoriteToCloud, removeFavoriteFromCloud, fetchFavoritesFromCloud };
}
