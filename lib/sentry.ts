import * as Sentry from '@sentry/react-native';

/**
 * Initialize Sentry for error tracking and performance monitoring
 * 
 * To use Sentry in production:
 * 1. Sign up at https://sentry.io
 * 2. Create a new React Native project
 * 3. Add your DSN to .env.local as SENTRY_DSN
 * 4. Deploy with environment variables configured
 * 
 * @example
 * // In your app entry point:
 * import './lib/sentry';
 */

const SENTRY_DSN = process.env.SENTRY_DSN || '';

// Only initialize Sentry in production or if DSN is provided
if (SENTRY_DSN && !__DEV__) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.2, // 20% of transactions
    
    // Enable automatic breadcrumbs
    integrations: [
      new Sentry.ReactNativeTracing({
        tracingOrigins: ['localhost', /^\//],
        // ... other options
      }),
    ],
    
    // Environment configuration
    environment: __DEV__ ? 'development' : 'production',
    
    // Release tracking (optional - useful for tracking which version had errors)
    // release: 'trophy-cast@' + process.env.APP_VERSION,
    
    // Before sending events, you can filter or modify them
    beforeSend(event: any, hint: any) {
      // Don't send events in development
      if (__DEV__) {
        console.log('Sentry Event (Dev Mode - not sent):', event);
        return null;
      }
      
      // Filter out certain errors if needed
      // if (event.exception) {
      //   const error = hint.originalException;
      //   if (error && error.message && error.message.includes('Network request failed')) {
      //     return null; // Don't send network errors
      //   }
      // }
      
      return event;
    },
  });
  
  console.log('✅ Sentry initialized for error tracking');
} else {
  console.log('ℹ️ Sentry disabled (development mode or no DSN configured)');
}

/**
 * Helper function to manually capture errors
 * @param error - The error to capture
 * @param context - Additional context about the error
 */
export function captureError(error: Error, context?: Record<string, any>) {
  console.error('Error captured:', error, context);
  
  if (!__DEV__ && SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: context ? { custom: context } : undefined,
    });
  }
}

/**
 * Helper function to capture messages/warnings
 * @param message - The message to log
 * @param level - Severity level
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  console.log(`[${level}]`, message);
  
  if (!__DEV__ && SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
}

/**
 * Set user context for error tracking
 * @param user - User information
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  if (!__DEV__ && SENTRY_DSN) {
    Sentry.setUser(user);
  }
}

export default Sentry;
