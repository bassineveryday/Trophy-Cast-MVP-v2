/**
 * BROWSER DIAGNOSTIC SCRIPT
 * 
 * Copy/paste this entire file into your browser console (F12) while the app is running
 * This will check your Supabase connection and data directly from the browser
 */

// Import supabase client from your app (adjust path if needed)
import { supabase } from '../lib/supabase';

async function diagnosticCheck() {
  console.group('🔍 Supabase Diagnostic Check');
  
  try {
    // 1. Check auth state
    const { data: { user } } = await supabase.auth.getUser();
    console.log('✅ Auth User:', user?.email, user?.id);
    
    // 2. Check profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile Error:', profileError);
    } else {
      console.log('✅ Profile:', profile);
    }
    
    const memberCode = profile?.member_code;
    console.log('Member Code:', memberCode);
    
    if (!memberCode) {
      console.error('❌ NO MEMBER CODE - Profile is not linked to a member!');
      console.groupEnd();
      return;
    }
    
    // 3. Check tournament results
    const { data: results, error: resultsError } = await supabase
      .from('tournament_results')
      .select('*')
      .eq('member_id', memberCode);
    
    if (resultsError) {
      console.error('❌ Tournament Results Error:', resultsError);
    } else {
      console.log('✅ Tournament Results Count:', results?.length);
      console.log('Results:', results);
    }
    
    // 4. Check AOY standings
    const { data: aoy, error: aoyError } = await supabase
      .from('aoy_standings')
      .select('*')
      .eq('member_id', memberCode);
    
    if (aoyError) {
      console.error('❌ AOY Error:', aoyError);
    } else {
      console.log('✅ AOY Standings:', aoy);
    }
    
    // 5. Check last tournament (exact dashboard query)
    const { data: lastTournament, error: lastError } = await supabase
      .from('tournament_results')
      .select('event_date, lake, tournament_name, place, weight_lbs, aoy_points, payout')
      .eq('member_id', memberCode)
      .order('event_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (lastError) {
      console.error('❌ Last Tournament Error:', lastError);
    } else {
      console.log('✅ Last Tournament:', lastTournament);
    }
    
    // 6. Test RLS policies
    console.log('\n📋 Testing RLS Policies...');
    const { data: testRead, error: testError } = await supabase
      .from('tournament_results')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ RLS may be blocking reads:', testError);
    } else {
      console.log('✅ Can read tournament_results');
    }
    
  } catch (err) {
    console.error('❌ Diagnostic failed:', err);
  }
  
  console.groupEnd();
}

// Run the diagnostic
diagnosticCheck();

// Also expose it globally so you can run it manually
window.runDiagnostic = diagnosticCheck;
console.log('💡 Diagnostic script loaded. Run window.runDiagnostic() to check again.');
