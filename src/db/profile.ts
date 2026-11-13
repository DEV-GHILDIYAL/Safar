import type { ChapterType, Profile } from '@/types';
import { getDb } from './client';

export async function getProfile(): Promise<Profile> {
  const db = await getDb();
  const r = await db.getFirstAsync<{ name: string; home_city: string; avatar: string | null }>(
    'SELECT name, home_city, avatar FROM profile WHERE id = 1',
  );
  return { name: r?.name ?? '', homeCity: r?.home_city ?? '', avatar: r?.avatar ?? null };
}

export async function saveProfile(p: Profile): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO profile (id, name, home_city, avatar) VALUES (1, ?, ?, ?)',
    [p.name, p.homeCity, p.avatar],
  );
}

export interface ChapterStats {
  chapters: number;
  done: number;
  photos: number;
  byType: Partial<Record<ChapterType, number>>;
}

export async function getChapterStats(): Promise<ChapterStats> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ type: string; n: number; d: number }>(
    'SELECT type, COUNT(*) AS n, COALESCE(SUM(done), 0) AS d FROM chapters GROUP BY type',
  );
  const photos = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM memories');
  const byType: Partial<Record<ChapterType, number>> = {};
  let chapters = 0;
  let done = 0;
  for (const r of rows) {
    byType[r.type as ChapterType] = r.n;
    chapters += r.n;
    done += r.d;
  }
  return { chapters, done, photos: photos?.n ?? 0, byType };
}
