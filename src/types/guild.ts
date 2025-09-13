export type RankId = 'novice' | 'hunter' | 'captain' | 'elite' | 'legend';

export interface Rank {
  id: RankId;
  name: string;
  color: string;
  perks: string[];
  powerLevel: number; // 1-100
}

export interface Member {
  id: string;
  name: string;
  rankId: RankId;
  avatar?: string;
}

export type ContentType = 'movie' | 'anime';

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  year: number;
  poster: string; // url
  banner: string; // url
  previewUrl: string; // video url
  description: string;
  tags: string[];
  premiumOnly?: boolean;
}
