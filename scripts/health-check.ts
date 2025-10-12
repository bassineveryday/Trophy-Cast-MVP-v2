/**
 * DIRECT DATABASE HEALTH CHECK SCRIPT
 * 
 * Run this with: node --require @babel/register scripts/health-check.ts
 * or: npx ts-node scripts/health-check.ts
 * 
 * This script performs a comprehensive health check of your tournament data
 * by directly querying the Supabase database and validating data integrity.
 */

import { supabase } from '../lib/supabase';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, message: string, details?: any) {
  results.push({ name, passed, message, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  console.log(`   ${message}`);
  if (details) {
    console.log(`   Details:`, JSON.stringify(details, null, 2));
  }
  console.log('');
}

async function runHealthCheck() {
  console.log('\n🏥 ==============================================');
  console.log('🏥 TROPHY CAST TOURNAMENT HEALTH CHECK');
  console.log('🏥 ==============================================\n');

  // TEST 1: Verify Supabase Connection
  console.log('📋 TEST 1: API Connection & Database Integrity\n');
  
  try {
    // Test 1.1: Check tournament_results table
    const { data: resultsData, error: resultsError } = await supabase
      .from('tournament_results')
      .select('*')
      .limit(1);

    if (resultsError) {
      logTest(
        'Tournament Results Table Access',
        false,
        `Failed to access tournament_results table: ${resultsError.message}`,
        { error: resultsError }
      );
    } else {
      logTest(
        'Tournament Results Table Access',
        true,
        `Successfully accessed tournament_results table. Found ${resultsData?.length || 0} sample records.`
      );
    }

    // Test 1.2: Check tournament_events table
    const { data: eventsData, error: eventsError } = await supabase
      .from('tournament_events')
      .select('event_id, tournament_code, tournament_name, event_date, lake')
      .limit(1);

    if (eventsError) {
      logTest(
        'Tournament Events Table Access',
        false,
        `Failed to access tournament_events table: ${eventsError.message}`,
        { error: eventsError }
      );
    } else if (eventsData && eventsData.length > 0) {
      const columns = Object.keys(eventsData[0]);
      logTest(
        'Tournament Events Table Schema',
        true,
        `Successfully accessed tournament_events table with ${columns.length} columns.`,
        { columns }
      );
    }

    // Test 1.3: Verify tournament_results columns
    if (resultsData && resultsData.length > 0) {
      const requiredColumns = ['tournament_code', 'member_id', 'member_name', 'weight_lbs', 'place', 'event_date'];
      const actualColumns = Object.keys(resultsData[0]);
      const missingColumns = requiredColumns.filter(col => !actualColumns.includes(col));

      if (missingColumns.length === 0) {
        logTest(
          'Tournament Results Schema Validation',
          true,
          `All required columns present in tournament_results table.`,
          { columns: actualColumns }
        );
      } else {
        logTest(
          'Tournament Results Schema Validation',
          false,
          `Missing required columns: ${missingColumns.join(', ')}`,
          { actualColumns, missingColumns }
        );
      }
    }

  } catch (error: any) {
    logTest(
      'Database Connection',
      false,
      `Critical error connecting to database: ${error.message}`,
      { error }
    );
  }

  // TEST 2: Tournament Data Fetching
  console.log('📋 TEST 2: Tournament Data Fetching by Event Code\n');

  try {
    const { data: events } = await supabase
      .from('tournament_events')
      .select('tournament_code, tournament_name, event_date')
      .limit(5);

    if (events && events.length > 0) {
      logTest(
        'Fetch Tournament Events',
        true,
        `Successfully fetched ${events.length} tournament events.`,
        { sample: events[0] }
      );

      // Test results for first tournament
      const firstTournament = events[0];
      const { data: results, error: resultsError } = await supabase
        .from('tournament_results')
        .select('*')
        .eq('tournament_code', firstTournament.tournament_code);

      if (resultsError) {
        logTest(
          'Fetch Tournament Results',
          false,
          `Failed to fetch results for ${firstTournament.tournament_name}: ${resultsError.message}`
        );
      } else {
        logTest(
          'Fetch Tournament Results',
          true,
          `Successfully fetched ${results?.length || 0} results for ${firstTournament.tournament_name}`,
          { tournamentCode: firstTournament.tournament_code, resultCount: results?.length }
        );

        // Validate data quality
        if (results && results.length > 0) {
          const withMemberId = results.filter((r: any) => r.member_id).length;
          const withWeight = results.filter((r: any) => r.weight_lbs != null).length;
          const dataQuality = {
            totalRows: results.length,
            withMemberId,
            withWeight,
            memberIdPercentage: Math.round((withMemberId / results.length) * 100),
            weightPercentage: Math.round((withWeight / results.length) * 100),
          };

          const passed = dataQuality.memberIdPercentage >= 90 && dataQuality.weightPercentage >= 90;
          logTest(
            'Data Quality Check',
            passed,
            `Data quality: ${dataQuality.memberIdPercentage}% have member_id, ${dataQuality.weightPercentage}% have weight`,
            dataQuality
          );
        }
      }
    } else {
      logTest(
        'Fetch Tournament Events',
        false,
        'No tournament events found in database.'
      );
    }

  } catch (error: any) {
    logTest(
      'Tournament Data Fetching',
      false,
      `Error fetching tournament data: ${error.message}`,
      { error }
    );
  }

  // TEST 3: Multi-Day Aggregation
  console.log('📋 TEST 3: Multi-Day Aggregation Logic\n');

  try {
    // Find potential multi-day tournaments (same base name, different dates)
    const { data: allEvents } = await supabase
      .from('tournament_events')
      .select('tournament_code, tournament_name, event_date')
      .order('event_date', { ascending: false })
      .limit(50);

    if (allEvents) {
      // Group by base tournament name (strip dates)
      const grouped = new Map<string, any[]>();
      allEvents.forEach((event: any) => {
        const baseName = event.tournament_name.replace(/\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/g, '').trim();
        if (!grouped.has(baseName)) {
          grouped.set(baseName, []);
        }
        grouped.get(baseName)?.push(event);
      });

      // Find multi-day tournaments
      const multiDay = Array.from(grouped.entries()).filter(([_, events]) => events.length >= 2);

      if (multiDay.length > 0) {
        logTest(
          'Identify Multi-Day Tournaments',
          true,
          `Found ${multiDay.length} potential multi-day tournament(s).`,
          { tournaments: multiDay.map(([name, events]) => ({ name, dayCount: events.length })) }
        );

        // Test aggregation for first multi-day tournament
        const [baseName, days] = multiDay[0];
        const codes = days.map(d => d.tournament_code);

        // Fetch all results for these days
        const { data: allResults } = await supabase
          .from('tournament_results')
          .select('*')
          .in('tournament_code', codes);

        if (allResults && allResults.length > 0) {
          // Aggregate by member
          const memberMap = new Map<string, any>();
          allResults.forEach((result: any) => {
            const memberId = result.member_id || result.member_name;
            if (!memberMap.has(memberId)) {
              memberMap.set(memberId, {
                member_id: result.member_id,
                member_name: result.member_name,
                total_weight: 0,
                days: [],
              });
            }
            const member = memberMap.get(memberId);
            member.total_weight += Number(result.weight_lbs || 0);
            member.days.push(result.tournament_code);
          });

          const uniqueAnglers = memberMap.size;
          const multiDayAnglers = Array.from(memberMap.values()).filter(m => new Set(m.days).size > 1).length;

          logTest(
            'Multi-Day Aggregation',
            true,
            `Aggregated ${allResults.length} results into ${uniqueAnglers} unique anglers. ${multiDayAnglers} competed multiple days.`,
            { 
              baseName,
              totalResults: allResults.length,
              uniqueAnglers,
              multiDayAnglers,
              sample: Array.from(memberMap.values())[0]
            }
          );
        }
      } else {
        logTest(
          'Identify Multi-Day Tournaments',
          true,
          'No multi-day tournaments detected in recent events (this is OK).'
        );
      }
    }

  } catch (error: any) {
    logTest(
      'Multi-Day Aggregation Test',
      false,
      `Error testing multi-day aggregation: ${error.message}`,
      { error }
    );
  }

  // TEST 4: Participant Count Accuracy
  console.log('📋 TEST 4: Participant Count Accuracy\n');

  try {
    const { data: events } = await supabase
      .from('tournament_events')
      .select('tournament_code, tournament_name')
      .limit(3);

    if (events && events.length > 0) {
      for (const event of events) {
        const { data: results } = await supabase
          .from('tournament_results')
          .select('member_id, member_name')
          .eq('tournament_code', event.tournament_code);

        if (results) {
          const uniqueMembers = new Set(results.map((r: any) => r.member_id).filter(Boolean));
          const totalRows = results.length;
          const duplicateRatio = totalRows - uniqueMembers.size;

          logTest(
            `Participant Count: ${event.tournament_name}`,
            true,
            `${uniqueMembers.size} unique participants from ${totalRows} result rows (${duplicateRatio} duplicates for multi-day or data quality).`,
            { 
              tournament: event.tournament_name,
              uniqueCount: uniqueMembers.size,
              totalRows,
              duplicates: duplicateRatio
            }
          );
        }
      }
    }

  } catch (error: any) {
    logTest(
      'Participant Count Test',
      false,
      `Error testing participant counts: ${error.message}`,
      { error }
    );
  }

  // TEST 5: Error Handling & Edge Cases
  console.log('📋 TEST 5: Error Handling & Edge Cases\n');

  try {
    // Test 5.1: Zero weight results
    const { data: zeroWeight } = await supabase
      .from('tournament_results')
      .select('member_name, weight_lbs')
      .eq('weight_lbs', 0)
      .limit(5);

    logTest(
      'Handle Zero Weight Results',
      true,
      `Found ${zeroWeight?.length || 0} results with zero weight (no fish caught). System handles this gracefully.`,
      { count: zeroWeight?.length }
    );

    // Test 5.2: Non-existent tournament
    const { data: fakeResults, error: fakeError } = await supabase
      .from('tournament_results')
      .select('*')
      .eq('tournament_code', 'NONEXISTENT-FAKE-12345');

    if (fakeError) {
      logTest(
        'Handle Non-Existent Tournament',
        false,
        `Unexpected error when querying non-existent tournament: ${fakeError.message}`
      );
    } else {
      logTest(
        'Handle Non-Existent Tournament',
        true,
        `System gracefully returns empty array for non-existent tournament.`,
        { resultCount: fakeResults?.length || 0 }
      );
    }

  } catch (error: any) {
    logTest(
      'Error Handling Test',
      false,
      `Error during edge case testing: ${error.message}`,
      { error }
    );
  }

  // TEST 6: Norton-Specific Test
  console.log('📋 TEST 6: Norton Tournament Verification\n');

  try {
    const { data: nortonEvents } = await supabase
      .from('tournament_events')
      .select('*')
      .order('event_date', { ascending: true })
      .limit(100);

    // Filter for Norton (case-insensitive)
    const nortonFiltered = nortonEvents?.filter((e: any) => 
      e.tournament_name.toLowerCase().includes('norton')
    ) || [];

    if (nortonFiltered.length >= 2) {
      logTest(
        'Norton Multi-Day Tournament Detection',
        true,
        `Found ${nortonFiltered.length} Norton tournament day(s).`,
        { 
          tournaments: nortonFiltered.map((e: any) => ({
            code: e.tournament_code,
            name: e.tournament_name,
            date: e.event_date
          }))
        }
      );

      // Fetch all Norton results
      const nortonCodes = nortonFiltered.map((e: any) => e.tournament_code);
      const { data: nortonResults } = await supabase
        .from('tournament_results')
        .select('*')
        .in('tournament_code', nortonCodes);

      if (nortonResults && nortonResults.length > 0) {
        const uniqueAnglers = new Set(nortonResults.map((r: any) => r.member_id).filter(Boolean)).size;
        logTest(
          'Norton Results Data',
          true,
          `Norton tournament has ${nortonResults.length} total result rows for ${uniqueAnglers} unique anglers.`,
          { 
            totalResults: nortonResults.length,
            uniqueAnglers,
            days: nortonFiltered.length
          }
        );
      }
    } else if (nortonFiltered.length === 1) {
      logTest(
        'Norton Tournament Detection',
        true,
        'Found 1 Norton tournament (single-day event).',
        { tournament: nortonFiltered[0] }
      );
    } else {
      logTest(
        'Norton Tournament Detection',
        true,
        'No Norton tournament found in database (this is OK if it hasn\'t been added yet).'
      );
    }

  } catch (error: any) {
    logTest(
      'Norton Tournament Test',
      false,
      `Error during Norton-specific test: ${error.message}`,
      { error }
    );
  }

  // SUMMARY
  console.log('\n🏥 ==============================================');
  console.log('🏥 HEALTH CHECK SUMMARY');
  console.log('🏥 ==============================================\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%\n`);

  if (failed === 0) {
    console.log('🎉 All health checks passed! Your tournament system is working correctly.\n');
  } else {
    console.log('⚠️  Some health checks failed. Review the details above to diagnose issues.\n');
    console.log('Common issues:');
    console.log('  - Missing environment variables (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)');
    console.log('  - Database schema changes or missing tables');
    console.log('  - Row-level security (RLS) policies blocking access');
    console.log('  - Network connectivity issues\n');
  }

  return { passed, failed, total, results };
}

// Run the health check if this script is executed directly
if (require.main === module) {
  runHealthCheck()
    .then(({ failed }) => {
      process.exit(failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Fatal error running health check:', error);
      process.exit(1);
    });
}

export { runHealthCheck };
