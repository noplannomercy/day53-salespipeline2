'use client';

import { useEffect } from 'react';
import { getObject, STORAGE_KEYS } from '@/lib/storage';
import { seedAll } from '@/lib/seed';
import type { AppSettings } from '@/types/index';

/**
 * Reads the darkMode flag from sp_settings via storage.ts on mount
 * and applies/removes the `dark` class on the <html> element.
 *
 * Also invokes seedAll() so dummy data is injected on first app run.
 * seedAll() uses seedIfEmpty() internally, so it never overwrites data
 * the user has already created in a previous session.
 */
export default function DarkModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // 1. Apply dark mode from persisted settings (routed through storage.ts)
    const settings = getObject<AppSettings>(STORAGE_KEYS.SETTINGS);
    if (settings?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Seed initial demo data on first app run
    try {
      seedAll();
    } catch (err) {
      console.warn('[DarkModeProvider] seedAll() failed:', err);
    }
  }, []);

  return <>{children}</>;
}
