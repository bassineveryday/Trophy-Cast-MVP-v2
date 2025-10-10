import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

export async function loadTournamentRules(): Promise<string> {
  try {
    // Load rules from a string instead of importing the file directly
    return `# Denver Bassmasters Tournament Logic

## Overview
This document outlines the official tournament rules, scoring system, and prize structure for Denver Bassmasters (DBM) as implemented in the Trophy Cast app.

## 🏆 Tournament Structure

### Individual Tournament Format
- **Duration**: Single day events (occasional two-day tournaments)
- **Scoring**: Based on total weight of fish caught
- **Species**: Bass only (largemouth, smallmouth, spotted bass)
- **Participants**: Club members with valid DBM member codes

### Big Bass Competition
- One big bass winner per tournament day
- For two-day tournaments: One big bass winner per day
- Weight recorded in \`big_bass_lbs\` field
- Winner receives \`big_bass_payout\` bonus

### Boat Team Competition
- Teams consist of one boater + one co-angler
- Combined total weight of both anglers
- Winning boat team splits \`boat_weight_payout\`

## 🏅 AOY (Angler of the Year) Competition

### Point System
- Points awarded based on tournament placement
- Formula: \`101 - placement\`
  - 1st place = 100 points
  - 2nd place = 99 points
  - 3rd place = 98 points
  - etc.

### AOY Calculation Rules
- Only best 4 tournaments count toward AOY total
- Highest point total wins AOY title
- Tiebreaker: Most first-place finishes`;
  } catch (error) {
    console.error('Error loading rules:', error);
    return 'Error loading tournament rules. Please try again later.';
  }
}