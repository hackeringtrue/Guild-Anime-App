import { getSupabase } from '@/lib/supabase';
import type { ContentItem } from '@/types/guild';

export type DbContent = {
  id: string;
  title: string;
  type: 'movie' | 'anime';
  year: number;
  poster: string;
  banner: string;
  preview_url: string;
  description: string;
  tags: string[];
  premium_only: boolean;
};

export function mapDbToContent(row: DbContent): ContentItem {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    year: row.year,
    poster: row.poster,
    banner: row.banner,
    previewUrl: row.preview_url,
    description: row.description,
    tags: row.tags || [],
    premiumOnly: !!row.premium_only,
  };
}

export async function fetchAllContent(): Promise<ContentItem[]> {
  const s = getSupabase() as any;
  if (!s) return [];
  const { data, error } = await s.from('content').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as DbContent[]).map(mapDbToContent);
}

export async function upsertContent(item: Partial<ContentItem> & { id?: string }) {
  const s = getSupabase() as any;
  if (!s) return null;
  try {
    const { data: sess } = await s.auth.getSession();
    const u = sess?.session?.user;
    console.log('[content.upsert] user', u?.id, u?.email);
  } catch {}
  const payload: any = {};
  if (item.id) payload.id = item.id;
  if (typeof item.title !== 'undefined') payload.title = item.title;
  if (typeof item.type !== 'undefined') payload.type = item.type;
  if (typeof item.year !== 'undefined') payload.year = item.year;
  if (typeof item.poster !== 'undefined') payload.poster = item.poster;
  if (typeof item.banner !== 'undefined') payload.banner = item.banner;
  if (typeof item.previewUrl !== 'undefined') payload.preview_url = item.previewUrl;
  if (typeof item.description !== 'undefined') payload.description = item.description;
  if (typeof item.tags !== 'undefined') payload.tags = item.tags ?? [];
  if (typeof item.premiumOnly !== 'undefined') payload.premium_only = !!item.premiumOnly;
  const { data, error } = await s.from('content').upsert(payload).select('*').single();
  if (error) {
    console.error('[content.upsert] error', error?.message || error);
    return null;
  }
  return mapDbToContent(data as DbContent);
}

export async function deleteContent(id: string) {
  const s = getSupabase() as any;
  if (!s) return false;
  const { error } = await s.from('content').delete().eq('id', id);
  return !error;
}

export async function uploadToBucket(bucket: string, fileName: string, bytes: Uint8Array, contentType: string) {
  const s = getSupabase() as any;
  if (!s) return null;
  const { data, error } = await s.storage.from(bucket).upload(fileName, bytes, { contentType, upsert: true });
  if (error) return null;
  const { data: pub } = s.storage.from(bucket).getPublicUrl(data.path);
  return pub.publicUrl as string;
}
