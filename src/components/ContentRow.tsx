import { ScrollView, View, Text, StyleSheet } from 'react-native';
import type { ContentItem } from '@/types/guild';
import ContentCard from './ContentCard';

export default function ContentRow({ title, items }: { title: string; items: ContentItem[] }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {items.map(it => (
            <View key={it.id} style={styles.cell}>
              <ContentCard item={it} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16 },
  title: { color: '#fff', fontWeight: '800', fontSize: 18, paddingHorizontal: 12, marginBottom: 8 },
  row: { flexDirection: 'row', paddingHorizontal: 12 },
  cell: { width: 140, marginRight: 10 },
});
