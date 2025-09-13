import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra as any) || {};
const envUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL as string) || '';
const envAnon = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string) || '';
const supabaseUrl = (extra?.supabase?.url || envUrl || '').trim();
const supabaseAnonKey = (extra?.supabase?.anonKey || envAnon || '').trim();

let supabaseClient: any | null = null;
export function getSupabase() {
  if (supabaseClient) return supabaseClient;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  } as any);
  return supabaseClient;
}

export async function fetchUserPremium() {
  const s = getSupabase() as any;
  if (!s) return null;
  const { data: sessionData } = await s.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return null;
  const { data, error } = await s.from('profiles').select('premium').eq('id', uid).single();
  if (error) {
    try {
      await s.from('profiles').upsert({ id: uid, premium: false }, { onConflict: 'id' });
      return false;
    } catch {
      return null;
    }
  }
  return Boolean(data?.premium);
}

export async function upsertUserPremium(premium: boolean) {
  const s = getSupabase() as any;
  if (!s) return false;
  const { data: sessionData } = await s.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return false;
  const payload: any = { id: user.id, premium };
  const { error } = await s.from('profiles').upsert(payload, { onConflict: 'id' });
  return !error;
}
