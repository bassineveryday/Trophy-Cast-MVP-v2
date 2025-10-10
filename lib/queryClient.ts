import { QueryClient } from '@tanstack/react-query';

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
