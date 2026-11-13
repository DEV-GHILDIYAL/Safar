import { create } from 'zustand';
import * as repo from '@/db/chapters';
import { deletePhoto } from '@/lib/photos';
import { groupByDay } from '@/lib/timeline';
import type { Chapter, ChapterInput } from '@/types';
import { useMemories } from './memories';

const EMPTY: Chapter[] = [];

interface ChaptersState {
  byTrip: Record<number, Chapter[]>;
  load: (tripId: number) => Promise<void>;
  create: (input: ChapterInput) => Promise<Chapter>;
  update: (chapter: Chapter, input: ChapterInput) => Promise<void>;
  toggleDone: (chapter: Chapter) => Promise<void>;
  /** Swap with the neighbour in the same day. Returns false when it can't move. */
  move: (chapter: Chapter, dir: -1 | 1) => Promise<boolean>;
  remove: (chapter: Chapter) => Promise<void>;
}

export const useChapters = create<ChaptersState>((set, get) => {
  const replace = (tripId: number, fn: (list: Chapter[]) => Chapter[]) =>
    set({ byTrip: { ...get().byTrip, [tripId]: fn(get().byTrip[tripId] ?? EMPTY) } });

  return {
    byTrip: {},

    load: async (tripId) => {
      const list = await repo.listChapters(tripId);
      set({ byTrip: { ...get().byTrip, [tripId]: list } });
    },

    create: async (input) => {
      const c = await repo.insertChapter(input);
      replace(input.tripId, (list) => [...list, c]);
      return c;
    },

    update: async (chapter, input) => {
      // Time changed -> fall back into time order; otherwise keep manual position.
      const sortOrder = input.startAt !== chapter.startAt ? input.startAt : chapter.sortOrder;
      const next = await repo.updateChapter(chapter.id, input, sortOrder);
      replace(chapter.tripId, (list) => list.map((c) => (c.id === chapter.id ? next : c)));
    },

    toggleDone: async (chapter) => {
      const done = !chapter.done;
      replace(chapter.tripId, (list) => list.map((c) => (c.id === chapter.id ? { ...c, done } : c)));
      await repo.setChapterDone(chapter.id, done);
    },

    move: async (chapter, dir) => {
      const list = get().byTrip[chapter.tripId] ?? EMPTY;
      const group = groupByDay(list).find((g) => g.chapters.some((c) => c.id === chapter.id));
      if (!group) return false;
      const i = group.chapters.findIndex((c) => c.id === chapter.id);
      const other = group.chapters[i + dir];
      if (!other) return false;
      let a = chapter.sortOrder;
      let b = other.sortOrder;
      if (a === b) {
        // Equal keys (same start time): nudge so the swap is visible.
        a += dir;
        b -= dir;
      }
      replace(chapter.tripId, (l) =>
        l.map((c) => (c.id === chapter.id ? { ...c, sortOrder: b } : c.id === other.id ? { ...c, sortOrder: a } : c)),
      );
      await repo.setSortOrders([
        { id: chapter.id, sortOrder: b },
        { id: other.id, sortOrder: a },
      ]);
      return true;
    },

    remove: async (chapter) => {
      const files = await repo.deleteChapter(chapter.id);
      files.forEach(deletePhoto);
      replace(chapter.tripId, (list) => list.filter((c) => c.id !== chapter.id));
      useMemories.getState().dropChapter(chapter.tripId, chapter.id);
    },
  };
});

export const useTripChapters = (tripId: number) => useChapters((s) => s.byTrip[tripId] ?? EMPTY);
