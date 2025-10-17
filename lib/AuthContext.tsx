import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// User type will be inferred from supabase.auth
import { supabase } from '../lib/supabase';
import { setUser as setSentryUser } from './sentry';

interface AuthContextType {
  user: any | null; // Using any for now to avoid complex type imports
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  createProfile: (memberCode: string, name: string, hometown: string) => Promise<{ error: Error | null }>;
}

interface Profile {
  id: string;
  member_code: string;
  name: string;
  hometown: string;
  created_at: string;
  avatar_url?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for dev mode bypass in AsyncStorage or auto-enable if no Supabase env vars
    const checkDevMode = async () => {
      try {
        const devModeBypass = await AsyncStorage.getItem('devModeBypass');
        // Respect explicit env override
        const envOverride = (process.env.EXPO_PUBLIC_DEV_LOGIN || '').toLowerCase();
        if (envOverride === 'false') {
          // Force disable dev login, clear stored bypass
          await AsyncStorage.removeItem('devModeBypass');
        }
        // Auto-enable dev mode in development when no real Supabase backend is configured
        const shouldEnableDevMode = envOverride === 'true' || devModeBypass === 'true' ||
          (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
        
        if (shouldEnableDevMode) {
          const mockUser = {
            id: 'dev-mode-user-tai-hunt',
            email: 'tai.hunt@demo.com',
            created_at: new Date().toISOString(),
          };
          
          const mockProfile: Profile = {
            id: 'dev-mode-user-tai-hunt',
            member_code: 'DBM019',
            name: 'Tai Hunt',
            hometown: 'Denver, CO',
            created_at: new Date().toISOString(),
          };
          
          // Set dev mode flag for future use
          await AsyncStorage.setItem('devModeBypass', 'true');
          
          setUser(mockUser);
          setProfile(mockProfile);
          setLoading(false);
          
          console.log('🎣 Dev mode enabled - logged in as Tai Hunt (DBM019)');
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error checking dev mode:', error);
        return false;
      }
    };

    const initAuth = async () => {
      const isDevMode = await checkDevMode();
      if (isDevMode) return;

      // Check active sessions and subscribe to auth changes
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      });

      return () => subscription.unsubscribe();
    };

    initAuth();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error} = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
    
    // Set user context in Sentry for error tracking
    if (data) {
      setSentryUser({
        id: data.id,
        username: data.name || undefined,
        email: undefined, // Don't send email to Sentry for privacy
      });
    }
  };

  /**
   * Sign in a user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Object with error if sign-in failed
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Allow login even if email is not confirmed
      if (data.user && data.session) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
      
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Skip email confirmation
        }
      });
      
      // Automatically sign in after signup without email confirmation
      if (data.user && !error) {
        setUser(data.user);
      }
      
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    // Clear dev mode bypass
    if (typeof window !== 'undefined') {
      localStorage.removeItem('devModeBypass');
    }
    await supabase.auth.signOut();
  };

  /**
   * Create a user profile after authentication
   * Links the authenticated user to a club member
   * 
   * @param memberCode - Denver Bassmasters member code (e.g., "DBM019")
   * @param name - Member's full name
   * @param hometown - Member's hometown
   * @returns Object with error if profile creation failed
   */
  const createProfile = async (memberCode: string, name: string, hometown: string) => {
    if (!user) return { error: new Error('No user authenticated') };

    try {
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            member_code: memberCode,
            name,
            hometown,
          },
        ]);

      if (!error) {
        await fetchProfile(user.id);
      }

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    createProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};