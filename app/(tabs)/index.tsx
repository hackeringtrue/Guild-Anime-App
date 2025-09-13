import { Link } from 'expo-router';
import { View, Text, ScrollView, Image, StyleSheet, Pressable } from 'react-native';
import { useGuildStore } from '@/store/useGuildStore';
import ContentGrid from '@/components/ContentGrid';
import HeroBanner from '@/components/HeroBanner';
import ContentRow from '@/components/ContentRow';
import RankBadge from '@/components/RankBadge';

export default function HomeScreen() {
  const { featured, premiumActive, currentMember, signedInEmail } = useGuildStore();

  // Debug: Add visible debug text
  console.log('HomeScreen rendering', { featured: featured.length, premiumActive, currentMember });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>

      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {currentMember?.name ?? 'Guild Member'}</Text>
        <Text style={styles.subtitle}>{premiumActive ? 'Premium Active' : 'Free Tier'}</Text>
        <RankBadge />
        {!signedInEmail ? (
          <Link href="/login" asChild>
            <Pressable style={styles.cta}><Text style={styles.ctaText} allowFontScaling={false}>Login</Text></Pressable>
          </Link>
        ) : !premiumActive ? (
          <Link href="/premium" asChild>
            <Pressable style={styles.cta}><Text style={styles.ctaText} allowFontScaling={false}>Go Premium</Text></Pressable>
          </Link>
        ) : (
          <Link href="/store" asChild>
            <Pressable style={styles.cta}><Text style={styles.ctaText} allowFontScaling={false}>Membership</Text></Pressable>
          </Link>
        )}
      </View>

      {featured[0] && <HeroBanner item={featured[0]} />}

      <ContentRow title="Trending Now" items={featured} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Perks</Text>
        <Text style={styles.perk}>• No ads (Elite+)</Text>
        <Text style={styles.perk}>• 4K streaming (Elite)</Text>
        <Text style={styles.perk}>• Early access (Legend)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0d' },
  header: { padding: 16, backgroundColor: 'transparent' },
  title: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#b3b3b3', marginTop: 4 },
  cta: {
    marginTop: 10,
    backgroundColor: '#e50914',
    borderRadius: 12,
    alignSelf: 'flex-start',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    textAlignVertical: 'center' as any,
    includeFontPadding: false as any,
  },
  carousel: { paddingLeft: 12, marginTop: 8 },
  card: { marginRight: 12, width: 160 },
  poster: { width: 160, height: 90, borderRadius: 8, backgroundColor: '#222' },
  cardTitle: { color: '#ffffff', marginTop: 6 },
  section: { paddingHorizontal: 12, marginTop: 16 },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  perk: { color: '#b3b3b3', marginBottom: 4 },
});
