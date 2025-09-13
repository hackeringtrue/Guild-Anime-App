import { create } from 'zustand';
import type { ContentItem, Member, Rank } from '@/types/guild';
import { mockContent, mockMember, mockRanks } from '@/data/mock';

interface GuildState {
  ranks: Rank[];
  members: Member[];
  currentMember?: Member;
  content: ContentItem[];
  featured: ContentItem[];
  setContent: (items: ContentItem[]) => void;
  premiumActive: boolean;
  setPremium: (active: boolean) => void;
  signedInEmail?: string;
  userId?: string;
  signIn: (email: string, userId?: string) => void;
  signOut: () => void;
}

export const useGuildStore = create<GuildState>((set, get) => ({
  ranks: mockRanks,
  members: [mockMember],
  currentMember: mockMember,
  content: mockContent,
  featured: mockContent.slice(0, 6),
  setContent: (items: ContentItem[]) => set({ content: items, featured: items.slice(0, 6) }),
  premiumActive: false,
  setPremium: (active: boolean) => set({ premiumActive: active }),
  signedInEmail: undefined,
  userId: undefined,
  signIn: (email: string, userId?: string) => set({ signedInEmail: email, userId }),
  signOut: () => set({ signedInEmail: undefined, userId: undefined, premiumActive: false }),
}));
