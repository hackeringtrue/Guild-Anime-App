import 'react-native-gesture-handler';
import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { useEffect } from 'react';
import { getSupabase, fetchUserPremium } from '@/lib/supabase';
import { fetchAllContent } from '@/lib/content';
import { useGuildStore } from '@/store/useGuildStore';
import { StripeProvider } from '@/lib/stripe-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout() {
  console.log('🔥 RootLayout rendering on platform:', Platform.OS);
  console.log('🔥 Current time:', new Date().toISOString());

  // Try to trigger an alert for debugging
  if (Platform.OS === 'web') {
    console.log('🔥 About to show alert on web');
    // alert('DEBUG: RootLayout is executing on web!');
  }

  const { signIn, signOut, setPremium, setContent } = useGuildStore();
  useEffect(() => {
    const s = getSupabase();
    if (!s) return;
    // fetch content
    fetchAllContent().then(items => { if (items.length) setContent(items); });
    s.auth.getSession().then(({ data }: any) => {
      const user = data.session?.user;
      if (user?.email) {
        signIn(user.email, user.id);
        fetchUserPremium().then(val => { if (typeof val === 'boolean') setPremium(val); });
      }
    });
    const { data: sub } = s.auth.onAuthStateChange((_event: any, session: any) => {
      const user = session?.user;
      if (user?.email) {
        signIn(user.email, user.id);
        fetchUserPremium().then(val => { if (typeof val === 'boolean') setPremium(val); });
      }
      else signOut();
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);
  const publishableKey = (Constants.expoConfig?.extra as any)?.stripe?.publishableKey;
  const content = (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
  if (Platform.OS === 'web' || !publishableKey) return (
    <ErrorBoundary>
      {content}
    </ErrorBoundary>
  );
  return (
    <ErrorBoundary>
      <StripeProvider publishableKey={publishableKey}>
        {content}
      </StripeProvider>
    </ErrorBoundary>
  );
}
