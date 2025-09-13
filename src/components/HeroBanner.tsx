import { ImageBackground, View, Text, StyleSheet, Pressable } from 'react-native';
import type { ContentItem } from '@/types/guild';
import { useRouter } from 'expo-router';
import { useGuildStore } from '@/store/useGuildStore';

export default function HeroBanner({ item }: { item: ContentItem }) {
  const router = useRouter();
  const { premiumActive, signedInEmail } = useGuildStore();
  const locked = item.premiumOnly && !premiumActive;
  const go = () => router.push(locked ? (signedInEmail ? '/premium' : '/login') : ({ pathname: '/content/[id]', params: { id: item.id } } as any));
  return (
    <ImageBackground source={{ uri: item.banner }} style={styles.bg}>
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.actions}>
          <Pressable onPress={go} hitSlop={6} style={[styles.btn, styles.play]}><Text style={styles.btnText}>Play</Text></Pressable>
          <Pressable onPress={go} hitSlop={6} style={[styles.btn, styles.info]}><Text style={styles.infoText}>More Info</Text></Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { height: 280, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject as any, backgroundColor: 'rgba(0,0,0,0.35)' },
  content: { padding: 16 },
  title: { color: '#fff', fontSize: 26, fontWeight: '900' },
  desc: { color: '#e5e7eb', marginTop: 6 },
  actions: { flexDirection: 'row', marginTop: 10 },
  btn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, marginRight: 8 },
  play: { backgroundColor: '#fff' },
  info: { backgroundColor: '#374151' },
  btnText: { color: '#000', fontWeight: '800' },
  infoText: { color: '#fff', fontWeight: '800' },
});
