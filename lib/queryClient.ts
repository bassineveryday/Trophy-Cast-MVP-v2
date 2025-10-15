import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

/**
 * React Query Client Configuration
 * 
 * Provides intelligent caching, background refetching, and
 * automatic retry logic for all data fetching operations.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 1000 * 60 * 5,
      
      // Keep unused data in cache for 10 minutes
      gcTime: 1000 * 60 * 10,
      
      // Retry failed requests up to 2 times
      retry: 2,
      
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      
      // Refetch when network reconnects
      refetchOnReconnect: true,
      
      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

// Persist React Query cache to device storage for basic offline support
// This improves startup performance and enables viewing last-known data offline.
try {
  const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'trophy-cast-query-cache-v1',
    throttleTime: 1000, // debounce writes
  });

  // Note: Type cast to any to avoid versioned type mismatch between
  // @tanstack/react-query and @tanstack/query-persist-client-core.
  persistQueryClient({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryClient: queryClient as any,
    persister,
    maxAge: 1000 * 60 * 60, // 1 hour
    dehydrateOptions: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shouldDehydrateQuery: (q: any) => q.state?.status === 'success',
    },
  } as any);
} catch (_e) {
  // Ignore persistence errors in non-RN environments (e.g., tests)
}
