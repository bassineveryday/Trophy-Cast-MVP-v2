// Club types and interfaces

export interface ClubOfficer {
  id: string;
  member_id: string;
  role: OfficerRole;
  start_date: string;
  end_date?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export enum OfficerRole {
  President = 'President',
  VicePresident = 'Vice President',
  Secretary = 'Secretary',
  Treasurer = 'Treasurer',
  TournamentDirector = 'Tournament Director'
}

export interface ClubEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  event_type: EventType;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export enum EventType {
  Tournament = 'Tournament',
  Meeting = 'Meeting',
  Social = 'Social',
  Other = 'Other'
}

// Current officers (to be moved to database)
export const currentOfficers: Partial<ClubOfficer>[] = [
  {
    role: OfficerRole.President,
    email: 'president@denverbassmasters.com'
  },
  {
    role: OfficerRole.VicePresident,
    email: 'vp@denverbassmasters.com'
  },
  {
    role: OfficerRole.Secretary,
    email: 'secretary@denverbassmasters.com'
  },
  {
    role: OfficerRole.Treasurer,
    email: 'treasurer@denverbassmasters.com'
  },
  {
    role: OfficerRole.TournamentDirector,
    email: 'tournaments@denverbassmasters.com'
  }
];