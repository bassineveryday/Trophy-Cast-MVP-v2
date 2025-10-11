/// <reference types="react-native" />

declare const __DEV__: boolean;

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    SENTRY_DSN?: string;
    APP_VERSION?: string;
  }
}

declare module '@expo/vector-icons' {
  export * from '@expo/vector-icons/build/createIconSet';
  export { default as Ionicons } from '@expo/vector-icons/build/Ionicons';
}