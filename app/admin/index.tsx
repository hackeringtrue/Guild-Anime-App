import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator, Platform } from 'react-native';
import { Platform as RNPlatform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { fetchAllContent, upsertContent, deleteContent, uploadToBucket } from '@/lib/content';
import type { ContentItem } from '@/types/guild';
import { getSupabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function AdminScreen() {
  const router = useRouter();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<ContentItem>>({ type: 'movie', tags: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAllContent();
        setItems(data);
      } catch (e: any) {
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const s = getSupabase() as any;
    if (!s) return;
    let mounted = true;
    s.auth.getSession().then(({ data }: any) => {
      if (!mounted) return;
      setUserEmail(data?.session?.user?.email ?? null);
      setUserId(data?.session?.user?.id ?? null);
    });
    const { data } = s.auth.onAuthStateChange((_event: string, session: any) => {
      if (!mounted) return;
      setUserEmail(session?.user?.email ?? null);
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      mounted = false;
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  function guessContentType(name: string, fallback?: string) {
    const lower = name.toLowerCase();
    const ext = lower.includes('.') ? lower.split('.').pop() : '';
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'gif':
        return 'image/gif';
      case 'mp4':
        return 'video/mp4';
      case 'mov':
        return 'video/quicktime';
      case 'webm':
        return 'video/webm';
      case 'mkv':
        return 'video/x-matroska';
      case 'm3u8':
        return 'application/vnd.apple.mpegurl';
      default:
        return fallback || 'application/octet-stream';
    }
  }

  async function pickAndUpload(bucket: string, field: 'poster' | 'banner' | 'previewUrl') {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.length) return;
    const asset = res.assets[0];
    const uri = asset.uri;
    const name = asset.name || uri.split('/').pop() || `${field}-${Date.now()}`;
    const ctype = asset.mimeType || guessContentType(name);
    const bytes = new Uint8Array(await (await fetch(uri)).arrayBuffer());
    const key = `${field}/${Date.now()}-${name}`;
    const url = await uploadToBucket(bucket, key, bytes, ctype);
    if (url) setEditing(prev => ({ ...prev, [field]: url }));
  }

  async function save() {
    setSaving(true);
    const out = await upsertContent(editing);
    if (out) {
      setItems(prev => {
        const idx = prev.findIndex(i => i.id === out.id);
        if (idx >= 0) {
          const next = [...prev]; next[idx] = out; return next;
        }
        return [out, ...prev];
      });
      setEditing({ type: 'movie', tags: [] });
    } else {
      setError('Save failed. Are you authorized to write content?');
    }
    setSaving(false);
  }

  async function del(id: string) {
    const ok = await deleteContent(id);
    if (ok) setItems(prev => prev.filter(i => i.id !== id));
  }

  if (!unlocked) {
    return (
      <View style={styles.center}>
        <Text style={[styles.h1, { marginBottom: 12 }]}>Admin Access</Text>
        <TextInput
          value={pwd}
          onChangeText={setPwd}
          placeholder="Enter admin password"
          placeholderTextColor="#64748b"
          secureTextEntry
          style={[styles.input, { width: '80%', maxWidth: 360 }]}
        />
        <Pressable
          style={[styles.btn, { marginTop: 12 }]}
          onPress={() => setUnlocked(pwd.trim() === (process.env.EXPO_PUBLIC_ADMIN_PASSWORD || 'admin123'))}
        >
          <Text style={styles.btnText}>Unlock</Text>
        </Pressable>
        <Text style={{ color: '#94a3b8', marginTop: 8 }}>Default: admin123 (change EXPO_PUBLIC_ADMIN_PASSWORD)</Text>
      </View>
    );
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color="#7c3aed" /></View>;

  return (
    <View style={styles.container}>
      <View style={[styles.banner, { backgroundColor: '#16a34a' }]}>
        <Text style={[styles.bannerText, { color: '#fff' }]}>Connected to Supabase (cloud)</Text>
      </View>
      <View style={[styles.banner, { backgroundColor: '#0f172a' }]}>
        <Text style={[styles.bannerText, { color: '#93c5fd' }]}>Auth: {userEmail ? `Signed in as ${userEmail}` : 'Not signed in'}</Text>
        {userId ? <Text style={[styles.bannerText, { color: '#94a3b8', marginTop: 4 }]}>User ID: {userId}</Text> : null}
        {!userId ? (
          <Pressable style={[styles.btn, { marginTop: 8 }]} onPress={() => router.push('/login')}>
            <Text style={styles.btnText}>Go to Login</Text>
          </Pressable>
        ) : null}
      </View>
      {error && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{error}</Text>
          <Pressable style={[styles.btn, { marginTop: 8 }]} onPress={() => {
            setError(null);
            setLoading(true);
            fetchAllContent().then(d => { setItems(d); setLoading(false); }).catch(() => { setError('Failed to load content'); setLoading(false); });
          }}>
            <Text style={styles.btnText}>Retry</Text>
          </Pressable>
        </View>
      )}
      <Text style={styles.h1}>Admin: Content</Text>
      <View style={styles.editor}>
        <Text style={styles.label}>Title</Text>
        <TextInput value={editing.title || ''} onChangeText={t => setEditing(p => ({ ...p, title: t }))} style={styles.input} />

        <Text style={styles.label}>Type</Text>
        <View style={styles.row}>
          {(['movie','anime'] as const).map(t => (
            <Pressable key={t} onPress={() => setEditing(p => ({ ...p, type: t }))} style={[styles.chip, editing.type === t && styles.chipOn]}>
              <Text style={styles.chipText}>{t}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Year</Text>
        <TextInput value={String(editing.year || '')} onChangeText={t => setEditing(p => ({ ...p, year: Number(t) || 0 }))} style={styles.input} keyboardType="numeric" />

        <Text style={styles.label}>Description</Text>
        <TextInput value={editing.description || ''} onChangeText={t => setEditing(p => ({ ...p, description: t }))} style={[styles.input, { height: 80 }]} multiline />

        <Text style={styles.label}>Poster</Text>
        <View style={styles.row}>
          <TextInput value={editing.poster || ''} onChangeText={t => setEditing(p => ({ ...p, poster: t }))} style={[styles.input, { flex: 1 }]} />
          <Pressable style={styles.btn} onPress={() => pickAndUpload('media', 'poster')}><Text style={styles.btnText}>Upload</Text></Pressable>
        </View>

        <Text style={styles.label}>Banner</Text>
        <View style={styles.row}>
          <TextInput value={editing.banner || ''} onChangeText={t => setEditing(p => ({ ...p, banner: t }))} style={[styles.input, { flex: 1 }]} />
          <Pressable style={styles.btn} onPress={() => pickAndUpload('media', 'banner')}><Text style={styles.btnText}>Upload</Text></Pressable>
        </View>

        <Text style={styles.label}>Preview Video URL</Text>
        <View style={styles.row}>
          <TextInput value={editing.previewUrl || ''} onChangeText={t => setEditing(p => ({ ...p, previewUrl: t }))} style={[styles.input, { flex: 1 }]} />
          <Pressable style={styles.btn} onPress={() => pickAndUpload('media', 'previewUrl')}><Text style={styles.btnText}>Upload</Text></Pressable>
        </View>

        <Text style={styles.label}>Premium Only</Text>
        <View style={styles.row}>
          {([false,true] as const).map(v => (
            <Pressable key={String(v)} onPress={() => setEditing(p => ({ ...p, premiumOnly: v }))} style={[styles.chip, editing.premiumOnly === v && styles.chipOn]}>
              <Text style={styles.chipText}>{String(v)}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable disabled={saving} onPress={save} style={[styles.btn, saving && { opacity: .6 }]}>
          <Text style={styles.btnText}>{editing.id ? 'Update' : 'Create'}</Text>
        </Pressable>
      </View>

      <Text style={styles.h2}>All Content</Text>
      {items.length === 0 && !loading && !error && (
        <Text style={{ color: '#94a3b8', marginBottom: 8 }}>No content yet. Create your first item above.</Text>
      )}
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemMeta}>{item.type} • {item.year} • {item.premiumOnly ? 'Premium' : 'Free'}</Text>
            </View>
            <Pressable onPress={() => setEditing(item)} style={[styles.btn, { marginRight: 8 }]}><Text style={styles.btnText}>Edit</Text></Pressable>
            <Pressable onPress={() => del(item.id)} style={[styles.btn, { backgroundColor: '#b91c1c' }]}><Text style={styles.btnText}>Delete</Text></Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19' },
  h1: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 12 },
  h2: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  editor: { backgroundColor: '#111827', borderRadius: 10, padding: 12 },
  label: { color: '#e5e7eb', marginTop: 8, marginBottom: 4 },
  input: { backgroundColor: '#0f172a', color: '#fff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: Platform.OS==='android'?10:12 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  chip: { backgroundColor: '#1f2937', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipOn: { backgroundColor: '#7c3aed' },
  chipText: { color: '#fff' },
  btn: { backgroundColor: '#7c3aed', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderRadius: 10, padding: 12, marginBottom: 8 },
  itemTitle: { color: '#fff', fontWeight: '800' },
  itemMeta: { color: '#94a3b8' },
  banner: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1f2937', padding: 12, borderRadius: 10, marginBottom: 12 },
  bannerText: { color: '#fca5a5' },
});
