import { create } from 'zustand';
import * as repo from '@/db/memories';
import { deletePhoto, savePhoto, type PickedPhoto } from '@/lib/photos';
import type { Memory } from '@/types';

const EMPTY: Memory[] = [];

interface MemoriesState {
  byTrip: Record<number, Memory[]>;
  load: (tripId: number) => Promise<void>;
  add: (tripId: number, chapterId: number, photos: PickedPhoto[]) => Promise<Memory[]>;
  setCaption: (memory: Memory, caption: string) => Promise<void>;
  remove: (memory: Memory) => Promise<void>;
  /** Local cleanup after a chapter delete (DB already cascaded). */
  dropChapter: (tripId: number, chapterId: number) => void;
}

const byTaken = (a: Memory, b: Memory) => a.takenAt - b.takenAt || a.id - b.id;

export const useMemories = create<MemoriesState>((set, get) => {
  const replace = (tripId: number, fn: (list: Memory[]) => Memory[]) =>
    set({ byTrip: { ...get().byTrip, [tripId]: fn(get().byTrip[tripId] ?? EMPTY) } });

  return {
    byTrip: {},

    load: async (tripId) => {
      const list = await repo.listMemoriesByTrip(tripId);
      set({ byTrip: { ...get().byTrip, [tripId]: list } });
    },

    add: async (tripId, chapterId, photos) => {
      const items = [];
      for (const p of photos) {
        const file = await savePhoto(p.uri);
        items.push({ tripId, chapterId, file, takenAt: p.takenAt });
      }
      const added = await repo.insertMemories(items);
      replace(tripId, (list) => [...list, ...added].sort(byTaken));
      return added;
    },

    setCaption: async (memory, caption) => {
      replace(memory.tripId, (list) => list.map((m) => (m.id === memory.id ? { ...m, caption } : m)));
      await repo.updateMemoryCaption(memory.id, caption);
    },

    remove: async (memory) => {
      await repo.deleteMemory(memory.id);
      deletePhoto(memory.file);
      replace(memory.tripId, (list) => list.filter((m) => m.id !== memory.id));
    },

    dropChapter: (tripId, chapterId) => replace(tripId, (list) => list.filter((m) => m.chapterId !== chapterId)),
  };
});

export const useTripMemories = (tripId: number) => useMemories((s) => s.byTrip[tripId] ?? EMPTY);
