import 'react-native-url-polyfill/auto';
// Use require for better compatibility with current setup
const { createClient } = require('@supabase/supabase-js');
import { Platform } from 'react-native';

// Load Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // In CI/production we should fail hard if env vars are missing.
  // For local development, provide a minimal mock so the app can run
  // while allowing the developer to add `.env.local` with real values.
  // NOTE: If you deploy, ensure the real env vars are set and this
  // fallback will not be used.
  // eslint-disable-next-line no-console
  console.warn(
    'Warning: Supabase environment variables are missing. Using a lightweight mock Supabase client for local development. Create a .env.local with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable real backend.'
  );

  // Minimal mock client implementing the subset used by the app.
  const mock = {
    from: () => ({
      select: async () => ({ data: [], error: null }),
      single: async () => ({ data: null, error: null }),
      eq: function () { return this; },
      order: function () { return this; },
    }),
    auth: {
      signIn: async () => ({ user: null, error: null }),
      signUp: async () => ({ user: null, error: null }),
      signOut: async () => ({ error: null }),
    },
  } as any;

  // Export the mock so rest of the app can import `supabase` as usual.
  // @ts-ignore
  export const supabase: any = mock;

  // Skip real client creation below
  // eslint-disable-next-line no-undef
} 


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
    // Skip email verification for development
    flowType: 'pkce',
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

// AOY Standings interface
export interface AOYStandingsRow {
  member_id: string;
  season_year: number | null;
  aoy_rank: number | null;
  member_name: string | null;
  boater_status: string | null;
  total_aoy_points: number | null;
}

/**
 * Fetch all AOY (Angler of the Year) standings ordered by rank
 * 
 * Returns the current season's AOY standings with member information,
 * total points, and rankings. Results are sorted by rank (best to worst).
 * 
 * @returns {Promise} Object containing data array or error
 * @example
 * const { data, error } = await fetchAOYStandings();
 * if (data) {
 *   console.log('Top angler:', data[0].member_name);
 * }
 */
export const fetchAOYStandings = async () => {
  try {
    const { data, error } = await supabase
      .from('aoy_standings')
      .select('*')
      .order('aoy_rank', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Error fetching AOY standings:', error);
      throw error;
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error fetching AOY standings:', err);
    return { data: [], error: err };
  }
};

export const fetchAOYStandingsByMember = async (memberId: string) => {
  try {
    const { data, error } = await supabase
      .from('aoy_standings')
      .select('*')
      .eq('member_id', memberId)
      .single();

    if (error) {
      console.error('Error fetching member AOY standing:', error);
      throw error;
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error fetching member AOY standing:', err);
    return { data: null, error: err };
  }
};

// Tournament Events interface
export interface TournamentEvent {
  event_id: string;
  tournament_code: string | null;
  tournament_name: string | null;
  event_date: string | null;
  lake: string | null;
  participants: number | null;
}

/**
 * Fetch all tournament events ordered by date (most recent first)
 * 
 * Returns tournament schedule including event name, date, lake location,
 * and participant count. Used to display upcoming and past tournaments.
 * 
 * @returns {Promise} Object containing tournament events array or error
 * @example
 * const { data, error } = await fetchTournamentEvents();
 * if (data) {
 *   const nextTournament = data.find(t => new Date(t.event_date) > new Date());
 * }
 */
export const fetchTournamentEvents = async () => {
  try {
    console.log('🔵 Fetching tournament events...');
    
    const { data, error } = await supabase
      .from('tournament_events')
      .select('*')
      .order('event_date', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching tournament events:', error);
      throw error;
    }

    console.log('✅ Tournament events fetched:', data?.length || 0, 'records');
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error fetching tournament events:', err);
    return { data: [], error: err };
  }
};

export const fetchTournamentEventById = async (eventId: string) => {
  try {
    const { data, error } = await supabase
      .from('tournament_events')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (error) {
      console.error('Error fetching tournament event:', error);
      throw error;
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error fetching tournament event:', err);
    return { data: null, error: err };
  }
};