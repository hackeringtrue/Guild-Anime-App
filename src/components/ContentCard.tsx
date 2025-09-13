import { View, Text, ImageBackground, StyleSheet, Pressable } from 'react-native';
import type { ContentItem } from '@/types/guild';
import { useRouter } from 'expo-router';
import { useGuildStore } from '@/store/useGuildStore';
import { Ionicons } from '@expo/vector-icons';

export default function ContentCard({ item }: { item: ContentItem }) {
  const router = useRouter();
  const { premiumActive, signedInEmail } = useGuildStore();
  const locked = item.premiumOnly && !premiumActive;
  const card = (
    <View style={styles.card}>
      <View>
        <ImageBackground source={{ uri: item.poster }} style={styles.poster} imageStyle={styles.posterImage}>
          <View style={styles.gradient} />
        </ImageBackground>
        {locked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={24} color="#fff" />
            <Text style={styles.lockText}>Premium</Text>
          </View>
        )}
      </View>
      <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
    </View>
  );
  const onPress = () => {
    if (locked) router.push(signedInEmail ? '/premium' : '/login');
    else router.push({ pathname: '/content/[id]', params: { id: item.id } });
  };
  return (
    <Pressable onPress={onPress} hitSlop={6}>
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', marginBottom: 12 },
  poster: { width: '100%', height: 220, borderRadius: 10, overflow: 'hidden', backgroundColor: '#111827' },
  posterImage: { resizeMode: 'cover' },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 40, backgroundColor: 'rgba(0,0,0,0.35)' },
  title: { color: '#e5e7eb', marginTop: 6 },
  lockOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  lockText: { color: '#fff', marginTop: 6, fontWeight: '700' },
});
