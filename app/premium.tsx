import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useGuildStore } from '@/store/useGuildStore';
import { startPayment } from '@/lib/payments';
import { Platform } from 'react-native';
import { useStripe } from '@/lib/stripe-native';
import { getStripeApiBase } from '@/lib/stripe';
import { useRouter } from 'expo-router';
import { upsertUserPremium } from '@/lib/supabase';

export default function PremiumScreen() {
  const { premiumActive, setPremium, signedInEmail } = useGuildStore();
  const router = useRouter();
  const [confirmPlan, setConfirmPlan] = useState<null | 'monthly' | 'yearly'>(null);
  const stripe = useStripe();
  const apiBase = getStripeApiBase();

  async function payNative(plan: 'monthly' | 'yearly') {
    if (Platform.OS === 'web' || !apiBase) {
      router.push({ pathname: '/pay', params: { plan } });
      return;
    }
    try {
      const res = await fetch(`${apiBase}/payments/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error('Init failed');
      const json = await res.json();
      const { initPaymentSheet, presentPaymentSheet } = stripe;
      const init = await initPaymentSheet({
        paymentIntentClientSecret: json.paymentIntentClientSecret,
        merchantDisplayName: 'Guild Anime',
      });
      if (init.error) throw new Error(init.error.message);
  const present = await presentPaymentSheet();
      if (present.error) throw new Error(present.error.message);
  try { await upsertUserPremium(true); } catch {}
  setPremium(true);
      router.replace('/(tabs)');
    } catch (e) {
      // Fallback to in-app web if native fails
      router.push({ pathname: '/pay', params: { plan } });
    }
  }
  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.header}>Premium Plans</Text>
        <Text style={styles.sub}>Unlock all content, ad-free, 4K streaming.</Text>
      {!signedInEmail && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>Please log in to purchase a plan.</Text>
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => router.push('/login')}>
            <Text style={styles.btnText}>Log In</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.plan}>Monthly</Text>
        <Text style={styles.price}>$4.99</Text>
        {confirmPlan === 'monthly' ? (
          <View style={styles.confirm}>
            <Text style={styles.confirmText}>Confirm payment of $4.99?</Text>
            <View style={styles.confirmRow}>
              <Pressable style={[styles.btn, styles.btnSecondary, styles.btnInline]} onPress={() => setConfirmPlan(null)}>
                <Text style={styles.btnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnPrimary, styles.btnInline, styles.btnInlineRight]}
                onPress={async () => {
                  if (!signedInEmail) {
                    router.push('/login');
                    return;
                  }
                  await payNative('monthly');
                }}
              >
                <Text style={styles.btnText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            disabled={!signedInEmail}
            style={[styles.btn, styles.btnPrimary, !signedInEmail && styles.btnDisabled]}
            onPress={() => setConfirmPlan('monthly')}
          >
            <Text style={styles.btnText}>{premiumActive ? 'Active' : 'Choose Monthly'}</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.plan}>Yearly</Text>
        <Text style={styles.price}>$39.99</Text>
        {confirmPlan === 'yearly' ? (
          <View style={styles.confirm}>
            <Text style={styles.confirmText}>Confirm payment of $39.99?</Text>
            <View style={styles.confirmRow}>
              <Pressable style={[styles.btn, styles.btnSecondary, styles.btnInline]} onPress={() => setConfirmPlan(null)}>
                <Text style={styles.btnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnPrimary, styles.btnInline, styles.btnInlineRight]}
                onPress={async () => {
                  if (!signedInEmail) {
                    router.push('/login');
                    return;
                  }
                  await payNative('yearly');
                }}
              >
                <Text style={styles.btnText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            disabled={!signedInEmail}
            style={[styles.btn, styles.btnPrimary, !signedInEmail && styles.btnDisabled]}
            onPress={() => setConfirmPlan('yearly')}
          >
            <Text style={styles.btnText}>{premiumActive ? 'Active' : 'Choose Yearly'}</Text>
          </Pressable>
        )}
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  form: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  header: { color: '#fff', fontSize: 22, fontWeight: '800' },
  sub: { color: '#94a3b8', marginTop: 6, marginBottom: 16 },
  card: { backgroundColor: '#111827', padding: 16, borderRadius: 10, marginBottom: 12 },
  plan: { color: '#fff', fontSize: 18, fontWeight: '700' },
  price: { color: '#a78bfa', marginVertical: 6 },
  btn: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    width: '100%',
    alignSelf: 'stretch',
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...(Platform.OS === 'web' ? { display: 'block' as any } : {}),
  },
  // Use inside horizontal rows to avoid full-width stretching
  btnInline: {
    width: 'auto',
    alignSelf: 'auto',
    flex: 1,
    ...(Platform.OS === 'web' ? { display: 'flex' as any } : {}),
  },
  btnInlineRight: { marginLeft: 8 },
  btnPrimary: { backgroundColor: '#7c3aed' },
  btnSecondary: { backgroundColor: '#334155' },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  lineHeight: 22,
    textAlignVertical: 'center' as any,
    includeFontPadding: false as any,
  },
  notice: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1f2937', padding: 12, borderRadius: 10, marginBottom: 12 },
  noticeText: { color: '#cbd5e1', marginBottom: 8 },
  confirm: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1f2937', padding: 12, borderRadius: 10, marginTop: 8 },
  confirmText: { color: '#e5e7eb', marginBottom: 8 },
  confirmRow: { flexDirection: 'row', justifyContent: 'flex-end' },
});
