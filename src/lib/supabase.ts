import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extra = (Constants.expoConfig?.extra as any) || {};
const envUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL as string) || '';
const envAnon = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string) || '';
const supabaseUrl = (extra?.supabase?.url || envUrl || '').trim();
const supabaseAnonKey = (extra?.supabase?.anonKey || envAnon || '').trim();

// Mock Supabase client to avoid dependency issues on web while developing
let mockSession: any = null;
const authListeners = new Set<(event: string, session: any) => void>();
const notifyAuth = (event: 'SIGNED_IN' | 'SIGNED_OUT', session: any) => {
  authListeners.forEach((cb) => {
    try { cb(event, session); } catch {}
  });
};

const mockSupabaseClient = {
  auth: {
    getSession: async () => ({ data: { session: mockSession } }),
    onAuthStateChange: (cb: (event: string, session: any) => void) => {
      authListeners.add(cb);
      return { data: { subscription: { unsubscribe: () => authListeners.delete(cb) } } };
    },
    signInWithPassword: async ({ email }: { email: string; password: string }) => {
      const user = { id: `mock-${encodeURIComponent(email)}`, email };
      mockSession = { user };
      notifyAuth('SIGNED_IN', mockSession);
      return { data: { user, session: mockSession }, error: null };
    },
    signOut: async () => {
      mockSession = null;
      notifyAuth('SIGNED_OUT', { session: null });
      return { error: null };
    },
  },
  from: (_table?: string) => {
    return {
      // SELECT builder
      select: (_columns?: string) => {
        return {
          // Support ordering then resolve
          order: async (_col?: string, _opts?: any) => ({ data: [], error: null }),
          // Support filtering + single
          eq: (_col?: string, _val?: any) => ({
            single: async () => ({ data: null, error: null }),
          }),
          // Direct single call if used
          single: async () => ({ data: null, error: null }),
        } as any;
      },

      // INSERT builder
      insert: (_payload?: any) => ({
        select: () => ({
          single: async () => ({ data: Array.isArray(_payload) ? _payload[0] : _payload ?? null, error: null }),
        }),
      }),

      // UPSERT builder
      upsert: (_payload?: any) => ({
        select: () => ({
          single: async () => ({ data: _payload ?? null, error: null }),
        }),
      }),

      // UPDATE builder
      update: (_vals?: any) => ({
        eq: (_col?: string, _val?: any) => ({
          select: () => ({
            single: async () => ({ data: _vals ?? null, error: null }),
          }),
        }),
      }),

      // DELETE builder
      delete: () => ({
        eq: async (_col?: string, _val?: any) => ({ error: null }),
      }),
    } as any;
  },
  storage: {
    from: (_bucket?: string) => ({
      upload: async (_path?: string, _bytes?: Uint8Array, _opts?: any) => ({ data: { path: 'mock/path' }, error: null }),
      getPublicUrl: (_path?: string) => ({ data: { publicUrl: '' } }),
    }),
  },
};

let supabaseClient: any | null = null;
export function getSupabase() {
  if (supabaseClient) return supabaseClient;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const isWeb = Platform.OS === 'web';
  if (isWeb) {
    supabaseClient = mockSupabaseClient;
  } else {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    } as any);
  }
  return supabaseClient;
}

export async function fetchUserPremium() {
  const s = getSupabase() as any;
  if (!s) return null;
  const { data: sessionData } = await s.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return null;
  // Expect a table `profiles` with columns: id (uuid, pk, references auth.users), premium (boolean)
  const { data, error } = await s.from('profiles').select('premium').eq('id', uid).single();
  if (error) {
    // If no row, initialize a default profile with premium=false
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
