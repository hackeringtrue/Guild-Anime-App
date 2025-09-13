import ContentGrid from '@/components/ContentGrid';
import { useGuildStore } from '@/store/useGuildStore';
import { View, Text, StyleSheet } from 'react-native';

export default function MoviesScreen() {
  const { content } = useGuildStore();
  const items = content.filter(c => c.type === 'movie');
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Movies</Text>
      <ContentGrid items={items} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 12 },
  header: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
});
