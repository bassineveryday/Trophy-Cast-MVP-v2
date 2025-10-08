export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Angler {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  club_member_id?: string;
  profile_photo_url?: string;
  created_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'upcoming' | 'active' | 'completed';
  created_at: string;
}

export interface TournamentResult {
  id: string;
  tournament_id: string;
  angler_id: string;
  total_weight: number;
  big_fish_weight?: number;
  placement: number;
  points: number;
  created_at: string;
  angler?: Angler;
  tournament?: Tournament;
}

export interface LeaderboardEntry {
  angler_id: string;
  angler: Angler;
  total_points: number;
  tournaments_fished: number;
  total_weight: number;
  best_finish: number;
}

export interface AnglerStats {
  angler: Angler;
  total_tournaments: number;
  total_points: number;
  total_weight: number;
  average_weight: number;
  best_finish: number;
  top_5_finishes: number;
  big_fish_weight?: number;
}
