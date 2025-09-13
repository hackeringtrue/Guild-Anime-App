import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useGuildStore } from '@/store/useGuildStore';

export default function MembershipScreen() {
  const { premiumActive, ranks, currentMember } = useGuildStore();
  const myRank = ranks.find(r => r.id === currentMember?.rankId);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Membership</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Status</Text>
        <View style={[styles.statusPill, premiumActive ? styles.statusOn : styles.statusOff]}>
          <Text style={styles.statusText}>{premiumActive ? 'Premium Active' : 'Free Tier'}</Text>
        </View>
      </View>

      <Text style={styles.header}>Your Rank</Text>
      <Text style={styles.text}>{myRank?.name} • Power {myRank?.powerLevel}</Text>

      <Text style={styles.header}>Perks</Text>
      <FlatList
        data={myRank?.perks ?? []}
        keyExtractor={(p, i) => `${p}-${i}`}
        renderItem={({ item }) => <Text style={styles.text}>• {item}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  header: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  label: { color: '#e5e7eb', fontSize: 16 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusOn: { backgroundColor: '#14532d' },
  statusOff: { backgroundColor: '#1f2937' },
  statusText: { color: '#fff', fontWeight: '700' },
  text: { color: '#e5e7eb', marginTop: 6 },
});
