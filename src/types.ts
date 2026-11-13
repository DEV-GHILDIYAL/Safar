export type ChapterType = 'train' | 'flight' | 'bus' | 'cab' | 'stay' | 'activity' | 'food' | 'note';

export type TripStatus = 'upcoming' | 'current' | 'past';

/** All timestamps are epoch milliseconds (local time when displayed). */
export interface Trip {
  id: number;
  title: string;
  destination: string;
  startDate: number; // local midnight of first day
  endDate: number; // local midnight of last day
  cover: string | null; // filename inside the photos dir
  notes: string;
  createdAt: number;
}

export type TripInput = Omit<Trip, 'id' | 'createdAt'>;

export interface Chapter {
  id: number;
  tripId: number;
  type: ChapterType;
  title: string;
  startAt: number;
  endAt: number | null;
  fromPlace: string;
  toPlace: string;
  bookingRef: string;
  notes: string;
  done: boolean;
  sortOrder: number;
  createdAt: number;
}

export type ChapterInput = Omit<Chapter, 'id' | 'createdAt' | 'sortOrder' | 'done'>;

export interface Memory {
  id: number;
  chapterId: number;
  tripId: number;
  file: string; // filename inside the photos dir
  caption: string;
  takenAt: number;
  createdAt: number;
}
