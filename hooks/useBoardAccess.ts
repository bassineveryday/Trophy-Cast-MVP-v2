/**
 * useBoardAccess.ts
 * 
 * Hook to check if current user is a DBM board member
 * Uses Supabase RLS for secure access control
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

interface BoardMember {
  profile_id: string;
  member_id: string;
  role: string;
  created_at: string;
}

export function useBoardAccess() {
  const [loading, setLoading] = useState(true);
  const [isBoard, setIsBoard] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();  // Get user from AuthContext!

  useEffect(() => {
    let isMounted = true;

    const checkBoardAccess = async () => {
      setLoading(true);
      setError(null);
      console.log('🔹 [useBoardAccess] Starting board access check...');
      try {
        // Use user from AuthContext instead of calling getUser()
        console.log('🔹 [useBoardAccess] Got user from AuthContext:', user?.email, 'id:', user?.id);

        if (!user) {
          console.log('🔹 [useBoardAccess] No user found, setting isBoard to false');
          if (isMounted) {
            setIsBoard(false);
            setRole(null);
          }
          return;
        }

        console.log('🔹 [useBoardAccess] Querying dbm_board_members for profile_id:', user.id);

        // Check if user is a board member
        const { data, error, status, statusText } = await supabase
          .from('dbm_board_members')
          .select('profile_id, member_id, role, created_at')
          .eq('profile_id', user.id)
          .maybeSingle();

        console.log('🔹 [useBoardAccess] Query result:', { data, error, status, statusText });
        console.log('🔹 [useBoardAccess] Raw response:', { 
          dataType: typeof data, 
          dataValue: JSON.stringify(data),
          errorType: typeof error,
          errorValue: JSON.stringify(error),
          hasData: data !== null && data !== undefined,
        });

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows found, which is fine
          console.log('🔹 [useBoardAccess] Query error (throwing):', error);
          throw error;
        }

        if (isMounted) {
          const isboardMember = !!data;
          setIsBoard(isboardMember);
          setRole(data?.role ?? null);
          console.log('✅ Board access check COMPLETE:', { 
            isBoard: isboardMember, 
            role: data?.role ?? null, 
            userId: user.id,
            email: user.email,
            foundData: !!data,
          });
        }
      } catch (e: any) {
        console.log('� [useBoardAccess] CAUGHT ERROR:', e);
        if (isMounted) {
          setError(e.message || 'Board access check failed');
          setIsBoard(false);
          setRole(null);
        }
      } finally {
        console.log('🔹 [useBoardAccess] Setting loading to false');
        if (isMounted) setLoading(false);
      }
    };

    checkBoardAccess();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { loading, isBoard, role, error };
}
