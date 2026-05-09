'use client';

import { useSyncHistory } from '@/hooks/useSyncHistory';
import { useFavorites } from '@/hooks/useFavorites';

export default function HistoryInitializer() {
  useSyncHistory();
  useFavorites();
  return null;
}
