import { create } from 'zustand';
import * as repo from '@/db/trips';
import { deletePhoto, savePhoto } from '@/lib/photos';
import type { Trip, TripInput } from '@/types';

export type TripFields = Omit<TripInput, 'cover'>;
/** 'keep' = unchanged, null = remove, string = new source URI to import. */
export type CoverChange = 'keep' | null | string;

interface TripsState {
  trips: Trip[];
  loaded: boolean;
  load: () => Promise<void>;
  create: (fields: TripFields, coverUri: string | null) => Promise<Trip>;
  update: (id: number, fields: TripFields, cover: CoverChange) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

const byStart = (a: Trip, b: Trip) => a.startDate - b.startDate || a.id - b.id;

export const useTrips = create<TripsState>((set, get) => ({
  trips: [],
  loaded: false,

  load: async () => {
    const trips = await repo.listTrips();
    set({ trips, loaded: true });
  },

  create: async (fields, coverUri) => {
    const cover = coverUri ? await savePhoto(coverUri) : null;
    const trip = await repo.insertTrip({ ...fields, cover });
    set({ trips: [...get().trips, trip].sort(byStart) });
    return trip;
  },

  update: async (id, fields, coverChange) => {
    const prev = get().trips.find((t) => t.id === id);
    if (!prev) return;
    let cover = prev.cover;
    if (coverChange !== 'keep') {
      cover = coverChange ? await savePhoto(coverChange) : null;
    }
    const next: Trip = { ...prev, ...fields, cover };
    await repo.updateTrip(id, next);
    if (cover !== prev.cover) deletePhoto(prev.cover);
    set({ trips: get().trips.map((t) => (t.id === id ? next : t)).sort(byStart) });
  },

  remove: async (id) => {
    const files = await repo.deleteTrip(id);
    files.forEach(deletePhoto);
    set({ trips: get().trips.filter((t) => t.id !== id) });
  },
}));

export const useTrip = (id: number) => useTrips((s) => s.trips.find((t) => t.id === id));
