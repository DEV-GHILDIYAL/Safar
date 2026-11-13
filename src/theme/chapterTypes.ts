import type { IconName } from '@/components/Icon';
import type { ChapterType } from '@/types';

export interface ChapterTypeMeta {
  label: string;
  icon: IconName;
  color: string;
  /** Whether from/to fields make sense for this type. */
  route: boolean;
}

export const CHAPTER_TYPES: Record<ChapterType, ChapterTypeMeta> = {
  train: { label: 'Train', icon: 'train', color: '#4F8CFF', route: true },
  flight: { label: 'Flight', icon: 'airplane', color: '#38BDF8', route: true },
  bus: { label: 'Bus', icon: 'bus-side', color: '#A78BFA', route: true },
  cab: { label: 'Cab', icon: 'taxi', color: '#FACC15', route: true },
  stay: { label: 'Stay', icon: 'bed-outline', color: '#F472B6', route: false },
  activity: { label: 'Activity', icon: 'compass-outline', color: '#34D399', route: false },
  food: { label: 'Food', icon: 'silverware-fork-knife', color: '#FB923C', route: false },
  note: { label: 'Note', icon: 'note-text-outline', color: '#94A3B8', route: false },
};

export const CHAPTER_TYPE_ORDER: ChapterType[] = ['train', 'flight', 'bus', 'cab', 'stay', 'activity', 'food', 'note'];

/** Hex colour with alpha (0-1) appended, for soft tints. */
export function tint(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`;
}
