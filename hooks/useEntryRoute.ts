/**
 * useEntryRoute.ts - Smart entry point logic after auth
 *
 * Flow:
 * 1. First login ever → Dashboard + OnboardingSheet
 * 2. Profile incomplete → Dashboard + OnboardingSheet
 * 3. Deep link / push intent → open that route
 * 4. Otherwise → Dashboard (Home)
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EntryRouteState {
  route: string;
  params?: Record<string, any>;
  showOnboarding: boolean;
}

const FIRST_LOGIN_KEY = 'first_login_completed';
const PENDING_REDIRECT_KEY = 'pending_redirect_route';

export function useEntryRoute(): EntryRouteState {
  const { user, profile } = useAuth();
  const [entryState, setEntryState] = useState<EntryRouteState>({
    route: 'Home',
    showOnboarding: false,
  });

  useEffect(() => {
    if (!user) {
      // Not logged in, don't set entry route yet
      return;
    }

    const determineEntry = async () => {
      try {
        // Check if first login
        const firstLoginCompleted = await AsyncStorage.getItem(FIRST_LOGIN_KEY);
        const isFirstLogin = !firstLoginCompleted;

        // Check if profile is complete (name and hometown required)
        const profileComplete =
          profile?.name &&
          profile?.name.trim().length > 0 &&
          profile?.hometown &&
          profile?.hometown.trim().length > 0;

        // Check for pending redirect (e.g., deep link before auth)
        const pendingRedirect = await AsyncStorage.getItem(PENDING_REDIRECT_KEY);
        await AsyncStorage.removeItem(PENDING_REDIRECT_KEY);

        // Determine entry route
        if (isFirstLogin || !profileComplete) {
          // First login or incomplete profile → show onboarding
          setEntryState({
            route: 'Home', // Dashboard
            showOnboarding: true,
          });
          // Mark first login as done (even if they don't complete onboarding, they've seen it)
          if (isFirstLogin) {
            await AsyncStorage.setItem(FIRST_LOGIN_KEY, 'true');
          }
        } else if (pendingRedirect) {
          // Deep link or push intent → go there
          try {
            const redirect = JSON.parse(pendingRedirect);
            setEntryState({
              route: redirect.route || 'Home',
              params: redirect.params,
              showOnboarding: false,
            });
          } catch {
            // Fallback if redirect parse fails
            setEntryState({
              route: 'Home',
              showOnboarding: false,
            });
          }
        } else {
          // Normal flow → Dashboard
          setEntryState({
            route: 'Home',
            showOnboarding: false,
          });
        }
      } catch (error) {
        console.error('Error determining entry route:', error);
        setEntryState({
          route: 'Home',
          showOnboarding: false,
        });
      }
    };

    determineEntry();
  }, [user, profile]);

  return entryState;
}

/**
 * Store a pending redirect route to navigate to after auth
 * Useful for deep links or push notifications that arrive before auth
 */
export async function storePendingRedirect(
  route: string,
  params?: Record<string, any>
) {
  try {
    await AsyncStorage.setItem(
      PENDING_REDIRECT_KEY,
      JSON.stringify({ route, params })
    );
  } catch (error) {
    console.error('Error storing pending redirect:', error);
  }
}

/**
 * Mark first login as completed (called after onboarding sheet closes)
 */
export async function markFirstLoginComplete() {
  try {
    await AsyncStorage.setItem(FIRST_LOGIN_KEY, 'true');
  } catch (error) {
    console.error('Error marking first login complete:', error);
  }
}
