/**
 * DBM Members Screen
 * 
 * Displays all Denver Bassmasters members from Supabase
 * Features:
 * - Full member list with search/filter
 * - Member count
 * - Navigate to individual member profiles
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TextInput,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useBoardAccess } from '../hooks/useBoardAccess';

// Colors matching Trophy Cast theme
const COLORS = {
  navy: '#0B1A2F',
  navyDark: '#0F2238',
  navyBorder: '#1A2A3F',
  gold: '#C9A646',
  textLight: '#E7ECF2',
  textGray: '#9AA4B2',
  error: '#FF6B6B',
  success: '#4CAF50',
};

interface DBMMember {
  member_id: string;
  member_name: string;
}

// Board roles mapping
const BOARD_ROLES: Record<string, string> = {
  'DBM020': 'DBM President',
  'DBM021': 'DBM Vice President',
  'DBM019': 'DBM Secretary',
  'DBM063': 'DBM Treasurer',
  'DBM004': 'DBM Tournament Director',
  'DBM045': 'DBM Conservation Director',
  'DBM002': 'DBM Juniors Director',
  'DBM014': 'DBM High School Director',
};

export function DBMMembersScreen() {
  const navigation = useNavigation();
  const [members, setMembers] = useState<DBMMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<DBMMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  // Filter members when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = members.filter(
        (member) =>
          member.member_name.toLowerCase().includes(query) ||
          member.member_id.toLowerCase().includes(query)
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, members]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tournament_members')
        .select('member_id, member_name')
        .order('member_name', { ascending: true });

      if (fetchError) throw fetchError;

      if (data) {
        setMembers(data as DBMMember[]);
        setFilteredMembers(data as DBMMember[]);
      }
    } catch (err: any) {
      console.error('Error fetching members:', err);
      setError(err.message || 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMemberItem = ({ item }: { item: DBMMember }) => (
    <Pressable
      style={styles.memberCard}
      onPress={() => {
        // Navigate to member profile if implemented
        (navigation as any).navigate('MemberProfile', {
          member_id: item.member_id,
          member_name: item.member_name,
        });
      }}
    >
      {/* Member Avatar/Initials */}
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {item.member_name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()}
        </Text>
      </View>

      {/* Member Info */}
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.member_name}</Text>
        {BOARD_ROLES[item.member_id] ? (
          <Text style={styles.memberRole}>{BOARD_ROLES[item.member_id]}</Text>
        ) : null}
      </View>

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={24} color={COLORS.gold} />
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Loading members...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Failed to load members</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchMembers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members..."
            placeholderTextColor={COLORS.textGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textGray} />
            </Pressable>
          )}
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.memberCount}>
            {filteredMembers.length} of {members.length} members
          </Text>
        </View>
      </View>

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color={COLORS.textGray} />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No members found' : 'No members available'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMembers}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item.member_id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.navy,
    },
    header: {
      backgroundColor: COLORS.navyDark,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.navyBorder,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.navy,
      borderWidth: 1,
      borderColor: COLORS.gold,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 12,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      color: COLORS.textLight,
      fontSize: 14,
    },
    memberCount: {
      color: COLORS.textGray,
      fontSize: 12,
      fontWeight: '600',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      minHeight: 44,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    memberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.navyDark,
      borderWidth: 1,
      borderColor: COLORS.navyBorder,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      gap: 12,
    },
    avatarCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: COLORS.gold,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.navy,
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.textLight,
      marginBottom: 2,
    },
    memberRole: {
      fontSize: 12,
      color: COLORS.gold,
      fontWeight: '600',
      marginBottom: 2,
    },
    memberId: {
      fontSize: 12,
      color: COLORS.gold,
      fontWeight: '600',
      marginBottom: 2,
    },
    memberEmail: {
      fontSize: 11,
      color: COLORS.textGray,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: COLORS.textLight,
      marginTop: 12,
      fontSize: 14,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    errorText: {
      color: COLORS.error,
      fontSize: 16,
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 6,
    },
    errorDetail: {
      color: COLORS.textGray,
      fontSize: 12,
      marginBottom: 20,
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: COLORS.gold,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: COLORS.navy,
      fontWeight: '700',
      fontSize: 14,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    emptyText: {
      color: COLORS.textGray,
      fontSize: 14,
      marginTop: 12,
    },
  });
}

const styles = createStyles();
