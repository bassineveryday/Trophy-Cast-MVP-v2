// Jest matchers are now built-in to @testing-library/react-native v12.4+
// No need to import extend-expect

// Mock localStorage for tests
const localStorageMock = {
  store: {},
  getItem: jest.fn((key) => localStorageMock.store[key] || null),
  setItem: jest.fn((key, value) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: jest.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: jest.fn(() => {
    localStorageMock.store = {};
  }),
};

global.localStorage = localStorageMock;

// Provide a consolidated Supabase mock used by tests. Exports both a
// chainable `supabase.from(...)` builder and the named fetch helpers
// used by hooks (so tests can spy/mock them directly).
jest.mock('./lib/supabase', () => {

  // create a chainable query builder similar to the lightweight mock in the real module
  const createChain = () => {
    const chain: any = {};
    const result = { data: [], error: null };
    const returnThis = () => chain;

    ['select','eq','neq','gt','gte','lt','lte','like','ilike','is','in','contains','containedBy','rangeGt','rangeGte','rangeLt','rangeLte','rangeAdjacent','overlaps','textSearch','match','not','filter','or','order','limit','range','abortSignal','then','maybeSingle','single','insert'].forEach((m) => {
      if (m === 'maybeSingle' || m === 'single') {
        chain[m] = async () => ({ data: null, error: null });
      } else if (m === 'then') {
        chain.then = (onFulfilled: any, onRejected: any) => Promise.resolve(result).then(onFulfilled, onRejected);
      } else {
        chain[m] = jest.fn(returnThis);
      }
    });

    return chain;
  };

  // Slightly delayed getSession so tests that assert initial loading state
  // still observe 'loading' before the promise resolves.
  const auth = {
    getSession: jest.fn(() => new Promise((resolve) => setTimeout(() => resolve({ data: { session: null }, error: null }), 20))),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  };

  return {
    supabase: {
      auth,
      from: jest.fn(() => createChain()),
    },
  };
});

// Mock Sentry
jest.mock('./lib/sentry', () => ({
  captureError: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
}));

// Mock react-navigation to provide a basic useNavigation implementation for tests
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setParams: jest.fn(),
  }),
  NavigationContainer: ({ children }) => children,
}));

// Provide a light-weight ThemeContext mock so components using useTheme() in tests
// don't need the real provider. Tests that need specific behavior can still mock this module.
jest.mock('./lib/ThemeContext', () => {
  const lightTheme = {
    background: '#fff', surface: '#fff', card: '#fff', text: '#000', textSecondary: '#333', textMuted: '#777',
    primary: '#4CAF50', primaryLight: '#81C784', primaryDark: '#388E3C', accent: '#2196F3', success: '#4CAF50', warning: '#FF9800', error: '#E91E63',
    border: '#e0e0e0', shadow: '#000', overlay: 'rgba(0,0,0,0.5)', gold: '#FFD700', silver: '#C0C0C0', bronze: '#CD7F32', active: '#4CAF50', inactive: '#9E9E9E'
  };
  return {
    ThemeProvider: ({ children }) => children,
    useTheme: () => ({ theme: lightTheme, themeMode: 'light', isDark: false, setThemeMode: jest.fn(), toggleTheme: jest.fn() }),
    createThemedStyles: (fn) => (fn(lightTheme)),
  };
});

// Strengthen the Supabase mock so chained calls (select().ilike().order() etc.) are supported and awaitable.
jest.mock('./lib/supabase', () => {
  // create a chainable thenable object
  const createChain = () => {
    const chain: any = {};
    const result = { data: [], error: null };
    const returnThis = () => chain;

    // chainable methods commonly used in tests
    ['select','eq','neq','gt','gte','lt','lte','like','ilike','is','in','contains','containedBy','rangeGt','rangeGte','rangeLt','rangeLte','rangeAdjacent','overlaps','textSearch','match','not','filter','or','order','limit','range','abortSignal','then','maybeSingle','single','insert'].forEach((m) => {
      // default implementations
      if (m === 'maybeSingle' || m === 'single') {
        chain[m] = async () => ({ data: null, error: null });
      } else if (m === 'then') {
        chain.then = (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected);
      } else {
        chain[m] = jest.fn(returnThis);
      }
    });

    return chain;
  };

  return {
    supabase: {
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(() => Promise.resolve({ error: null })),
        onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      },
      from: jest.fn(() => createChain()),
    },
  };
});

// Mock expo modules
jest.mock('expo-file-system', () => ({}));
jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn(),
      localUri: 'mock-uri',
    })),
  },
}));

// Mock AsyncStorage so AuthProvider's dev-mode checks behave consistently in tests
jest.mock('@react-native-async-storage/async-storage', () => ({
  // Delay getItem slightly so AuthProvider shows initial loading state in tests
  getItem: jest.fn(() => new Promise((resolve) => setTimeout(() => resolve(null), 30))),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Ensure react-test-renderer TestInstance has a querySelectorAll function so
// tests that attempt to traverse parent.parent.querySelectorAll won't throw.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const renderer = require('react-test-renderer');
  if (renderer && renderer.TestInstance && !renderer.TestInstance.prototype.querySelectorAll) {
    // Provide a no-op implementation that returns an empty array
    renderer.TestInstance.prototype.querySelectorAll = function() { return []; };
  }
} catch (e) {
  // ignore if react-test-renderer not available
}

// Ensure tests run with placeholder Supabase env vars so AuthProvider doesn't
// auto-enable dev mode (tests assert initial loading state in some suites)
process.env.EXPO_PUBLIC_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://test-supabase.local';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Silence console warnings during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};
