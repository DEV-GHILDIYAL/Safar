import type { Chapter } from '@/types';
import { dayKey, startOfDay } from './dates';

export interface DayGroup {
  key: string;
  day: number; // local midnight
  chapters: Chapter[];
}

/** Groups chapters by calendar day; within a day ordered by sortOrder (manual reorder), then id. */
export function groupByDay(chapters: Chapter[]): DayGroup[] {
  const map = new Map<string, DayGroup>();
  for (const c of chapters) {
    const key = dayKey(c.startAt);
    let g = map.get(key);
    if (!g) {
      g = { key, day: startOfDay(c.startAt), chapters: [] };
      map.set(key, g);
    }
    g.chapters.push(c);
  }
  const groups = [...map.values()].sort((a, b) => a.day - b.day);
  for (const g of groups) g.chapters.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  return groups;
}

/** Chapters flattened in timeline order. */
export function orderedChapters(chapters: Chapter[]): Chapter[] {
  return groupByDay(chapters).flatMap((g) => g.chapters);
}

export interface NextChapter {
  chapter: Chapter;
  live: boolean; // currently happening
}

/** The chapter happening now, else the next not-done chapter that hasn't started. */
export function findNext(chapters: Chapter[], now = Date.now()): NextChapter | null {
  const ordered = orderedChapters(chapters).filter((c) => !c.done);
  const live = ordered.find((c) => c.startAt <= now && c.endAt != null && c.endAt >= now);
  if (live) return { chapter: live, live: true };
  const next = ordered.find((c) => c.startAt >= now);
  return next ? { chapter: next, live: false } : null;
}
