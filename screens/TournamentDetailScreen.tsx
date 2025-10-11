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
import { useTournaments, useAOYStandings, useTournamentResults } from '../lib/hooks/useQueries';
import { supabase } from '../lib/supabase';
import { showSuccess, showError } from '../utils/toast';
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
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  const tournament = tournaments?.find(t => t.event_id === tournamentId);

  // Fetch results for this tournament (event id is tournamentId)
  const { data: resultsData, isLoading: resultsLoading, error: resultsError } = useTournamentResults(tournamentId);
  
  useEffect(() => {
    if (tournament) {
      loadTournamentData();
    }
  }, [tournament]);
  
  const loadTournamentData = async () => {
    setLoading(true);
    try {
      // Simulate participants data - in real app this would come from Supabase
      const mockParticipants: Participant[] = [
        {
          id: '1',
          member_name: 'John Smith',
          registration_date: new Date().toISOString(),
          status: 'confirmed'
        },
        {
          id: '2', 
          member_name: 'Mike Johnson',
          registration_date: new Date().toISOString(),
          status: 'confirmed'
        }
      ];
      
      setParticipants(mockParticipants);
      
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
      loadTournamentData()
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
          <Text style={styles.statNumber}>{participants.length}</Text>
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
              {tournament?.participants || 0} registered
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

      {/* If results exist, prefer showing everyone who "fishied" (had results rows) */}
      {resultsLoading && <ActivityIndicator accessibilityLabel="participants-loading" />}

      {resultsError && (
        <View style={{ padding: 8 }}>
          <Text accessibilityRole="alert">Error loading participants</Text>
        </View>
      )}

      {!resultsLoading && resultsData && resultsData.length > 0 ? (
        <View>
          {/* Header row */}
          <View style={[styles.resultsHeader, { marginBottom: 8 }]}>
            <Text style={[styles.resultsHeaderText, { flex: 0.5 }]}>Place</Text>
            <Text style={[styles.resultsHeaderText, { flex: 2 }]}>Angler</Text>
            <Text style={[styles.resultsHeaderText, { flex: 1, textAlign: 'right' }]}>Weight</Text>
            <Text style={[styles.resultsHeaderText, { flex: 1, textAlign: 'right' }]}>Payout</Text>
          </View>

          <View style={styles.participantsList}>
            {resultsData.map((r: any, index: number) => {
              const isBigBass = !!r.big_fish || !!r.big_bass;
              const placeNum = r.place || index + 1;
              const isTop3 = placeNum >= 1 && placeNum <= 3;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={styles.participantCard}
                  accessibilityRole="button"
                  onPress={() => (navigation as any).navigate('Profile', { memberId: r.member_id || r.member_code || r.member_id })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ width: 48, alignItems: 'center' }}>
                      {isTop3 ? (
                        <Ionicons name={placeNum === 1 ? 'trophy' : 'medal'} size={24} color={placeNum === 1 ? '#FFD700' : placeNum === 2 ? '#C0C0C0' : '#cd7f32'} />
                      ) : (
                        <Text style={{ fontWeight: '700', width: 40, textAlign: 'center' }}>{placeNum}</Text>
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.participantName}>{r.member_name || r.member_id}</Text>
                      {r.boat_name ? <Text style={{ color: '#666' }}>{r.boat_name}</Text> : null}
                    </View>
                  </View>

                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text>{r.weight_lbs ? `${r.weight_lbs} lb` : '-'}</Text>
                    <Text>{r.payout ? `$${r.payout}` : ''}</Text>
                    {isBigBass && (
                      <View style={styles.bigBassBadge}>
                        <Ionicons name="fish" size={14} color="#fff" />
                        <Text style={styles.bigBassText}> Big Bass</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : (
        // Fall back to registered participants list (if any)
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
    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Tournament Results</Text>

        {resultsLoading && <ActivityIndicator accessibilityLabel="results-loading" />}

        {resultsError && (
          <View style={{ padding: 8 }}>
            <Text accessibilityRole="alert">Error loading results</Text>
          </View>
        )}

        {!resultsLoading && (!resultsData || resultsData.length === 0) && (
          <EmptyState
            icon="trophy"
            title="Results Pending"
            message={getStatusText(tournament?.event_date || null) === 'Completed' ? 
              "Results are being finalized..." : 
              "Results will be available after the tournament"}
          />
        )}

        {!resultsLoading && resultsData && resultsData.length > 0 && (
          <ScrollView accessibilityLabel="results-list" style={{ marginTop: 8 }}>
            {resultsData.map((r: any) => {
              const isBigBass = !!r.big_fish || !!r.big_bass;
              return (
                <TouchableOpacity
                  key={r.id}
                  accessibilityRole="button"
                  accessibilityLabel={`result-${r.place}-${r.member_name || r.member_id}`}
                  onPress={() => {
                    // Future: navigate to member profile
                  }}
                  style={{
                    padding: 12,
                    marginVertical: 6,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    elevation: 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: '700', width: 40 }}>{r.place || '-'}</Text>
                    <View>
                      <Text style={{ fontWeight: '600' }}>{r.member_name || r.member_id}</Text>
                      {r.boat_name ? <Text style={{ color: '#666' }}>{r.boat_name}</Text> : null}
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text>{r.weight_lbs ? `${r.weight_lbs} lb` : '-'}</Text>
                    <Text>{r.payout ? `$${r.payout}` : ''}</Text>
                    {isBigBass && <Text accessibilityLabel="big-bass" style={{ color: '#b8860b' }}>Big Bass</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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