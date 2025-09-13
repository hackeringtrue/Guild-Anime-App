import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { router } from 'expo-router';

// Kept for backward compatibility; Premium screen now uses in-app /pay
export async function startPayment(plan: 'monthly' | 'yearly') {
  const links = (Constants.expoConfig?.extra as any)?.stripeLinks || {};
  const url = plan === 'monthly' ? links.monthly : links.yearly;
  const returnUrl: string | undefined = links.returnUrl;
  if (url) {
    await Linking.openURL(url);
    return;
  }
  // Dev fallback: no link configured
  if (returnUrl) {
    try {
      await Linking.openURL(returnUrl);
      return;
    } catch {}
  }
  // Prefer in-app navigation on web to avoid blank tabs
  if (Platform.OS === 'web') {
    try { router.push('/payment-return'); return; } catch {}
  }
  try {
    const fallback = Linking.createURL('/payment-return');
    await Linking.openURL(fallback);
  } catch {
    try { router.push('/payment-return'); } catch {}
  }
}
