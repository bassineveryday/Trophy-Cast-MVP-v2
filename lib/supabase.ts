import 'react-native-url-polyfill/auto';
// Use require for better compatibility with current setup
const { createClient } = require('@supabase/supabase-js');
import { Platform } from 'react-native';

// Load Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

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

// Minimal mock client implementing the subset used by the app.
const makeMockClient = () => {
  const createChain = () => ({
    select: function(fields?: string) { return this; },
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    eq: function(column: string, value: any) { return this; },
    neq: function(column: string, value: any) { return this; },
    gt: function(column: string, value: any) { return this; },
    gte: function(column: string, value: any) { return this; },
    lt: function(column: string, value: any) { return this; },
    lte: function(column: string, value: any) { return this; },
    like: function(column: string, pattern: string) { return this; },
    ilike: function(column: string, pattern: string) { return this; },
    is: function(column: string, value: any) { return this; },
    in: function(column: string, values: any[]) { return this; },
    contains: function(column: string, value: any) { return this; },
    containedBy: function(column: string, value: any) { return this; },
    rangeGt: function(column: string, value: any) { return this; },
    rangeGte: function(column: string, value: any) { return this; },
    rangeLt: function(column: string, value: any) { return this; },
    rangeLte: function(column: string, value: any) { return this; },
    rangeAdjacent: function(column: string, value: any) { return this; },
    overlaps: function(column: string, value: any) { return this; },
    textSearch: function(column: string, query: string, options?: any) { return this; },
    match: function(query: object) { return this; },
    not: function(column: string, operator: string, value: any) { return this; },
    or: function(filters: string) { return this; },
    filter: function(column: string, operator: string, value: any) { return this; },
    order: function(column: string, options?: any) { return this; },
    limit: function(count: number) { return this; },
    range: function(from: number, to: number) { return this; },
    abortSignal: function(signal: AbortSignal) { return this; },
    then: function(onFulfilled?: any, onRejected?: any) {
      // Make it thenable so it can be awaited
      return Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected);
    }
  });

  const chain = createChain();

  // Minimal in-memory auth state to mirror the supabase client shape
  let currentSession: any = null;

  const auth = {
    // Matches the modern @supabase/supabase-js method used in AuthProvider
    getSession: async () => ({ data: { session: currentSession }, error: null }),

    // onAuthStateChange should return the same shape as the real client
    // and call the callback immediately with the current session so
    // consumers receive an initial state.
    onAuthStateChange: (callback: (event: any, session: any) => void) => {
      // Invoke callback immediately with current session
      try {
        callback(currentSession ? 'SIGNED_IN' : 'SIGNED_OUT', currentSession);
      } catch (e) {
        // swallow in mock
      }

      const subscription = {
        unsubscribe: () => {
          /* noop for mock */
        },
      };

      return { data: { subscription } };
    },

    // Common sign-in / sign-up helpers used by the app (async shape)
    signInWithPassword: async ({ email, password }: any) => {
      // Create a lightweight mock session/user so AuthProvider can proceed
      const mockUser = {
        id: `mock-${email || 'user'}`,
        email: email || 'dev@local',
        created_at: new Date().toISOString(),
      };

      currentSession = { user: mockUser, expires_at: Date.now() + 1000 * 60 * 60 };

      // Call listeners (no-op in this simple mock beyond onAuthStateChange immediate call)
      return { data: { user: mockUser, session: currentSession }, error: null };
    },

    signUp: async ({ email }: any) => {
      const mockUser = {
        id: `mock-${email || 'user'}`,
        email: email || 'dev@local',
        created_at: new Date().toISOString(),
      };

      currentSession = { user: mockUser, expires_at: Date.now() + 1000 * 60 * 60 };
      return { data: { user: mockUser, session: currentSession }, error: null };
    },

    signOut: async () => {
      currentSession = null;
      return { error: null };
    },

    // Older / auxiliary helpers sometimes used in tests or utilities
    getUser: async () => ({ data: { user: currentSession?.user ?? null }, error: null }),
  };

  return {
    from: (table: string) => createChain(),
    auth,
  } as any;
};

// Decide at runtime which client to use, but export a single top-level symbol
let supabaseClient: any;
if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: createStorageAdapter(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      // Skip email verification for development
      flowType: 'pkce',
    },
  });
} else {
  // eslint-disable-next-line no-console
  console.warn(
    'Warning: Supabase environment variables are missing. Using a lightweight mock Supabase client for local development. Create a .env.local with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable real backend.'
  );

  supabaseClient = makeMockClient();
}

// Export a top-level supabase constant for the app to use
export const supabase = supabaseClient;
export default supabase;

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
      .from('events_public')
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