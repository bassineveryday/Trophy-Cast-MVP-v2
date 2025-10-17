/**
 * Database Connection Test
 * 
 * This script tests the Supabase connection and verifies data availability
 * Run this to ensure the database is properly connected before using real data
 */

import { supabase } from '../lib/supabase';

export interface DatabaseStatus {
  isConnected: boolean;
  hasData: boolean;
  tableStatus: {
    tournament_events: number;
    aoy_standings: number; 
    tournament_members: number;
    profiles: number;
  };
  sampleData: {
    topAOYMember?: any;
    latestTournament?: any;
    memberCount: number;
  };
  errors: string[];
}

export const testDatabaseConnection = async (): Promise<DatabaseStatus> => {
  const status: DatabaseStatus = {
    isConnected: false,
    hasData: false,
    tableStatus: {
      tournament_events: 0,
      aoy_standings: 0,
      tournament_members: 0,
      profiles: 0
    },
    sampleData: {
      memberCount: 0
    },
    errors: []
  };

  try {
    // Test basic connection
    console.log('🔍 Testing Supabase connection...');
    
    // Test each table and count records
  const tables = ['events_public', 'aoy_standings', 'tournament_members', 'profiles'];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          status.errors.push(`Error accessing ${table}: ${error.message}`);
          console.error(`❌ Error accessing ${table}:`, error);
        } else {
          status.tableStatus[table as keyof typeof status.tableStatus] = count || 0;
          console.log(`✅ ${table}: ${count || 0} records`);
        }
      } catch (err) {
        status.errors.push(`Exception accessing ${table}: ${err}`);
        console.error(`❌ Exception accessing ${table}:`, err);
      }
    }

    // If we got here without major errors, connection is working
    status.isConnected = status.errors.length === 0 || status.errors.every(e => !e.includes('network') && !e.includes('connection'));

    // Test sample data retrieval
    if (status.isConnected) {
      try {
        // Get top AOY member
        const { data: aoyData } = await supabase
          .from('aoy_standings')
          .select('member_id, member_name, aoy_rank, total_aoy_points')
          .order('aoy_rank', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (aoyData) {
          status.sampleData.topAOYMember = aoyData;
          console.log('🏆 Top AOY Member:', aoyData.member_name);
        }

        // Get latest tournament  
        const { data: tournamentData } = await supabase
          .from('tournament_events')
          .select('event_id, tournament_name, event_date, lake')
          .order('event_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (tournamentData) {
          status.sampleData.latestTournament = tournamentData;
          console.log('🎣 Latest Tournament:', tournamentData.tournament_name);
        }

        // Calculate total data availability
        const totalRecords = Object.values(status.tableStatus).reduce((sum, count) => sum + count, 0);
        status.hasData = totalRecords > 0;
        status.sampleData.memberCount = status.tableStatus.tournament_members;

        console.log(`📊 Total records across all tables: ${totalRecords}`);
        
      } catch (err) {
        status.errors.push(`Error fetching sample data: ${err}`);
        console.error('❌ Error fetching sample data:', err);
      }
    }

    // Final status
    if (status.isConnected && status.hasData) {
      console.log('🎉 Database connection successful with data available!');
    } else if (status.isConnected && !status.hasData) {
      console.log('⚠️ Database connected but no data found. You may need to run the setup scripts.');
    } else {
      console.log('❌ Database connection failed. Check your .env.local configuration.');
    }

  } catch (error) {
    status.errors.push(`Connection test failed: ${error}`);
    console.error('❌ Database connection test failed:', error);
  }

  return status;
};

// Utility function to format the status for display
export const formatDatabaseStatus = (status: DatabaseStatus): string => {
  let report = '📊 Database Connection Report\n';
  report += '================================\n\n';

  // Connection status
  report += `🔌 Connection: ${status.isConnected ? '✅ Connected' : '❌ Failed'}\n`;
  report += `📁 Data Available: ${status.hasData ? '✅ Yes' : '❌ No'}\n\n`;

  // Table status
  report += '📋 Table Status:\n';
  Object.entries(status.tableStatus).forEach(([table, count]) => {
    const icon = count > 0 ? '✅' : '❌';
    report += `   ${icon} ${table}: ${count} records\n`;
  });

  // Sample data
  if (status.sampleData.topAOYMember) {
    report += `\n🏆 Top AOY: ${status.sampleData.topAOYMember.member_name} (Rank ${status.sampleData.topAOYMember.aoy_rank})\n`;
  }
  
  if (status.sampleData.latestTournament) {
    report += `🎣 Latest Tournament: ${status.sampleData.latestTournament.tournament_name}\n`;
  }

  // Errors
  if (status.errors.length > 0) {
    report += '\n❌ Errors:\n';
    status.errors.forEach(error => {
      report += `   • ${error}\n`;
    });
  }

  return report;
};

// For console testing - run this function directly
export const runConnectionTest = async () => {
  console.log('🚀 Starting database connection test...\n');
  
  const status = await testDatabaseConnection();
  const report = formatDatabaseStatus(status);
  
  console.log('\n' + report);
  
  return status;
};

// Export default for easy imports
export default { 
  testDatabaseConnection, 
  formatDatabaseStatus, 
  runConnectionTest 
};