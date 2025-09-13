import { View, StyleSheet } from 'react-native';
import ContentCard from './ContentCard';
import type { ContentItem } from '@/types/guild';

export default function ContentGrid({ items }: { items: ContentItem[] }) {
  return (
    <View style={styles.grid}>
      {items.map(it => (
        <View key={it.id} style={{ width: '48%' }}>
          <ContentCard item={it} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
