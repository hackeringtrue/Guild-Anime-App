import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { getSupabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const [message, setMessage] = useState('Signing you in…');
  useEffect(() => {
    (async () => {
      const s = getSupabase();
      try {
        if (s) {
          // 1) Try OAuth code flow
          const code = params?.code?.toString();
          if (code) {
            await s.auth.exchangeCodeForSession({ authCode: code });
          } else {
            // 2) Try email magic link/hash tokens
            const initialUrl = await Linking.getInitialURL();
            if (initialUrl) {
              try {
                const u = new URL(initialUrl);
                const fragment = u.hash?.startsWith('#') ? u.hash.slice(1) : u.hash || '';
                const hashParams = new URLSearchParams(fragment);
                const access_token = hashParams.get('access_token') || undefined;
                const refresh_token = hashParams.get('refresh_token') || undefined;
                if (access_token && refresh_token) {
                  await s.auth.setSession({ access_token, refresh_token });
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }
        setMessage('Success! Redirecting…');
      } catch {
        setMessage('Signed in. You can close this window.');
      }
      const t = setTimeout(() => router.replace('/(tabs)'), 800);
      return () => clearTimeout(t);
    })();
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19' },
  text: { color: '#fff' },
});
