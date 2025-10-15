/* eslint-disable react-native/no-unused-styles, react-native/no-color-literals, react-native/sort-styles, @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Share,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTournaments, useTournamentResults, useTournamentParticipants } from '../lib/hooks/useQueries';
import { supabase } from '../lib/supabase';
import { showSuccess, showError } from '../utils/toast';
import { useMultiDayTournamentResults } from '../lib/hooks/useQueries';
import { useTheme } from '../lib/ThemeContext';
import EmptyState from '../components/EmptyState';
import TopBar from '../components/TopBar';
import { fishingTheme, spacing } from '../lib/designTokens';
import type { BrandTheme } from '../lib/ThemeContext';

interface TournamentDetailScreenProps {
  route: {
    params: {
      tournamentId: string;
    };
  };
}

interface Participant {
  id: string;
  member_name: string;
  registration_date: string;
  status: 'confirmed' | 'pending' | 'waitlist';
}

const TournamentDetailScreen: React.FC<TournamentDetailScreenProps> = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { tournamentId } = route.params as { tournamentId: string };
  
  const { data: tournaments, refetch: refetchTournaments } = useTournaments();
  // const { data: standings } = useAOYStandings();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'results'>('overview');
  const [selectedResultTab, setSelectedResultTab] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  // removed unused loading state
  // const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  const tournament = tournaments?.find(t => t.event_id === tournamentId);

  // Prefer the normalized tournament code when available (matches tournament_results.tournament_code)
  const resolvedCode = tournament?.tournament_code || tournamentId;

  // Dev-only logs are gated behind __DEV__ to avoid noisy production console output
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[TournamentDetail] Supabase client present:', !!supabase);
    // eslint-disable-next-line no-console
    console.log('[TournamentDetail] resolvedCode ->', resolvedCode, { tournamentId, tournamentCode: tournament?.tournament_code });
  }

  // Fetch results for this tournament (use resolvedCode which may be tournament_code or event_id)
  const { data: resultsData, isLoading: resultsLoading, error: resultsError, refetch: refetchResults } = useTournamentResults(resolvedCode);
  // Fetch registered participants live
  const { data: liveParticipants, isLoading: participantsLoading, error: participantsError, refetch: refetchParticipants } = useTournamentParticipants(resolvedCode);

  // Multi-day aggregation hook (call at top-level to obey Hooks rules)
  const tournamentCode = tournament?.tournament_code || tournamentId;
  const { data: multiDay = { dayEvents: [], dayResults: {}, combined: [] }, isLoading: multiLoading } = useMultiDayTournamentResults(tournamentCode);

  // Debug logs to help diagnose missing data
  useEffect(() => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[TournamentDetail] tournamentId=', tournamentId);
    }
  }, [tournamentId]);

  useEffect(() => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[TournamentDetail] resultsData -> length=', (resultsData || []).length, resultsData);
      // eslint-disable-next-line no-console
      console.log('[TournamentDetail] resultsError ->', resultsError);
    }
  }, [resultsData, resultsError]);

  useEffect(() => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[TournamentDetail] liveParticipants -> length=', (liveParticipants || []).length, liveParticipants);
      // eslint-disable-next-line no-console
      console.log('[TournamentDetail] participantsError ->', participantsError);
    }
  }, [liveParticipants, participantsError]);
  
  useEffect(() => {
    if (tournament) {
      loadTournamentData();
    }
  }, [tournament]);

  // Default selected result tab when multi-day data becomes available
  useEffect(() => {
    if (!multiDay) return;
    const dayEvents = multiDay.dayEvents || [];
    const isMultiDay = dayEvents.length > 1;
    
    // For multi-day tournaments, default to first day
    // For single-day tournaments, default to "Final" (only tab available)
    if (isMultiDay && dayEvents.length > 0) {
      setSelectedResultTab(dayEvents[0].tournament_code || dayEvents[0].event_id || 'combined');
    } else {
      setSelectedResultTab('combined');
    }
  }, [multiDay]);

  // Debug: log multi-day data when it changes so we can verify Day1/Day2/Final
  // Keep a minimal dev-only summary log for multi-day changes
  useEffect(() => {
    if (!__DEV__) return;
    // eslint-disable-next-line no-console
    console.log('[TournamentDetail] multiDay summary ->', {
      dayCount: (multiDay?.dayEvents || []).length,
      combinedCount: (multiDay?.combined || []).length,
    });
  }, [multiDay]);

  // Force refetch of results/participants when the resolvedCode changes
  useEffect(() => {
    if (!resolvedCode) return;
    refetchParticipants && refetchParticipants();
    if (typeof refetchResults === 'function') refetchResults();
  }, [refetchParticipants, refetchResults, resolvedCode]);

  useEffect(() => {
  if (Array.isArray(liveParticipants)) {
      // Map live rows into Participant shape used by the UI
      const mapped: Participant[] = (liveParticipants as any[]).map((p: { id: string; member_name?: string; member_id?: string; registration_date?: string; status?: Participant['status']; active?: boolean }) => ({
        id: p.id,
        member_name: p.member_name || p.member_id || 'Unknown',
        registration_date: p.registration_date || new Date().toISOString(),
        status: p.status || (p.active ? 'confirmed' : 'pending'),
      }));
      setParticipants(mapped);
    }
  }, [liveParticipants]);

  // Compute deduped participants from results rows (use tournament_results as the primary source)
  const uniqueResultParticipants = React.useMemo(() => {
    const rows = resultsData || [];
    const map = new Map<string, { member_id: string; member_name: string }>();
  rows.forEach((r: any) => {
      const id = r.member_id || r.member?.dbm_number || r.member?.member_code || r.member_code;
      if (!id) return;
      if (!map.has(id)) {
        map.set(id, {
          member_id: id,
          member_name: r.member_name || r.member?.member_name || r.member?.member_code || id,
        });
      }
    });
    return Array.from(map.values());
  }, [resultsData]);

  // Compute unique participant count (prefer deduped results rows if available)
  const participantCount = React.useMemo(() => {
    if (uniqueResultParticipants && uniqueResultParticipants.length > 0) return uniqueResultParticipants.length;
    return participants.length;
  }, [uniqueResultParticipants, participants]);

  // Debug: log query results/errors to browser console to diagnose missing data
  // Reduced debug logging (dev-only)
  useEffect(() => {
    if (!__DEV__) return;
    // eslint-disable-next-line no-console
    console.log('TournamentDetail debug summary:', { tournamentId, resultsLoading, participantsLoading });
  }, [tournamentId, resultsLoading, participantsLoading]);
  
  const loadTournamentData = async () => {
  // setLoading(true);
    try {
      // Keep this function for any future preload work.
      // Live participants are provided by useTournamentParticipants hook.
      
    } catch (error) {
      console.error('Error loading tournament data:', error);
      showError('Failed to load tournament details');
    } finally {
  // setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchTournaments(),
      // refetchParticipants will refresh live participant data
      refetchParticipants()
    ]);
    setRefreshing(false);
  };
  
  const handleRegistration = async () => {
    if (!tournament) return;
    
    Alert.alert(
      'Tournament Registration',
      `Are you sure you want to register for ${tournament.tournament_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Register', 
          onPress: async () => {
            try {
              setIsRegistered(true);
              showSuccess('Successfully registered for tournament!');
              loadTournamentData();
            } catch (error) {
              console.error('Registration error:', error);
              showError('Failed to register for tournament');
            }
          }
        }
      ]
    );
  };
  
  const handleShare = async () => {
    if (!tournament) return;
    
    try {
      await Share.share({
        message: `Check out this tournament: ${tournament.tournament_name} on ${tournament.event_date ? new Date(tournament.event_date).toLocaleDateString() : 'TBD'}`,
        title: `Trophy Cast - ${tournament.tournament_name}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };
  
  const openDirections = () => {
    if (tournament?.lake) {
      const url = `https://maps.google.com/?q=${encodeURIComponent(tournament.lake)}`;
      Linking.openURL(url);
    }
  };
  
  const getStatusColor = (date: string | null) => {
    if (!date) return '#757575';
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return '#2196F3'; // completed - blue
    } else if (diffDays <= 7) {
      return '#FF9800'; // upcoming - orange
    } else {
      return '#4CAF50'; // scheduled - green
    }
  };
  
  const getStatusText = (date: string | null) => {
    if (!date) return 'Pending';
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Completed';
    } else if (diffDays <= 7) {
      return diffDays === 0 ? 'Today' : `${diffDays} days away`;
    } else {
      return 'Scheduled';
    }
  };
  
  const renderTabButton = (tab: 'overview' | 'participants' | 'results', icon: keyof typeof Ionicons.glyphMap, label: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
  onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon}
        size={20}
        color={activeTab === tab ? fishingTheme.colors.white : fishingTheme.colors.cream}
      />
      <Text style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Tournament Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tournament?.event_date || null) }]}>
            <Ionicons
              name="calendar"
              size={16}
              color={fishingTheme.colors.white}
            />
            <Text style={styles.statusText}>
              {getStatusText(tournament?.event_date || null)}
            </Text>
          </View>
          
          <Text style={styles.tournamentTitle}>{tournament?.tournament_name}</Text>
          <Text style={styles.tournamentDate}>
            {tournament?.event_date ? new Date(tournament.event_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Date TBD'}
          </Text>
        </View>
      </View>
      
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color={fishingTheme.colors.lightTeal} />
          <Text style={styles.statNumber}>{participantCount}</Text>
          <Text style={styles.statLabel}>Participants</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="location" size={24} color={fishingTheme.colors.deepOcean} />
          <Text style={styles.statNumber} numberOfLines={1}>{tournament?.lake || 'TBD'}</Text>
          <Text style={styles.statLabel}>Location</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color={fishingTheme.colors.mutedGold} />
          <Text style={styles.statNumber}>TBD</Text>
          <Text style={styles.statLabel}>Prize Pool</Text>
        </View>
      </View>
      
      {/* Tournament Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Tournament Details</Text>
        
        <View style={styles.detailItem}>
          <Ionicons name="location" size={20} color={fishingTheme.colors.lightTeal} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Location</Text>
            <TouchableOpacity onPress={openDirections}>
              <Text style={[styles.detailValue, styles.linkText]}>
                {tournament?.lake || 'Location TBD'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="fish" size={20} color={fishingTheme.colors.deepOcean} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Tournament Code</Text>
            <Text style={styles.detailValue}>
              {tournament?.tournament_code || 'TBD'}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="people" size={20} color={fishingTheme.colors.goldenOrange} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Current Participants</Text>
            <Text style={styles.detailValue}>
              {participantCount} registered
            </Text>
          </View>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!isRegistered && getStatusText(tournament?.event_date || null) !== 'Completed' && (
          <TouchableOpacity style={styles.registerButton} onPress={handleRegistration}>
            <View style={styles.buttonGradient}>
              <Ionicons name="add-circle" size={20} color={fishingTheme.colors.white} />
              <Text style={styles.buttonText}>Register Now</Text>
            </View>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color={fishingTheme.colors.lightTeal} />
          <Text style={[styles.buttonText, { color: fishingTheme.colors.lightTeal }]}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderParticipants = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Participants</Text>
        <Text style={styles.participantCount}>{(resultsData?.length ?? participants.length) + ' participated'}</Text>
      </View>

      {resultsLoading && <ActivityIndicator accessibilityLabel="participants-loading" />}

      {resultsError && (
        <View style={styles.inlinePad8}>
          <Text accessibilityRole="alert">Error loading participants</Text>
        </View>
      )}

      {/* Prefer deduped participant list from resultsData */}
      {!resultsLoading && uniqueResultParticipants && uniqueResultParticipants.length > 0 ? (
        <View style={styles.participantsList}>
          {uniqueResultParticipants.map((p, idx) => (
            <TouchableOpacity
              key={p.member_id}
              style={styles.participantCard}
              accessibilityRole="button"
              onPress={() => (navigation as unknown as { navigate: (route: string, params?: { memberId?: string }) => void }).navigate('MemberProfile', { memberId: p.member_id })}
            >
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{p.member_name}</Text>
              </View>
              <Text style={styles.participantNumber}>#{idx + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        // No results rows — show registered participants if present, otherwise an empty state
        (participants.length === 0 ? (
          <EmptyState
            icon="people"
            title="No Participants Yet"
            message="Be the first to register for this tournament!"
          />
        ) : (
          <View style={styles.participantsList}>
            {participants.map((participant, index) => (
              <View key={participant.id} style={styles.participantCard}>
                <View style={styles.participantInfo}>
                  <View style={styles.participantHeader}>
                    <Text style={styles.participantName}>{participant.member_name}</Text>
            <View style={[styles.participantStatusBadge, { 
              backgroundColor: participant.status === 'confirmed' ? theme.success : 
                 participant.status === 'pending' ? theme.warning : theme.textSecondary
            }]}>
                      <Text style={styles.participantStatusText}>
                        {participant.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.registrationDate}>
                    Registered: {new Date(participant.registration_date).toLocaleDateString()}
                  </Text>
                </View>
                
                <Text style={styles.participantNumber}>#{index + 1}</Text>
              </View>
            ))}
          </View>
        ))
      )}
    </View>
  );
  
  const renderResults = () => {
    // Use multi-day data from top-level hook to show Day tabs + Final combined
    const dayEvents = multiDay.dayEvents || [];
    const isMultiDay = dayEvents.length > 1;
    
    // For single-day tournaments, only show "Final" tab
    // For multi-day tournaments, show "Day 1", "Day 2", etc. plus "Final"
    const tabs = isMultiDay 
      ? [
          ...dayEvents.map((d: any, i: number) => ({ key: d.tournament_code || d.event_id, label: `Day ${i + 1}`, date: d.event_date, isFinal: false })),
          { key: 'combined', label: 'Final', isFinal: true }
        ]
      : [{ key: 'combined', label: 'Final', isFinal: true }];

  const ResultsTable = ({ rows, combined }: { rows: Array<any>; combined?: boolean }) => {
      if (!rows || rows.length === 0) return <EmptyState icon="trophy" title={combined ? 'Final results pending' : 'Results pending'} message={combined ? 'Final combined results will appear once both days are available' : 'Results will be available after the day'} />;

      // Combined view: build table with Day1/Day2 columns and totals
      if (combined) {
        // multiDay.dayResults is available in outer scope; if rows is the combined array, use multiDay to build detailed table
  const dayCodes = (multiDay?.dayEvents || []).map((d: { tournament_code?: string; event_id?: string }) => d.tournament_code || d.event_id);

        // Aggregate per-day stats per member with deduplication by row id to avoid double-counting
  const perMember: Record<string, { member_id: string; member_name: string; days: Record<string, { fish: number; weight: number }>; total_weight: number; total_fish: number; total_aoy: number; places: number[]; }> = {};
        const seenRowIds = new Set<string>();

        dayCodes.forEach((code: string) => {
          const dayRows = (multiDay?.dayResults?.[code] || []) as Array<any>;
          dayRows.forEach((r: any) => {
            // Determine a stable row id if available
            const rowId = r.id || r.result_id || `${r.member_id || r.member?.member_code || r.member_name || ''}::${r.place || ''}::${r.weight_lbs || ''}`;
            if (!rowId) return;
            if (seenRowIds.has(rowId)) return; // skip duplicates
            seenRowIds.add(rowId);

            const id = r.member_id || r.member?.dbm_number || r.member?.member_code || r.member_code || r.member_name;
            if (!id) return;
            perMember[id] = perMember[id] || { member_id: id, member_name: r.member_name || r.member?.member_name || id, days: {} , total_weight: 0, total_fish: 0, total_aoy: 0, places: [] };
            const fish = (r.weight_lbs && Number(r.weight_lbs) > 0) ? (r.fish_count != null ? Number(r.fish_count) : 1) : 0;
            const weight = Number(r.weight_lbs || 0);
            perMember[id].days[code] = perMember[id].days[code] || { fish: 0, weight: 0 };
            perMember[id].days[code].fish += fish;
            perMember[id].days[code].weight += weight;
            perMember[id].total_weight += weight;
            perMember[id].total_fish += fish;
            perMember[id].total_aoy += Number(r.aoy_points || 0);
            if (r.place != null) perMember[id].places.push(Number(r.place));
          });
        });

        const combinedRows = Object.values(perMember).map((m) => ({
          ...m,
          best_place: m.places.length ? Math.min(...m.places) : null,
        }));

        // If AOY points weren't provided but best_place is 1, default AOY to 100 per your rules
        combinedRows.forEach((r) => {
          if ((!r.total_aoy || r.total_aoy === 0) && r.best_place === 1) {
            r.total_aoy = 100;
          }
        });

  // Debug: print per-member breakdown to help diagnose aggregation math
        // eslint-disable-next-line no-console
        console.log('[TournamentDetail] combined perMember breakdown ->', perMember);
        // Also print Nick Melcher's entry (if present) for quick verification
        try {
          const nick = Object.values(perMember).find((v: any) => String(v.member_name || '').toLowerCase().includes('nick melcher'));
          // eslint-disable-next-line no-console
          console.log('[TournamentDetail] Nick Melcher entry ->', nick);
        } catch (e) {
          // ignore
        }
        // Additionally, print any raw rows from each day that mention 'nick' so we can spot duplicates or wrong weights
        try {
          const term = 'nick';
          (dayCodes || []).forEach((code: string) => {
            const dayRows = (multiDay?.dayResults?.[code] || []) as any[];
            const matching = dayRows.filter((r: any) => String(r.member_name || r.member?.member_name || '').toLowerCase().includes(term));
            try {
              // eslint-disable-next-line no-console
              console.log(`[TournamentDetail] raw rows (json) for '${term}' on ${code} ->` + JSON.stringify(matching.map((r: any) => ({ id: r.id || r.result_id, member_id: r.member_id, member_name: r.member_name, weight_lbs: r.weight_lbs, place: r.place, raw: r })), null, 2));
            } catch (e) {
              // eslint-disable-next-line no-console
              console.log(`[TournamentDetail] raw rows for '${term}' on ${code} ->`, matching.map((r: any) => ({ id: r.id || r.result_id, member_id: r.member_id, member_name: r.member_name, weight_lbs: r.weight_lbs, place: r.place })));
            }
          });
        } catch (e) {
          // ignore
        }

        combinedRows.sort((a: any, b: any) => {
          if (b.total_weight !== a.total_weight) return b.total_weight - a.total_weight;
          return (a.best_place || 999) - (b.best_place || 999);
        });

        return (
          <ScrollView accessibilityLabel="results-list" style={styles.resultsScroll}>
            {/* Header */}
            <View style={styles.resultsHeaderRow}>
              <Text style={styles.resultsHeaderTextFixed40}>#</Text>
              <Text style={styles.resultsHeaderTextFlex}>Name</Text>
              {dayCodes.map((c: string, i: number) => (
                <View key={c} style={styles.resultsDayCol}>
                  <Text style={styles.resultsHeaderTextCenter}>{`Day ${i + 1} #`}</Text>
                  <Text style={styles.resultsHeaderTextCenter}>{`Day ${i + 1} Wt`}</Text>
                </View>
              ))}
              <Text style={styles.resultsHeaderTextSm}>Total #</Text>
              <Text style={styles.resultsHeaderTextMd}>Total Wt</Text>
              <Text style={styles.resultsHeaderTextSm}>AOY</Text>
            </View>

            {/* Local normalize helper to create a stable fallback key when member_id is missing */}
            {/**
             * We purposely avoid importing hooks here; a lightweight local normalizer
             * mirrors the same behavior used in aggregation so keys match.
             */}
            {(() => {
              const normalizeNameLocal = (n: any) => {
                if (n == null) return '';
                try { return String(n).normalize('NFKC').trim().toLowerCase(); } catch (e) { return String(n).trim().toLowerCase(); }
              };
              return combinedRows.map((r: any, idx: number) => {
                const fallbackKey = normalizeNameLocal(r.member_name) || `combined-${idx}`;
                const rowKey = r.member_id || fallbackKey;
                const place = idx + 1;
                
                // Trophy icon for top 3 in Final (combined) view
                let placeDisplay = null;
                if (place === 1) {
                  placeDisplay = <Ionicons name="trophy" size={24} color={theme.gold} />; // Gold
                } else if (place === 2) {
                  placeDisplay = <Ionicons name="trophy" size={24} color={theme.silver} />; // Silver
                } else if (place === 3) {
                  placeDisplay = <Ionicons name="trophy" size={24} color={theme.bronze} />; // Bronze
                } else {
                  placeDisplay = <Text style={styles.placeBold}>{place}</Text>;
                }
                
                return (
                  <TouchableOpacity key={rowKey} onPress={() => (navigation as unknown as { navigate: (route: string, params?: { memberId?: string }) => void }).navigate('MemberProfile', { memberId: r.member_id || undefined })} style={styles.resultsRow}>
                    <View style={styles.resultsColPlace}>{placeDisplay}</View>
                    <View style={styles.resultsColName}>
                      <Text style={styles.resultsName}>{r.member_name}</Text>
                    </View>
                    {dayCodes.map((c: string) => (
                      <View key={c} style={styles.resultsDayColCenter}>
                        <Text style={styles.resultsCell}>{r.days[c]?.fish ?? 0}</Text>
                        <Text style={styles.resultsCell}>{r.days[c]?.weight ? Number(r.days[c].weight).toFixed(2) : '0.00'}</Text>
                      </View>
                    ))}
                    <Text style={styles.resultsSm}>{r.total_fish}</Text>
                    <Text style={styles.resultsMdBold}>{Number(r.total_weight).toFixed(2)}</Text>
                    <Text style={styles.resultsSmAccent}>{r.total_aoy || 0}</Text>
                  </TouchableOpacity>
                );
              });
            })()}
            
          </ScrollView>
        );
      }

      // Day view (single-day rows) - sort by weight descending
      const sortedRows = [...rows].sort((a: any, b: any) => {
        const aWeight = Number(a.weight_lbs || 0);
        const bWeight = Number(b.weight_lbs || 0);
        return bWeight - aWeight;
      });

      // Determine if this is Day 2 by checking selectedResultTab
      const isDay2 = selectedResultTab && selectedResultTab !== 'combined' && dayEvents.length >= 2 && selectedResultTab === (dayEvents[1]?.tournament_code || dayEvents[1]?.event_id);
  // const isDay1 = selectedResultTab && selectedResultTab !== 'combined' && dayEvents.length >= 1 && selectedResultTab === (dayEvents[0]?.tournament_code || dayEvents[0]?.event_id);
      
      // Build Day 1 placement map for movement comparison
      const day1Placements = new Map<string, number>();
      if (isDay2 && dayEvents.length >= 1) {
        const day1Code = dayEvents[0]?.tournament_code || dayEvents[0]?.event_id;
        const day1Rows = multiDay?.dayResults?.[day1Code] || [];
        day1Rows.forEach((r: any, idx: number) => {
          const id = r.member_id || r.member?.dbm_number || r.member?.member_code || r.member_name;
          if (id) day1Placements.set(String(id), idx + 1);
        });
      }

      return (
  <ScrollView accessibilityLabel="results-list" style={styles.resultsScroll}>
          {/* Header */}
          <View style={[styles.resultsHeaderRow, styles.resultsHeaderRowBottom]}>
            <Text style={styles.resultsHeaderTextFixed40}>#</Text>
            <Text style={styles.resultsHeaderTextFlex}>Name</Text>
            {isDay2 && <Text style={styles.resultsHeaderTextMove}>Move</Text>}
            <Text style={styles.resultsHeaderTextMove}>Fish</Text>
            <Text style={styles.resultsHeaderTextWeight}>Weight</Text>
          </View>

          {sortedRows.map((r: any, idx: number) => {
            const isBigBass = !!r.big_fish || !!r.big_bass;
            const memberId = r.member?.dbm_number || r.member?.member_code || r.member_id || r.member_code;
            const currentPlace = idx + 1;
            
            // Movement indicator for Day 2
            let movement = null;
            if (isDay2) {
              const id = r.member_id || r.member?.dbm_number || r.member?.member_code || r.member_name;
              const day1Place = id ? day1Placements.get(String(id)) : null;
              if (day1Place) {
                const delta = day1Place - currentPlace;
                if (delta > 0) {
                  movement = (
                    <View style={styles.moveContainer}>
                      <Ionicons name="arrow-up" size={14} color={theme.success} />
                      <Text style={[styles.moveText, { color: theme.success }]}>+{delta}</Text>
                    </View>
                  );
                } else if (delta < 0) {
                  movement = (
                    <View style={styles.moveContainer}>
                      <Ionicons name="arrow-down" size={14} color={theme.error} />
                      <Text style={[styles.moveText, { color: theme.error }]}>{Math.abs(delta)}</Text>
                    </View>
                  );
                } else {
                  movement = <Text style={styles.moveDash}>—</Text>;
                }
              }
            }
            
            return (
              <TouchableOpacity
                key={r.id}
                accessibilityRole="button"
                accessibilityLabel={`result-${idx + 1}-${r.member_name || r.member_id}`}
                onPress={() => (navigation as unknown as { navigate: (route: string, params?: { memberId?: string }) => void }).navigate('MemberProfile', { memberId })}
                style={styles.resultsRow}
              >
                <Text style={styles.resultsPlace}>{currentPlace}</Text>
                <View style={styles.resultsColName}>
                  <Text style={styles.resultsName}>{r.member_name || r.member_id}</Text>
                  {r.boat_name ? <Text style={styles.resultsBoat}>{r.boat_name}</Text> : null}
                  {isBigBass && <Text accessibilityLabel="big-bass" style={styles.resultsBigBass}>Big Bass</Text>}
                </View>
                {isDay2 && <View style={styles.resultsMove}>{movement}</View>}
                <Text style={styles.resultsFish}>{r.fish_count || 0}</Text>
                <View style={styles.resultsWeight}>
                  <Text style={styles.resultsWeightText}>{r.weight_lbs ? Number(r.weight_lbs).toFixed(2) : '0.00'}</Text>
                  {
                    (() => {
                      const num = r.payout != null ? Number(r.payout) : (r.cash_payout != null ? Number(String(r.cash_payout).replace(/[^0-9.-]+/g, '')) : null);
                      return num != null && Number.isFinite(num) ? <Text style={styles.resultsPayout}>${num}</Text> : null;
                    })()
                  }
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      );
    };

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Tournament Results</Text>

        {multiLoading && <ActivityIndicator accessibilityLabel="results-loading" />}

        {!multiLoading && (
          <View>
            {/* Tabs header */}
            <View style={styles.resultsTabsHeader}>
              {tabs.map((t: any) => (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setSelectedResultTab(t.key)}
                  style={[
                    styles.resultsTab,
                    selectedResultTab === t.key ? styles.resultsTabActive : styles.resultsTabInactive,
                  ]}
                >
                  <Text style={styles.resultsTabText}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Render only the active tab's content */}
            <View>
              {selectedResultTab === 'combined' ? (
                <ResultsTable combined rows={multiDay.combined} />
              ) : (
                <ResultsTable rows={multiDay.dayResults[selectedResultTab || tabs[0]?.key] || []} />
              )}
            </View>
          </View>
        )}
      </View>
    );
  };
  
  if (!tournament) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="alert-circle"
          title="Tournament Not Found"
          message="This tournament may have been removed or is no longer available."
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <TopBar showBack title={tournament?.tournament_name || 'Tournament Details'} rightAction={{ icon: 'share-outline', onPress: handleShare, accessibilityLabel: 'Share tournament' }} />
      
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderTabButton('overview', 'information-circle', 'Overview')}
          {renderTabButton('participants', 'people', 'Participants')}
          {renderTabButton('results', 'trophy', 'Results')}
        </ScrollView>
      </View>
      
      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'participants' && renderParticipants()}
        {activeTab === 'results' && renderResults()}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: BrandTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.spacing.xl,
    paddingTop: theme.layout.spacing.xxl,
    paddingBottom: theme.layout.spacing.md,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
  },
  shareHeaderButton: {
    padding: 8,
  },
  tabNavigation: {
    backgroundColor: theme.surface,
    paddingVertical: theme.layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.layout.spacing.xl,
    paddingVertical: theme.layout.spacing.sm,
    marginHorizontal: theme.layout.spacing.sm,
    borderRadius: theme.layout.radius.xl,
    backgroundColor: theme.mode === 'light' ? '#f5f5f5' : theme.background,
  },
  activeTabButton: {
    backgroundColor: theme.components.buttonPrimary.filled.backgroundColor,
    // focus glow for active tab
    shadowColor: theme.glow.subtle.shadowColor,
    shadowOffset: theme.glow.subtle.shadowOffset,
    shadowOpacity: theme.glow.subtle.shadowOpacity,
    shadowRadius: theme.glow.subtle.shadowRadius,
  },
  tabLabel: {
    marginLeft: theme.layout.spacing.sm,
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.medium,
    color: theme.textSecondary,
  },
  activeTabLabel: {
    color: '#fff',
    fontFamily: theme.typography.family.bold,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: theme.layout.spacing.xl,
  },
  headerCard: {
    marginBottom: theme.layout.spacing.xl,
    borderRadius: theme.layout.radius.xl,
    backgroundColor: theme.surface,
    // subtle glow
    shadowColor: theme.glow.subtle.shadowColor,
    shadowOffset: theme.glow.subtle.shadowOffset,
    shadowOpacity: theme.glow.subtle.shadowOpacity,
    shadowRadius: theme.glow.subtle.shadowRadius,
    elevation: theme.glow.subtle.elevation,
  },
  headerContent: {
    padding: theme.layout.spacing.xl,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.layout.spacing.lg,
    paddingVertical: theme.layout.spacing.sm,
    borderRadius: theme.layout.radius.xl,
    marginBottom: theme.layout.spacing.md,
  },
  statusText: {
    marginLeft: theme.layout.spacing.sm,
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.family.bold,
    color: '#fff',
  },
  tournamentTitle: {
    fontSize: theme.typography.sizes.h1,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    textAlign: 'center',
    marginBottom: theme.layout.spacing.sm,
  },
  tournamentDate: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.regular,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.layout.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    padding: theme.layout.spacing.lg,
    marginHorizontal: theme.layout.spacing.sm,
    borderRadius: theme.layout.radius.lg,
    alignItems: 'center',
    shadowColor: theme.glow.subtle.shadowColor,
    shadowOffset: theme.glow.subtle.shadowOffset,
    shadowOpacity: theme.glow.subtle.shadowOpacity,
    shadowRadius: theme.glow.subtle.shadowRadius,
    elevation: theme.glow.subtle.elevation,
    borderWidth: 1,
    borderColor: theme.border,
  },
  statNumber: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    marginTop: theme.layout.spacing.sm,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.family.regular,
    color: theme.textSecondary,
    marginTop: theme.layout.spacing.xs,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: theme.surface,
    padding: theme.layout.spacing.lg,
    borderRadius: theme.layout.radius.lg,
    marginBottom: theme.layout.spacing.xl,
    shadowColor: theme.glow.subtle.shadowColor,
    shadowOffset: theme.glow.subtle.shadowOffset,
    shadowOpacity: theme.glow.subtle.shadowOpacity,
    shadowRadius: theme.glow.subtle.shadowRadius,
    elevation: theme.glow.subtle.elevation,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    marginBottom: theme.layout.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.layout.spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
  },
  detailContent: {
    flex: 1,
    marginLeft: theme.layout.spacing.md,
  },
  detailLabel: {
    fontSize: theme.typography.sizes.label,
    fontFamily: theme.typography.family.regular,
    color: theme.textSecondary,
    marginBottom: theme.layout.spacing.xs,
  },
  detailValue: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.medium,
    color: theme.text,
  },
  linkText: {
    color: theme.accent,
    textDecorationLine: 'underline',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.layout.spacing.sm,
  },
  registerButton: {
    flex: 1,
    marginRight: theme.layout.spacing.sm,
    borderRadius: theme.layout.radius.xl,
    overflow: 'hidden',
  },
  shareButton: {
    flex: 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.layout.spacing.md,
    borderRadius: theme.layout.radius.xl,
    borderWidth: 2,
    borderColor: theme.primary,
    backgroundColor: theme.surface,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.layout.spacing.md,
    paddingHorizontal: theme.layout.spacing.xl,
    backgroundColor: theme.components.buttonPrimary.filled.backgroundColor,
  },
  buttonText: {
    marginLeft: theme.layout.spacing.sm,
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.family.bold,
    color: theme.onPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.layout.spacing.md,
  },
  participantCount: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.regular,
    color: theme.textSecondary,
  },
  participantsList: {
    gap: theme.layout.spacing.md,
  },
  participantCard: {
    backgroundColor: theme.surface,
    padding: theme.layout.spacing.lg,
    borderRadius: theme.layout.radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: theme.glow.subtle.shadowColor,
    shadowOffset: theme.glow.subtle.shadowOffset,
    shadowOpacity: theme.glow.subtle.shadowOpacity,
    shadowRadius: theme.glow.subtle.shadowRadius,
    elevation: theme.glow.subtle.elevation,
    borderWidth: 1,
    borderColor: theme.border,
  },
  participantInfo: {
    flex: 1,
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  participantName: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    flex: 1,
  },
  participantStatusBadge: {
    paddingHorizontal: theme.layout.spacing.sm,
    paddingVertical: theme.layout.spacing.xs,
    borderRadius: theme.layout.radius.sm,
  },
  participantStatusText: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.family.bold,
    color: '#fff',
  },
  registrationDate: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.family.regular,
    color: theme.textSecondary,
  },
  participantNumber: {
    fontSize: theme.typography.sizes.h2,
    fontFamily: theme.typography.family.bold,
    color: theme.accent,
  },
  resultsHeader: {
    flexDirection: 'row',
    paddingHorizontal: theme.layout.spacing.md,
    paddingVertical: theme.layout.spacing.sm,
    backgroundColor: theme.surface,
    borderRadius: theme.layout.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  resultsHeaderLabelText: {
    fontSize: theme.typography.sizes.label,
    fontFamily: theme.typography.family.bold,
    color: theme.textSecondary,
  },
  bigBassBadge: {
    marginTop: theme.layout.spacing.sm,
    backgroundColor: theme.accent,
    paddingHorizontal: theme.layout.spacing.sm,
    paddingVertical: theme.layout.spacing.xs,
    borderRadius: theme.layout.radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bigBassText: {
    color: '#fff',
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.family.bold,
  },
  // Results table themed styles (replaces inline styles)
  resultsScroll: {
    marginTop: 8,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: theme.mode === 'light' ? theme.card : theme.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },
  resultsHeaderRowBottom: {
    marginBottom: 8,
  },
  resultsDayCol: {
    width: 140,
  },
  resultsHeaderText: {
    color: theme.text,
    fontFamily: theme.typography.family.bold,
  },
  resultsHeaderTextFixed40: {
    color: theme.text,
    fontFamily: theme.typography.family.bold,
    width: 40,
  },
  resultsHeaderTextFlex: {
    color: theme.text,
    fontFamily: theme.typography.family.bold,
    flex: 1,
  },
  resultsHeaderTextCenter: {
    color: theme.text,
    fontFamily: theme.typography.family.bold,
    textAlign: 'center',
  },
  resultsHeaderTextSm: {
    color: theme.text,
    fontFamily: theme.typography.family.bold,
    width: 80,
    textAlign: 'center',
  },
  resultsHeaderTextMd: {
    color: theme.text,
    fontFamily: theme.typography.family.bold,
    width: 100,
    textAlign: 'center',
  },
  resultsHeaderTextMove: {
    color: theme.text,
    fontFamily: theme.typography.family.bold,
    width: 60,
    textAlign: 'center',
  },
  resultsHeaderTextWeight: {
    color: theme.text,
    fontFamily: theme.typography.family.bold,
    width: 80,
    textAlign: 'center',
  },
  placeBold: {
    fontWeight: '700',
  },
  resultsRow: {
    flexDirection: 'row',
    padding: 12,
    marginVertical: 6,
    backgroundColor: theme.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  resultsColPlace: {
    width: 40,
    alignItems: 'center',
  },
  resultsColName: {
    flex: 1,
  },
  resultsName: {
    fontFamily: theme.typography.family.bold,
    color: theme.text,
  },
  resultsDayColCenter: {
    width: 140,
    alignItems: 'center',
  },
  resultsCell: {
    color: theme.text,
    fontFamily: theme.typography.family.regular,
  },
  resultsSm: {
    width: 80,
    textAlign: 'center',
    color: theme.text,
    fontFamily: theme.typography.family.regular,
  },
  resultsMdBold: {
    width: 100,
    textAlign: 'center',
    color: theme.text,
    fontFamily: theme.typography.family.bold,
  },
  resultsSmAccent: {
    width: 80,
    textAlign: 'center',
    color: theme.accent,
    fontFamily: theme.typography.family.bold,
  },
  resultsPlace: {
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    width: 40,
    textAlign: 'center',
  },
  resultsMove: {
    width: 60,
    alignItems: 'center',
  },
  resultsFish: {
    width: 60,
    textAlign: 'center',
    color: theme.text,
    fontFamily: theme.typography.family.regular,
  },
  resultsWeight: {
    width: 80,
    alignItems: 'center',
  },
  resultsWeightText: {
    color: theme.text,
    fontFamily: theme.typography.family.bold,
  },
  resultsPayout: {
    color: theme.accent,
    fontSize: 12,
    fontFamily: theme.typography.family.medium,
  },
  resultsBoat: {
    color: theme.textSecondary,
    fontSize: 12,
    fontFamily: theme.typography.family.regular,
  },
  resultsBigBass: {
    color: theme.accent,
    fontSize: 12,
    fontFamily: theme.typography.family.bold,
  },
  // Movement indicator styles
  moveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 2,
  },
  moveDash: {
    color: theme.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  // Tabs in results header
  resultsTabsHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  resultsTab: {
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
  },
  resultsTabActive: {
    backgroundColor: theme.components.chipPrimary.filled.backgroundColor,
    borderColor: theme.primary,
  },
  resultsTabInactive: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
  },
  resultsTabText: {
    color: theme.text,
    fontFamily: theme.typography.family.medium,
  },
  // Misc small helpers
  inlinePad8: {
    padding: 8,
  },
});

export default TournamentDetailScreen;