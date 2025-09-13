import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Platform } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong!</Text>
          <Text style={styles.subtitle}>Check the console for details.</Text>
          <ScrollView style={styles.errorBox}>
            <Text style={styles.errorText}>
              {this.state.error?.toString()}
            </Text>
            {this.state.errorInfo && (
              <Text style={styles.errorText}>
                {JSON.stringify(this.state.errorInfo, null, 2)}
              </Text>
            )}
          </ScrollView>
          <Pressable
            style={styles.retryBtn}
            onPress={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#94a3b8', marginTop: 8, textAlign: 'center' },
  errorBox: { backgroundColor: '#111827', borderRadius: 8, padding: 12, marginTop: 16, maxHeight: 300 },
  errorText: { color: '#fca5a5', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 8, padding: 12, marginTop: 16, alignItems: 'center' },
  retryText: { color: '#fff', fontWeight: '700' },
});
