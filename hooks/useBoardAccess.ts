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
      try {
        if (!user) {
          if (isMounted) {
            setIsBoard(false);
            setRole(null);
          }
          return;
        }

        // Check if user is a board member
        const { data, error } = await supabase
          .from('dbm_board_members')
          .select('profile_id, member_id, role, created_at')
          .eq('profile_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows found, which is fine
          throw error;
        }

        if (isMounted) {
          const isboardMember = !!data;
          setIsBoard(isboardMember);
          setRole(data?.role ?? null);
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e.message || 'Board access check failed');
          setIsBoard(false);
          setRole(null);
        }
      } finally {
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
