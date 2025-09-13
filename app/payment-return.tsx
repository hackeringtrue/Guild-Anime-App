import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGuildStore } from '@/store/useGuildStore';
import { useRouter } from 'expo-router';
import { upsertUserPremium } from '@/lib/supabase';

export default function PaymentReturn() {
  const setPremium = useGuildStore(s => s.setPremium);
  const router = useRouter();
  useEffect(() => {
    (async () => {
      // In a real integration, verify server-side and then persist premium.
      const ok = await upsertUserPremium(true);
      if (ok) setPremium(true);
      const t = setTimeout(() => router.replace('/(tabs)'), 800);
      return () => clearTimeout(t);
    })();
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Processing your membership…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19' },
  text: { color: '#fff' },
});
