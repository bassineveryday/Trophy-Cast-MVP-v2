import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Your actual Supabase credentials
const supabaseUrl = 'https://pxmffkaiwpvnpfrhfeco.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4bWZma2Fpd3B2bnBmcmhmZWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NDc3MzEsImV4cCI6MjA3NTQyMzczMX0.tzynuCSnR1_2ZdJaqa7cWZrkrgwMvBeFZvS7Vmhg22M'

// Create a cross-platform storage adapter
const createStorageAdapter = () => {
  if (Platform.OS === 'web') {
    // Use localStorage for web
    return {
      getItem: (key: string) => {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
      },
      removeItem: (key: string) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
      },
    };
  } else {
    // Use AsyncStorage for mobile (you'd import AsyncStorage for production)
    // For now, using a simple in-memory storage for mobile
    const storage: { [key: string]: string } = {};
    return {
      getItem: (key: string) => {
        return storage[key] || null;
      },
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    };
  }
};

// Create Supabase client with cross-platform storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// TypeScript types for authentication
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  created_at: string;
}

export interface AuthError {
  message: string;
}