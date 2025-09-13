declare module 'expo-router' {
  export const Link: any;
  export const Stack: any;
  export const Tabs: any;
  export const Redirect: any;
  export const router: any;
  export function useRouter(): any;
  export function useLocalSearchParams<T extends Record<string, string>>(): T;
}

declare module 'expo-av' {
  export const Video: any;
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: any;
  export default AsyncStorage;
}

declare module '@supabase/supabase-js' {
  export function createClient(url: string, anon: string, opts?: any): any;
}
