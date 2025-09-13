import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ImageBackground, StyleSheet, Pressable, ScrollView, Platform, StatusBar } from 'react-native';
import { useEffect, useState } from 'react';
import { Video } from 'expo-av';
import { useGuildStore } from '@/store/useGuildStore';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';

export default function ContentDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useGuildStore(s => s.content.find(c => c.id === id));
  const router = useRouter();

  if (!item) {
    return (
      <View style={styles.container}> 
        <Text style={styles.header}>Content not found</Text>
        <Pressable onPress={() => router.back()}><Text style={styles.link}>Go Back</Text></Pressable>
      </View>
    );
  }

  const premiumActive = useGuildStore(s => s.premiumActive);
  const signedInEmail = useGuildStore(s => s.signedInEmail);
  const locked = item.premiumOnly && !premiumActive;
  const [canPlay, setCanPlay] = useState<boolean>(Platform.OS === 'web');
  const [webSrc, setWebSrc] = useState<string | null>(null);
  const [isFs, setIsFs] = useState(false);

  // Do not force orientation on screen focus; only react to fullscreen changes

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Prepare a web-safe src: accept blob/data, or try to create an object URL when CORS allows
      setWebSrc(null);
      const url = item.previewUrl || '';
      // Pass through blob:/data: URLs directly (must be created in our origin to work)
      if (url.startsWith('blob:') || url.startsWith('data:')) {
        setWebSrc(url);
        return;
      }
      // Attempt fetch and object URL for video/* when CORS permits
      let cancelled = false;
      const controller = new AbortController();
      (async () => {
        try {
          const res = await fetch(url, { signal: controller.signal, mode: 'cors' });
          if (!res.ok) { if (!cancelled) setWebSrc(url); return; }
          const ct = (res.headers.get('content-type') || '').toLowerCase();
          // Only object-URL wrap known video content; otherwise use raw URL
          if (ct.startsWith('video/')) {
            const blob = await res.blob();
            const obj = URL.createObjectURL(blob);
            if (!cancelled) setWebSrc(obj);
          } else {
            if (!cancelled) setWebSrc(url);
          }
        } catch {
          if (!cancelled) setWebSrc(url);
        }
      })();
      return () => {
        cancelled = true;
        controller.abort();
        // Revoke any object URL we created
        if (webSrc && webSrc.startsWith('blob:')) {
          try { URL.revokeObjectURL(webSrc); } catch {}
        }
      };
    }
    let cancelled = false;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    (async () => {
      try {
        const res = await fetch(item.previewUrl, { method: 'HEAD', signal: controller.signal });
        if (!cancelled) setCanPlay(res.ok);
      } catch {
        if (!cancelled) setCanPlay(false);
      } finally {
        clearTimeout(t);
      }
    })();
    return () => { cancelled = true; clearTimeout(t); controller.abort(); };
  }, [item.previewUrl]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <ImageBackground source={{ uri: item.banner }} style={styles.banner} imageStyle={styles.bannerImage}>
        <View style={styles.bannerOverlay} />
      </ImageBackground>
      <View style={styles.section}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>{item.type.toUpperCase()} • {item.year}</Text>
        <Text style={styles.desc}>{item.description}</Text>
      </View>
      {locked ? (
        <View style={styles.section}>
          <View style={styles.lockBox}>
            <Text style={styles.lockTitle}>Premium Content</Text>
            <Text style={styles.lockDesc}>Sign in and upgrade to Premium to watch this title.</Text>
            <View style={styles.lockActions}>
              {!signedInEmail && (
                <Pressable onPress={() => router.push('/login')} style={[styles.ctaBtn, styles.ctaSecondary]}>
                  <Text style={styles.ctaSecondaryText} allowFontScaling={false}>Log In</Text>
                </Pressable>
              )}
              <Pressable onPress={() => router.push('/premium')} style={[styles.ctaBtn, styles.ctaPrimary]}>
                <Text style={styles.ctaPrimaryText} allowFontScaling={false}>Upgrade to Premium</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.playTitle}>Preview</Text>
          {Platform.OS === 'web' ? (
            // HTML5 video element on web for direct MP4 links
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={webSrc || item.previewUrl}
              controls
              playsInline
              preload="auto"
              style={{ width: '100%', height: 200, backgroundColor: '#000', borderRadius: 8 }}
            >
              <source src={webSrc || item.previewUrl} type="video/mp4" />
            </video>
          ) : canPlay ? (
            <Video
              source={{ uri: item.previewUrl }}
              style={styles.video}
              useNativeControls
              resizeMode={isFs ? 'cover' : 'contain'}
              isLooping
              usePoster
              posterSource={{ uri: item.banner }}
              posterStyle={{ resizeMode: 'cover' }}
              onFullscreenUpdate={async (e: any) => {
                const code = e?.fullscreenUpdate;
                try {
                  // 1 = didPresent, 3 = didDismiss
                  if (code === 1) {
                    setIsFs(true);
                    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
                    // Hide system UI for immersive fullscreen
                    if (Platform.OS === 'android') {
                      try {
                        await NavigationBar.setBehaviorAsync('overlay-swipe');
                        await NavigationBar.setPositionAsync('absolute');
                        await NavigationBar.setBackgroundColorAsync('#00000000');
                        setTimeout(() => {
                          NavigationBar.setVisibilityAsync('hidden').catch(() => {});
                        }, 50);
                      } catch {}
                    }
                    StatusBar.setHidden(true, 'fade');
                  } else if (code === 3) {
                    setIsFs(false);
                    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                    // Restore system UI
                    if (Platform.OS === 'android') {
                      try {
                        await NavigationBar.setVisibilityAsync('visible');
                        await NavigationBar.setBehaviorAsync('inset-swipe');
                        await NavigationBar.setPositionAsync('relative');
                        // Optional: set to opaque black (or skip to keep system default)
                        await NavigationBar.setBackgroundColorAsync('#000000');
                      } catch {}
                    }
                    StatusBar.setHidden(false, 'fade');
                  }
                } catch {}
              }}
            />
          ) : (
            <View style={[styles.video, { alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: '#94a3b8' }}>Preview unavailable. Check your connection.</Text>
            </View>
          )}
          {/* Orientation buttons removed per request */}
        </View>
      )}
    </ScrollView>
  );
}

// Allow using native HTML elements in TSX when targeting web
declare global {
  namespace JSX {
    interface IntrinsicElements {
      video: any;
      source: any;
    }
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19' },
  banner: { width: '100%', height: 280, backgroundColor: '#111827', justifyContent: 'flex-end' },
  bannerImage: { resizeMode: 'cover' },
  bannerOverlay: { height: 80, backgroundColor: 'rgba(0,0,0,0.35)' },
  section: { paddingHorizontal: 12, paddingTop: 12 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  meta: { color: '#94a3b8', marginTop: 4 },
  desc: { color: '#e5e7eb', marginTop: 8, lineHeight: 20 },
  playTitle: { color: '#fff', fontWeight: '700', fontSize: 18, marginBottom: 8 },
  video: { width: '100%', height: 200, backgroundColor: '#000', borderRadius: 8 },
  header: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  link: { color: '#7c3aed' },
  lockBox: { backgroundColor: '#111827', borderRadius: 12, padding: 16, borderColor: '#1f2937', borderWidth: 1 },
  lockTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  lockDesc: { color: '#cbd5e1', marginTop: 6 },
  lockActions: { flexDirection: 'row', marginTop: 12 },
  ctaBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, marginRight: 8 },
  ctaPrimary: { backgroundColor: '#7c3aed' },
  ctaPrimaryText: { color: '#fff', fontWeight: '800' },
  ctaSecondary: { backgroundColor: '#334155' },
  ctaSecondaryText: { color: '#fff', fontWeight: '800' },
});
