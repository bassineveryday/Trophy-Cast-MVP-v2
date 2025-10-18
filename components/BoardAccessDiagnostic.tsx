/**
 * DIAGNOSTIC: Board Access Debug Screen
 * 
 * Run this to check:
 * 1. Current authenticated user UUID
 * 2. What the board access hook returns
 * 3. Database data for board members
 * 4. RLS policy access
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { useBoardAccess } from '../hooks/useBoardAccess';

const COLORS = {
  navy: '#0B1A2F',
  navyDark: '#0F2238',
  gold: '#C9A646',
  textLight: '#E7ECF2',
  textGray: '#9AA4B2',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

export function BoardAccessDiagnostic() {
  const { isBoard, role, loading: hookLoading, error: hookError } = useBoardAccess();
  const [userUuid, setUserUuid] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<any>(null);
  const [allBoardMembers, setAllBoardMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const diagnose = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Get current user
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();

        if (userErr) throw userErr;

        if (!user) {
          setError('No authenticated user found');
          setLoading(false);
          return;
        }

        setUserUuid(user.id);
        setUserEmail(user.email || null);

        // 2. Query board member data for this user
        const { data: boardMemberData, error: boardErr } = await supabase
          .from('dbm_board_members')
          .select('*')
          .eq('profile_id', user.id)
          .maybeSingle();

        if (boardErr && boardErr.code !== 'PGRST116') {
          throw boardErr;
        }

        setBoardData(boardMemberData);

        // 3. Query all board members (to see if data exists at all)
        const { data: allMembers, error: allErr } = await supabase
          .from('dbm_board_members')
          .select('*');

        if (!allErr) {
          setAllBoardMembers(allMembers || []);
        }
      } catch (e: any) {
        setError(e.message || 'Diagnostic failed');
      } finally {
        setLoading(false);
      }
    };

    diagnose();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.navy,
      padding: 16,
    },
    section: {
      marginBottom: 20,
      padding: 12,
      backgroundColor: COLORS.navyDark,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: COLORS.gold,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.gold,
      marginBottom: 10,
    },
    row: {
      marginBottom: 8,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.gold + '30',
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.textGray,
      marginBottom: 4,
    },
    value: {
      fontSize: 14,
      fontWeight: '500',
      color: COLORS.textLight,
      fontFamily: 'monospace',
    },
    status: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    statusTrue: {
      backgroundColor: COLORS.success + '30',
    },
    statusFalse: {
      backgroundColor: COLORS.error + '30',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    statusTextTrue: {
      color: COLORS.success,
    },
    statusTextFalse: {
      color: COLORS.error,
    },
    code: {
      backgroundColor: COLORS.navy,
      padding: 8,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: COLORS.gold,
      marginTop: 4,
    },
    codeText: {
      fontSize: 11,
      color: COLORS.gold,
      fontFamily: 'monospace',
    },
  });

  if (loading || hookLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 Board Access Diagnostic</Text>
        <Text style={styles.label}>Use this to debug why board access isn't working</Text>
      </View>

      {/* CURRENT USER */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Current User</Text>

        <View style={styles.row}>
          <Text style={styles.label}>UUID (profile_id)</Text>
          <Text style={styles.value}>{userUuid || 'N/A'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userEmail || 'N/A'}</Text>
        </View>
      </View>

      {/* HOOK RESULTS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎣 useBoardAccess Hook</Text>

        <View style={styles.row}>
          <Text style={styles.label}>isBoard</Text>
          <View
            style={[
              styles.status,
              isBoard ? styles.statusTrue : styles.statusFalse,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isBoard ? styles.statusTextTrue : styles.statusTextFalse,
              ]}
            >
              {isBoard ? '✓ TRUE' : '✗ FALSE'}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>role</Text>
          <Text style={styles.value}>{role || 'null'}</Text>
        </View>

        {hookError && (
          <View style={styles.row}>
            <Text style={styles.label}>Error</Text>
            <Text style={[styles.value, { color: COLORS.error }]}>{hookError}</Text>
          </View>
        )}
      </View>

      {/* BOARD DATA FOR THIS USER */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Board Member Data (This User)</Text>

        {boardData ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>member_id</Text>
              <Text style={styles.value}>{boardData.member_id}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>role</Text>
              <Text style={styles.value}>{boardData.role}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>created_at</Text>
              <Text style={styles.value}>{boardData.created_at}</Text>
            </View>
            <View style={styles.code}>
              <Text style={styles.codeText}>{JSON.stringify(boardData, null, 2)}</Text>
            </View>
          </>
        ) : (
          <Text style={[styles.value, { color: COLORS.warning }]}>
            ⚠ No board member record found for this user UUID
          </Text>
        )}
      </View>

      {/* ALL BOARD MEMBERS IN DATABASE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 All Board Members in DB</Text>

        {allBoardMembers.length > 0 ? (
          <>
            <Text style={styles.label}>Found {allBoardMembers.length} board member(s)</Text>
            {allBoardMembers.map((member, idx) => (
              <View key={idx} style={styles.code}>
                <Text style={styles.codeText}>
                  {member.member_id} ({member.role})
                </Text>
                <Text style={[styles.codeText, { opacity: 0.7 }]}>
                  UUID: {member.profile_id}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={[styles.value, { color: COLORS.error }]}>
            ✗ No board members found in database
          </Text>
        )}
      </View>

      {/* TROUBLESHOOTING */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Troubleshooting</Text>

        <Text style={styles.label}>If isBoard = FALSE:</Text>
        <Text style={[styles.value, { marginBottom: 12 }]}>
          1. Check if your current UUID matches any entry in the "All Board Members" list
        </Text>
        <Text style={[styles.value, { marginBottom: 12 }]}>
          2. If UUID doesn't match, you need to:{"\n"}
          a) Get the UUID from Supabase Auth{"\n"}
          b) Run INSERT query in Supabase SQL editor
        </Text>
        <Text style={[styles.value, { marginBottom: 12 }]}>
          3. Verify RLS policy allows SELECT in Supabase SQL editor
        </Text>

        <Text style={styles.label}>If you see this UUID in the DB:</Text>
        <Text style={[styles.value, { marginBottom: 12, color: COLORS.gold }]}>
          8338ec05-7839-45b5-9b3a-115d6d485603
        </Text>
        <Text style={styles.label}>Then Tai Hunt is properly registered!</Text>
      </View>

      {/* ERROR DISPLAY */}
      {error && (
        <View style={[styles.section, { borderLeftColor: COLORS.error }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.error }]}>❌ Error</Text>
          <Text style={[styles.value, { color: COLORS.error }]}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}
