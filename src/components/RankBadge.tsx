import { View, Text, StyleSheet } from 'react-native';
import { useGuildStore } from '@/store/useGuildStore';

export default function RankBadge() {
  const { ranks, currentMember } = useGuildStore();
  const rank = ranks.find(r => r.id === currentMember?.rankId);
  if (!rank) return null;
  return (
    <View style={[styles.badge, { borderColor: rank.color }]}> 
      <Text style={[styles.text, { color: rank.color }]}>{rank.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: { fontWeight: '700' },
});
