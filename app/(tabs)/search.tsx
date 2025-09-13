import { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import ContentGrid from '@/components/ContentGrid';
import { useGuildStore } from '@/store/useGuildStore';

export default function SearchScreen() {
  const { content } = useGuildStore();
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return content.filter(c => c.title.toLowerCase().includes(s));
  }, [q, content]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search anime or movies..."
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />
      <ContentGrid items={results} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 12 },
  header: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: '#111827',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
});
