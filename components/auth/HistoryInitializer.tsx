'use client';

import { useSyncHistory } from '@/hooks/useSyncHistory';
import { useFavorites } from '@/hooks/useFavorites';

export default function HistoryInitializer() {
  useSyncHistory({ init: true });
  useFavorites({ init: true });
  return null;
}
