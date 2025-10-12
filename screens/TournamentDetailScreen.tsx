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
import { useTournaments, useAOYStandings, useTournamentResults, useTournamentParticipants } from '../lib/hooks/useQueries';
import { supabase } from '../lib/supabase';
import { showSuccess, showError } from '../utils/toast';
import { useMultiDayTournamentResults } from '../lib/hooks/useQueries';
import EmptyState from '../components/EmptyState';
import TopBar from '../components/TopBar';

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
  const { tournamentId } = route.params as { tournamentId: string };
  
  const { data: tournaments, refetch: refetchTournaments } = useTournaments();
  const { data: standings } = useAOYStandings();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'results'>('overview');
  const [selectedResultTab, setSelectedResultTab] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
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
  const { data: resultsData, isLoading: resultsLoading, error: resultsError, refetch: refetchResults } = useTournamentResults(resolvedCode) as any;
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
  }, [multiDay?.dayEvents?.length]);

  // Debug: log multi-day data when it changes so we can verify Day1/Day2/Final
  // Keep a minimal dev-only summary log for multi-day changes
  useEffect(() => {
    if (!__DEV__) return;
    // eslint-disable-next-line no-console
    console.log('[TournamentDetail] multiDay summary ->', {
      dayCount: (multiDay?.dayEvents || []).length,
      combinedCount: (multiDay?.combined || []).length,
    });
  }, [multiDay?.dayEvents?.length, multiDay?.combined?.length]);

  // Force refetch of results/participants when the resolvedCode changes
  useEffect(() => {
    if (!resolvedCode) return;
    refetchParticipants && refetchParticipants();
    if (typeof refetchResults === 'function') refetchResults();
  }, [resolvedCode]);

  useEffect(() => {
    if (liveParticipants) {
      // Map live rows into Participant shape used by the UI
      const mapped = liveParticipants.map((p: any) => ({
        id: p.id,
        member_name: p.member_name || p.member_id,
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
    setLoading(true);
    try {
      // Keep this function for any future preload work.
      // Live participants are provided by useTournamentParticipants hook.
      
    } catch (error) {
      console.error('Error loading tournament data:', error);
      showError('Failed to load tournament details');
    } finally {
      setLoading(false);
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
  
  const renderTabButton = (tab: string, icon: string, label: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab as any)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === tab ? '#fff' : '#666'}
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
              color="#fff"
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
          <Ionicons name="people" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{participantCount}</Text>
          <Text style={styles.statLabel}>Participants</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="location" size={24} color="#2196F3" />
          <Text style={styles.statNumber} numberOfLines={1}>{tournament?.lake || 'TBD'}</Text>
          <Text style={styles.statLabel}>Location</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#FFD700" />
          <Text style={styles.statNumber}>TBD</Text>
          <Text style={styles.statLabel}>Prize Pool</Text>
        </View>
      </View>
      
      {/* Tournament Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Tournament Details</Text>
        
        <View style={styles.detailItem}>
          <Ionicons name="location" size={20} color="#4CAF50" />
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
          <Ionicons name="fish" size={20} color="#2196F3" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Tournament Code</Text>
            <Text style={styles.detailValue}>
              {tournament?.tournament_code || 'TBD'}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="people" size={20} color="#FF9800" />
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
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.buttonText}>Register Now</Text>
            </View>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color="#4CAF50" />
          <Text style={[styles.buttonText, { color: '#4CAF50' }]}>Share</Text>
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
        <View style={{ padding: 8 }}>
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
              onPress={() => (navigation as any).navigate('Profile', { memberId: p.member_id })}
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
                      backgroundColor: participant.status === 'confirmed' ? '#4CAF50' : 
                                     participant.status === 'pending' ? '#FF9800' : '#757575'
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

    const ResultsTable = ({ rows, combined }: { rows: any[]; combined?: boolean }) => {
      if (!rows || rows.length === 0) return <EmptyState icon="trophy" title={combined ? 'Final results pending' : 'Results pending'} message={combined ? 'Final combined results will appear once both days are available' : 'Results will be available after the day'} />;

      // Combined view: build table with Day1/Day2 columns and totals
      if (combined) {
        // multiDay.dayResults is available in outer scope; if rows is the combined array, use multiDay to build detailed table
        const dayCodes = (multiDay?.dayEvents || []).map((d: any) => d.tournament_code || d.event_id);

        // Aggregate per-day stats per member with deduplication by row id to avoid double-counting
        const perMember: Record<string, any> = {};
        const seenRowIds = new Set<string>();

        dayCodes.forEach((code: string) => {
          const dayRows = (multiDay?.dayResults?.[code] || []) as any[];
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

        const combinedRows = Object.values(perMember).map((m: any) => ({
          ...m,
          best_place: m.places.length ? Math.min(...m.places) : null,
        }));

        // If AOY points weren't provided but best_place is 1, default AOY to 100 per your rules
        combinedRows.forEach((r: any) => {
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
          <ScrollView accessibilityLabel="results-list" style={{ marginTop: 8 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', padding: 8, backgroundColor: '#eee', borderRadius: 6 }}>
              <Text style={{ fontWeight: '700', width: 40 }}>#</Text>
              <Text style={{ fontWeight: '700', flex: 1 }}>Name</Text>
              {dayCodes.map((c: string, i: number) => (
                <View key={c} style={{ width: 140 }}>
                  <Text style={{ fontWeight: '700', textAlign: 'center' }}>{`Day ${i + 1} #`}</Text>
                  <Text style={{ fontWeight: '700', textAlign: 'center' }}>{`Day ${i + 1} Wt`}</Text>
                </View>
              ))}
              <Text style={{ fontWeight: '700', width: 80, textAlign: 'center' }}>Total #</Text>
              <Text style={{ fontWeight: '700', width: 100, textAlign: 'center' }}>Total Wt</Text>
              <Text style={{ fontWeight: '700', width: 80, textAlign: 'center' }}>AOY</Text>
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
                  placeDisplay = <Ionicons name="trophy" size={24} color="#FFD700" />; // Gold
                } else if (place === 2) {
                  placeDisplay = <Ionicons name="trophy" size={24} color="#C0C0C0" />; // Silver
                } else if (place === 3) {
                  placeDisplay = <Ionicons name="trophy" size={24} color="#CD7F32" />; // Bronze
                } else {
                  placeDisplay = <Text style={{ fontWeight: '700' }}>{place}</Text>;
                }
                
                return (
                  <TouchableOpacity key={rowKey} onPress={() => (navigation as any).navigate('Profile', { memberId: r.member_id || undefined })} style={{ flexDirection: 'row', padding: 12, marginVertical: 6, backgroundColor: '#fff', borderRadius: 8, alignItems: 'center' }}>
                    <View style={{ width: 40, alignItems: 'center' }}>{placeDisplay}</View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600' }}>{r.member_name}</Text>
                    </View>
                    {dayCodes.map((c: string) => (
                      <View key={c} style={{ width: 140, alignItems: 'center' }}>
                        <Text>{r.days[c]?.fish ?? 0}</Text>
                        <Text>{r.days[c]?.weight ? Number(r.days[c].weight).toFixed(2) : '0.00'}</Text>
                      </View>
                    ))}
                    <Text style={{ width: 80, textAlign: 'center' }}>{r.total_fish}</Text>
                    <Text style={{ width: 100, textAlign: 'center' }}>{Number(r.total_weight).toFixed(2)}</Text>
                    <Text style={{ width: 80, textAlign: 'center' }}>{r.total_aoy || 0}</Text>
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
      const isDay1 = selectedResultTab && selectedResultTab !== 'combined' && dayEvents.length >= 1 && selectedResultTab === (dayEvents[0]?.tournament_code || dayEvents[0]?.event_id);
      
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
        <ScrollView accessibilityLabel="results-list" style={{ marginTop: 8 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', padding: 8, backgroundColor: '#eee', borderRadius: 6, marginBottom: 8 }}>
            <Text style={{ fontWeight: '700', width: 40 }}>#</Text>
            <Text style={{ fontWeight: '700', flex: 1 }}>Name</Text>
            {isDay2 && <Text style={{ fontWeight: '700', width: 60, textAlign: 'center' }}>Move</Text>}
            <Text style={{ fontWeight: '700', width: 60, textAlign: 'center' }}>Fish</Text>
            <Text style={{ fontWeight: '700', width: 80, textAlign: 'center' }}>Weight</Text>
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="arrow-up" size={14} color="#4CAF50" />
                      <Text style={{ color: '#4CAF50', fontSize: 12, fontWeight: '700', marginLeft: 2 }}>+{delta}</Text>
                    </View>
                  );
                } else if (delta < 0) {
                  movement = (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="arrow-down" size={14} color="#E53935" />
                      <Text style={{ color: '#E53935', fontSize: 12, fontWeight: '700', marginLeft: 2 }}>{Math.abs(delta)}</Text>
                    </View>
                  );
                } else {
                  movement = <Text style={{ color: '#888', fontSize: 12 }}>—</Text>;
                }
              }
            }
            
            return (
              <TouchableOpacity
                key={r.id}
                accessibilityRole="button"
                accessibilityLabel={`result-${idx + 1}-${r.member_name || r.member_id}`}
                onPress={() => (navigation as any).navigate('Profile', { memberId })}
                style={{ padding: 12, marginVertical: 6, backgroundColor: '#fff', borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
              >
                <Text style={{ fontWeight: '700', width: 40 }}>{currentPlace}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>{r.member_name || r.member_id}</Text>
                  {r.boat_name ? <Text style={{ color: '#666', fontSize: 12 }}>{r.boat_name}</Text> : null}
                  {isBigBass && <Text accessibilityLabel="big-bass" style={{ color: '#b8860b', fontSize: 12 }}>Big Bass</Text>}
                </View>
                {isDay2 && <View style={{ width: 60, alignItems: 'center' }}>{movement}</View>}
                <Text style={{ width: 60, textAlign: 'center' }}>{r.fish_count || 0}</Text>
                <View style={{ width: 80, alignItems: 'center' }}>
                  <Text>{r.weight_lbs ? Number(r.weight_lbs).toFixed(2) : '0.00'}</Text>
                  {
                    (() => {
                      const num = r.payout != null ? Number(r.payout) : (r.cash_payout != null ? Number(String(r.cash_payout).replace(/[^0-9.-]+/g, '')) : null);
                      return num != null && Number.isFinite(num) ? <Text style={{ color: '#4a7c59', fontSize: 12 }}>${num}</Text> : null;
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
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {tabs.map((t: any) => (
                <TouchableOpacity key={t.key} onPress={() => setSelectedResultTab(t.key)} style={{ padding: 8, backgroundColor: selectedResultTab === t.key ? '#cfe8d8' : '#f0f0f0', borderRadius: 6 }}>
                  <Text>{t.label}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  shareHeaderButton: {
    padding: 8,
  },
  tabNavigation: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
  },
  activeTabButton: {
    backgroundColor: '#4CAF50',
  },
  tabLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabLabel: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  headerCard: {
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    padding: 25,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 15,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  tournamentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  tournamentDate: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 5,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailContent: {
    flex: 1,
    marginLeft: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  linkText: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  registerButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  shareButton: {
    flex: 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  participantCount: {
    fontSize: 14,
    color: '#666',
  },
  participantsList: {
    gap: 10,
  },
  participantCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  participantStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  participantStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  registrationDate: {
    fontSize: 12,
    color: '#999',
  },
  participantNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  resultsHeader: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  resultsHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  bigBassBadge: {
    marginTop: 6,
    backgroundColor: '#b8860b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bigBassText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default TournamentDetailScreen;