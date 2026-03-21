
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MusicTrack {
  file: File;
  url: string; // Blob URL for playback
  name: string;
  coverUrl?: string; // Data URI or Blob URL for the album art
}

export interface Zone {
  id: string;
  name: string;
  description?: string;
  center: Coordinates;
  radius: number; // in meters
  music?: MusicTrack; // Renamed from entryMusic/exitMusic to just music (ambient)
}

export enum AppState {
  MAP_VIEW,
  ADDING_ZONE,
  SETTINGS,
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
}
