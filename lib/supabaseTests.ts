import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    console.log('🔵 Testing Supabase connection...');
    
    // First test: Just check if we can connect
    const { data: rpcData, error: rpcError } = await supabase.rpc('version');
    console.log('📡 Connection test:', rpcError ? '❌ Failed' : '✅ Success');
    if (rpcError) console.error('RPC Error:', rpcError);

    // Second test: Try to count rows in aoy_standings
    const { count, error: countError } = await supabase
      .from('aoy_standings_rows')
      .select('*', { count: 'exact', head: true });
    
    console.log('🔢 Row count test:', countError ? '❌ Failed' : '✅ Success');
    console.log('Total rows:', count);
    if (countError) console.error('Count Error:', countError);

    // Third test: Check RLS policies
    const { data: policiesData, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'aoy_standings_rows');
    
    console.log('🔒 RLS policy test:', policiesError ? '❌ Failed' : '✅ Success');
    if (policiesError) console.error('Policies Error:', policiesError);
    else console.log('Active policies:', policiesData?.length || 0);

    return !rpcError && !countError && !policiesError;
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
}