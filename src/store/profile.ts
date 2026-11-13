import { create } from 'zustand';
import * as repo from '@/db/profile';
import { deletePhoto, savePhoto } from '@/lib/photos';
import type { Profile } from '@/types';
import type { CoverChange } from './trips';

interface ProfileState {
  profile: Profile;
  stats: repo.ChapterStats;
  load: () => Promise<void>;
  refreshStats: () => Promise<void>;
  /** avatar: 'keep' | null (remove) | new source URI. */
  save: (fields: Omit<Profile, 'avatar'>, avatar: CoverChange) => Promise<void>;
}

export const useProfile = create<ProfileState>((set, get) => ({
  profile: { name: '', homeCity: '', avatar: null },
  stats: { chapters: 0, done: 0, photos: 0, byType: {} },

  load: async () => {
    set({ profile: await repo.getProfile() });
  },

  refreshStats: async () => {
    set({ stats: await repo.getChapterStats() });
  },

  save: async (fields, avatarChange) => {
    const prev = get().profile;
    let avatar = prev.avatar;
    if (avatarChange !== 'keep') avatar = avatarChange ? await savePhoto(avatarChange) : null;
    const next: Profile = { ...fields, avatar };
    await repo.saveProfile(next);
    if (avatar !== prev.avatar) deletePhoto(prev.avatar);
    set({ profile: next });
  },
}));
