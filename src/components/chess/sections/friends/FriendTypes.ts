import API from '@/config/api';
export const FRIENDS_URL = API.friends;
export const SITE_URL = window.location.origin;

export interface Friend {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  city: string;
  status: 'online' | 'offline';
  user_code: string;
}

export interface PendingRequest {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  city: string;
  user_code: string;
}

export interface FriendGame {
  id: number;
  opponent_name: string;
  opponent_type: string;
  opponent_rating: number | null;
  result: 'win' | 'loss' | 'draw';
  user_color: string;
  time_control: string;
  difficulty: string | null;
  moves_count: number;
  rating_before: number;
  rating_after: number;
  rating_change: number;
  duration_seconds: number | null;
  end_reason: string;
  created_at: string;
}

export interface FriendProfile {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  city: string;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  last_online: string | null;
}

export const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return name.substring(0, 2).toUpperCase();
};