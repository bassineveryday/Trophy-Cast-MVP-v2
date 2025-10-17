// Centralized DB object names for UI-facing reads
// Using a stable view lets us change base table schema later without breaking the app
export const TABLE_TOURNAMENTS = 'events_public'; // previously: 'tournament_events'
