import { supabase } from './supabase';

export async function testConnection() {
  try {
    // Test 1: Basic Connection
    console.log('🔵 Testing Supabase connection...');
      // Try to fetch Justin's record as a connection test
      const { data, error: pingError } = await supabase
        .from('aoy_standings_rows')
        .select('*')
        .eq('member_id', 'DBM045')
        .single();    if (pingError) {
      console.error('❌ Connection Error:', pingError.message);
      console.log('Details:', {
        code: pingError.code,
        hint: pingError.hint,
        details: pingError.details
      });
      return false;
    }

    if (!data) {
      console.error('❌ No data returned');
      return false;
    }

    console.log('✅ Connection successful! Found test record:', {
      member: data.member_name,
      rank: data.aoy_rank,
      points: data.total_aoy_points
    });
    return true;

  } catch (err) {
    console.error('❌ Unexpected Error:', err);
    return false;
  }
}