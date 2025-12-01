export interface Movie {
  id: number;
  title?: string;
  name?: string; // For TV shows
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  genre_ids?: number[];
  media_type?: 'movie' | 'tv';
  original_language?: string;
  popularity?: number;
  vote_count?: number;
  video?: boolean;
  adult?: boolean;
}

export interface MovieDetails extends Movie {
  runtime?: number;
  genres: { id: number; name: string }[];
  tagline?: string;
  status: string;
  homepage?: string | null;
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos?: {
    results: VideoResult[];
  };
  similar?: {
    results: Movie[];
  };
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface VideoResult {
  key: string;
  site: string;
  type: string;
}

export interface AdultVideo {
  id: string;
  title: string;
  url: string;
  embed?: string;
  default_thumb: { src: string };
  length_min: string;
  views: number;
  rate: string;
  keywords: string;
}

export enum PlaybackQuality {
  Q360P = '360p',
  Q480P = '480p',
  Q720P = '720p',
  Q1080P = '1080p',
}

export interface StreamSource {
  quality: PlaybackQuality;
  url: string;
  type: 'mp4' | 'm3u8';
}

export interface ActorDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

export interface ActorCredits {
  cast: Movie[];
  crew: Movie[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

// Authentication Types
export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  isBlocked: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}