import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Platform } from 'react-native';
import { useGuildStore } from '@/store/useGuildStore';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { getSupabase } from '@/lib/supabase';

export default function LoginScreen() {
  const { signedInEmail, signIn, signOut } = useGuildStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.header}>Account</Text>
        {signedInEmail ? (
          <>
            <Text style={styles.text}>Signed in as {signedInEmail}</Text>
            <Pressable
              style={styles.btn}
              onPress={() => {
                signOut();
                router.replace('/(tabs)');
              }}
            >
              <Text style={styles.btnText}>Sign Out</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.text}>Sign in with email + password</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              style={styles.input}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            {info && <Text style={styles.info}>{info}</Text>}
            <Pressable
              style={styles.btn}
              onPress={() => {
                setError(null); setInfo(null);
                (async () => {
                  const supabase = getSupabase();
                  if (!supabase) {
                    setError('Auth is not configured. Add Supabase keys in app.json or set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
                    return;
                  }
                  const e = email.trim();
                  if (!e || !password) {
                    setError('Enter email and password');
                    return;
                  }
                  const { error: err, data } = await supabase.auth.signInWithPassword({ email: e, password });
                  if (err) {
                    setError(err.message);
                    return;
                  }
                  signIn(data.user.email || e);
                  router.replace('/(tabs)');
                })();
              }}
            >
              <Text style={styles.btnText}>Sign In</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnSecondary]}
              onPress={() => {
                setError(null); setInfo(null);
                (async () => {
                  const supabase = getSupabase();
                  if (!supabase) {
                    setError('Auth is not configured. Add Supabase keys in app.json or set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
                    return;
                  }
                  const e = email.trim();
                  if (!e || !password) {
                    setError('Enter email and password');
                    return;
                  }
                  const extras: any = Constants.expoConfig?.extra || {};
                  const customWeb = extras?.auth?.webRedirectBase as string | undefined;
                  const returnUrl = customWeb
                    ? `${customWeb.replace(/\/$/, '')}/auth-callback`
                    : Linking.createURL('/auth-callback');
                  const { error: err, data } = await supabase.auth.signUp({
                    email: e,
                    password,
                    options: {
                      emailRedirectTo: returnUrl,
                    },
                  });
                  if (err) {
                    setError(err.message);
                    return;
                  }
                  if (data.session) {
                    // Email confirmation not required; signed in immediately
                    signIn(data.user?.email || e);
                    router.replace('/(tabs)');
                  } else {
                    setInfo('Check your email to confirm your account. After you click the link, we\'ll sign you in automatically.');
                  }
                })();
              }}
            >
              <Text style={styles.btnText}>Sign Up</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnSecondary]}
              onPress={() => {
                setError(null); setInfo(null);
                (async () => {
                  const supabase = getSupabase();
                  if (!supabase) {
                    setError('Auth is not configured. Add Supabase keys in app.json or set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
                    return;
                  }
                  const e = email.trim();
                  if (!e) {
                    setError('Enter your email to resend');
                    return;
                  }
                  const extras: any = Constants.expoConfig?.extra || {};
                  const customWeb = extras?.auth?.webRedirectBase as string | undefined;
                  const returnUrl = customWeb
                    ? `${customWeb.replace(/\/$/, '')}/auth-callback`
                    : Linking.createURL('/auth-callback');
                  const { error: err } = await supabase.auth.resend({
                    type: 'signup',
                    email: e,
                    options: { emailRedirectTo: returnUrl },
                  } as any);
                  if (err) {
                    setError(err.message);
                    return;
                  }
                  setInfo('Confirmation email sent. Please check your inbox.');
                })();
              }}
            >
              <Text style={styles.btnText}>Resend confirmation email</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  form: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  header: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 12 },
  text: { color: '#e5e7eb', marginBottom: 8 },
  input: { backgroundColor: '#111827', color: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginBottom: 12 },
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
  btnSecondary: { backgroundColor: '#334155' },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  lineHeight: 22,
    textAlignVertical: 'center' as any,
    includeFontPadding: false as any,
  },
  error: { color: '#f87171', marginBottom: 8 },
  info: { color: '#93c5fd', marginBottom: 8 },
});
