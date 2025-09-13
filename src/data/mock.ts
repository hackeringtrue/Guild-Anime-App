import type { ContentItem, Member, Rank } from '@/types/guild';

export const mockRanks: Rank[] = [
  { id: 'novice', name: 'Novice', color: '#9CA3AF', perks: ['Access free content'], powerLevel: 10 },
  { id: 'hunter', name: 'Hunter', color: '#60A5FA', perks: ['HD streaming', 'Faster search'], powerLevel: 30 },
  { id: 'captain', name: 'Captain', color: '#34D399', perks: ['No ads', 'Priority support'], powerLevel: 50 },
  { id: 'elite', name: 'Elite', color: '#F59E0B', perks: ['4K streaming', 'Early access'], powerLevel: 75 },
  { id: 'legend', name: 'Legend', color: '#A78BFA', perks: ['All perks', 'Beta features'], powerLevel: 95 },
];

export const mockMember: Member = {
  id: 'u1',
  name: 'Akira',
  rankId: 'elite',
  avatar: 'https://placehold.co/128x128/png',
};

const placeholderPoster = 'https://placehold.co/300x450/png';
const placeholderBanner = 'https://placehold.co/1200x600/png';
const placeholderVideo = 'https://www.w3schools.com/html/mov_bbb.mp4';

export const mockContent: ContentItem[] = [
  {
    id: 'c1',
    title: 'Spirit Blade',
    type: 'anime',
    year: 2022,
    poster: placeholderPoster,
    banner: placeholderBanner,
    previewUrl: placeholderVideo,
    description: 'A young swordsman awakens an ancient power to defend his guild.',
    tags: ['action', 'fantasy'],
    premiumOnly: true,
  },
  {
    id: 'c2',
    title: 'Neon Drift',
    type: 'movie',
    year: 2023,
    poster: placeholderPoster,
    banner: placeholderBanner,
    previewUrl: placeholderVideo,
    description: 'Street racers battle in a neon-soaked metropolis.',
    tags: ['thriller'],
  },
  {
    id: 'c3',
    title: 'Skybound Heroes',
    type: 'anime',
    year: 2021,
    poster: placeholderPoster,
    banner: placeholderBanner,
    previewUrl: placeholderVideo,
    description: 'Cadets train to become guardians of floating cities.',
    tags: ['adventure'],
    premiumOnly: true,
  },
  {
    id: 'c4',
    title: 'Crimson Oath',
    type: 'movie',
    year: 2020,
    poster: placeholderPoster,
    banner: placeholderBanner,
    previewUrl: placeholderVideo,
    description: 'A retired assassin must protect a new guild leader.',
    tags: ['action', 'drama'],
  },
  {
    id: 'c5',
    title: 'Arc Spirit',
    type: 'anime',
    year: 2019,
    poster: placeholderPoster,
    banner: placeholderBanner,
    previewUrl: placeholderVideo,
    description: 'Mystic arcs grant unimaginable powers to chosen members.',
    tags: ['mystery'],
  },
  {
    id: 'c6',
    title: 'Zero Hour',
    type: 'movie',
    year: 2018,
    poster: placeholderPoster,
    banner: placeholderBanner,
    previewUrl: placeholderVideo,
    description: 'Time runs out for a rogue agent.',
    tags: ['sci-fi'],
  }
];
