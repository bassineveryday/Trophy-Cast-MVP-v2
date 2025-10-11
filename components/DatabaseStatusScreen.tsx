import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { testDatabaseConnection, formatDatabaseStatus, DatabaseStatus } from '../lib/databaseTest';

const DatabaseStatusScreen: React.FC = () => {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runTest = async () => {
    setLoading(true);
    try {
      const result = await testDatabaseConnection();
      setStatus(result);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run test on component mount
  useEffect(() => {
    runTest();
  }, []);

  const getStatusColor = (isGood: boolean) => isGood ? '#28a745' : '#dc3545';
  const getStatusIcon = (isGood: boolean) => isGood ? '✅' : '❌';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Database Connection Status</Text>
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={runTest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '🔄 Testing...' : '🔍 Test Connection'}
          </Text>
        </TouchableOpacity>
      </View>

      {lastChecked && (
        <Text style={styles.timestamp}>
          Last checked: {lastChecked.toLocaleTimeString()}
        </Text>
      )}

      {status && (
        <View style={styles.statusContainer}>
          {/* Overall Status */}
          <View style={styles.statusSection}>
            <Text style={styles.sectionTitle}>🔌 Connection Status</Text>
            <View style={styles.statusRow}>
              <Text style={[styles.statusText, { color: getStatusColor(status.isConnected) }]}>
                {getStatusIcon(status.isConnected)} Connected: {status.isConnected ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusText, { color: getStatusColor(status.hasData) }]}>
                {getStatusIcon(status.hasData)} Has Data: {status.hasData ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>

          {/* Table Status */}
          <View style={styles.statusSection}>
            <Text style={styles.sectionTitle}>📋 Table Status</Text>
            {Object.entries(status.tableStatus).map(([table, count]) => (
              <View key={table} style={styles.statusRow}>
                <Text style={styles.tableText}>
                  {getStatusIcon(count > 0)} {table}
                </Text>
                <Text style={[styles.countText, { color: getStatusColor(count > 0) }]}>
                  {count} records
                </Text>
              </View>
            ))}
          </View>

          {/* Sample Data */}
          {(status.sampleData.topAOYMember || status.sampleData.latestTournament) && (
            <View style={styles.statusSection}>
              <Text style={styles.sectionTitle}>📊 Sample Data</Text>
              {status.sampleData.topAOYMember && (
                <View style={styles.statusRow}>
                  <Text style={styles.sampleText}>
                    🏆 Top AOY: {status.sampleData.topAOYMember.member_name} 
                    (Rank {status.sampleData.topAOYMember.aoy_rank}, {status.sampleData.topAOYMember.total_aoy_points} pts)
                  </Text>
                </View>
              )}
              {status.sampleData.latestTournament && (
                <View style={styles.statusRow}>
                  <Text style={styles.sampleText}>
                    🎣 Latest: {status.sampleData.latestTournament.tournament_name} 
                    at {status.sampleData.latestTournament.lake}
                  </Text>
                </View>
              )}
              <View style={styles.statusRow}>
                <Text style={styles.sampleText}>
                  👥 Total Members: {status.sampleData.memberCount}
                </Text>
              </View>
            </View>
          )}

          {/* Errors */}
          {status.errors.length > 0 && (
            <View style={styles.statusSection}>
              <Text style={styles.sectionTitle}>❌ Errors</Text>
              {status.errors.map((error, index) => (
                <View key={index} style={styles.statusRow}>
                  <Text style={styles.errorText}>• {error}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Recommendations */}
          <View style={styles.statusSection}>
            <Text style={styles.sectionTitle}>💡 Next Steps</Text>
            {status.isConnected && status.hasData ? (
              <Text style={styles.recommendationText}>
                ✅ Your database is ready! The app should work with real tournament data.
                {'\n\n'}Try navigating to different screens to see your real data in action.
              </Text>
            ) : status.isConnected && !status.hasData ? (
              <Text style={styles.recommendationText}>
                ⚠️ Database connected but empty. You need to run the database setup scripts:
                {'\n\n'}1. Check DATABASE-VERIFICATION.md for setup instructions
                {'\n'}2. Run the SQL setup scripts in Supabase
                {'\n'}3. Add test data or real tournament data
              </Text>
            ) : (
              <Text style={styles.recommendationText}>
                ❌ Connection failed. Check your configuration:
                {'\n\n'}1. Verify .env.local has correct Supabase credentials
                {'\n'}2. Check your Supabase project is active
                {'\n'}3. Ensure your internet connection is working
                {'\n'}4. Verify RLS policies allow access to tables
              </Text>
            )}
          </View>
        </View>
      )}

      {loading && !status && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🔄 Testing database connection...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tableText: {
    fontSize: 14,
    flex: 1,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sampleText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    lineHeight: 20,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default DatabaseStatusScreen;