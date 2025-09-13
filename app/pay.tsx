import { useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Pressable, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

export default function PayScreen() {
  const { plan } = useLocalSearchParams<{ plan?: 'monthly' | 'yearly' }>();
  const router = useRouter();
  const links = (Constants.expoConfig?.extra as any)?.stripeLinks || {};
  const target = plan === 'yearly' ? links.yearly : links.monthly;
  const successUrl = (links.returnUrl as string) || Linking.createURL('/payment-return');
  const [initialUrl, setInitialUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!target) {
      router.replace('/premium');
      return;
    }
    setInitialUrl(target);
  }, [target]);

  if (!initialUrl) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Secure Checkout</Text>
        <View style={{ width: 48 }} />
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.error}>Could not load checkout.</Text>
          <Pressable
            style={styles.actionBtn}
            onPress={() => {
              setError(null); setLoading(true);
              setInitialUrl(initialUrl + '');
            }}
          >
            <Text style={styles.actionText}>Try Again</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: '#334155' }]}
            onPress={async () => {
              try { await Linking.openURL(initialUrl); } catch {}
            }}
          >
            <Text style={styles.actionText}>Open in Browser</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <WebView
            source={{ uri: initialUrl }}
            startInLoadingState
            incognito
            onLoadStart={() => { setLoading(true); setError(null); }}
            onLoadEnd={() => setLoading(false)}
            onError={() => setError('load-error')}
            onShouldStartLoadWithRequest={(req) => {
              // Intercept success return and finish in-app
              if (req.url.startsWith(successUrl)) {
                router.replace('/payment-return');
                return false;
              }
              return true;
            }}
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#7c3aed" />
              <Text style={styles.loadingText}>Loading checkout…</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19', padding: 16 },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#1f2937' },
  backBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  backText: { color: '#fff', fontSize: 16 },
  title: { color: '#fff', fontWeight: '700' },
  loadingOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 48, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#cbd5e1', marginTop: 8 },
  error: { color: '#f87171', marginBottom: 12 },
  actionBtn: { backgroundColor: '#7c3aed', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, marginTop: 8 },
  actionText: { color: '#fff', fontWeight: '700' },
});
