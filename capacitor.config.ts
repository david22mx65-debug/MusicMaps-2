import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.musicmaps.app',
  appName: 'MusicMaps',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
