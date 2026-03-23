
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MusicTrack {
  id: string; // Added ID for playlist management
  file: File;
  url: string; // Blob URL for playback
  name: string;
  coverUrl?: string; // Data URI or Blob URL for the album art
}

export type ZoneShape = 'circle' | 'square' | 'rectangle' | 'triangle' | 'custom';

export interface Zone {
  id: string;
  name: string;
  description?: string;
  center: Coordinates;
  radius: number; // in meters (used for circle, or as a base for others)
  shape: ZoneShape;
  points?: Coordinates[]; // For custom polygons, triangles, etc.
  bounds?: [Coordinates, Coordinates]; // For rectangle.
  music?: MusicTrack; // Renamed from entryMusic/exitMusic to just music (ambient)
}

export enum AppState {
  MAP_VIEW,
  ADDING_ZONE,
  SETTINGS,
  MOTION_PLAYLIST, // New state for managing motion music
}

export interface GeminiResponse {
  suggestedName: string;
  description: string;
}

export interface PlayerState {
  isPlaying: boolean;
  trackName?: string;
  zoneName?: string;
  coverUrl?: string;
  isMotionMusic?: boolean; // Flag to indicate if current music is motion music
}

export type Language = 'es' | 'en' | 'pt';

export interface AppSettings {
  primaryColor: string;
  language: Language;
  userImage?: string; // Data URI
  userName: string;
  selectedDeviceId: string;
  volume: number; // 0 to 1
  mapTheme: 'dark' | 'light';
  uiTheme: 'dark' | 'light';
  uiStyle: 'classic' | 'pixel' | 'liquid-glass';
  keepScreenOn: boolean;
  enableBackgroundMode: boolean;
  enableFadeOut: boolean;
  fadeOutDuration: number; // in seconds
  enableFadeIn: boolean;
  fadeInDuration: number; // in seconds
  enableCrossfade: boolean;
  crossfadeDuration: number; // in seconds
  offlineMode: boolean;
  enableMotionMusic: boolean; // Toggle for "Music in Motion"
  motionPlaylistVersion: number; // Increment to trigger AudioEngine reload
  motionShuffle: boolean;
  motionRepeat: 'none' | 'all' | 'one';
}
