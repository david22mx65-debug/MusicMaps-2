
import React, { useEffect, useRef, useState } from 'react';
import { Zone, Coordinates, PlayerState } from '../types';
import { calculateDistance } from '../constants';

interface AudioEngineProps {
  userLocation: Coordinates | null;
  zones: Zone[];
  isTracking: boolean;
  onStateChange: (state: PlayerState) => void;
  isPaused: boolean;
  onResetPause: () => void;
  volume: number;
  isUnlocked: boolean;
  enableFadeOut: boolean;
  fadeOutDuration: number;
  enableFadeIn: boolean;
  fadeInDuration: number;
  enableCrossfade: boolean;
  crossfadeDuration: number;
}

const AudioEngine: React.FC<AudioEngineProps> = ({ 
  userLocation, 
  zones, 
  isTracking, 
  onStateChange,
  isPaused,
  onResetPause,
  volume,
  isUnlocked,
  enableFadeOut,
  fadeOutDuration,
  enableFadeIn,
  fadeInDuration,
  enableCrossfade,
  crossfadeDuration
}) => {
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const audio1Ref = useRef<HTMLAudioElement | null>(null);
  const audio2Ref = useRef<HTMLAudioElement | null>(null);
  const activeAudioIndex = useRef<1 | 2>(1);
  const fadeIntervalRef = useRef<number | null>(null);
  const crossfadeMonitorRef = useRef<number | null>(null);
  const isCrossfading = useRef(false);
  
  const currentMeta = useRef<{
    trackName?: string;
    zoneName?: string;
    coverUrl?: string;
  }>({});

  const getActiveAudio = () => activeAudioIndex.current === 1 ? audio1Ref.current : audio2Ref.current;
  const getInactiveAudio = () => activeAudioIndex.current === 1 ? audio2Ref.current : audio1Ref.current;
  
  useEffect(() => {
    audio1Ref.current = new Audio();
    audio1Ref.current.volume = 0;
    audio1Ref.current.loop = false; // Manejamos el loop manualmente para el crossfade

    audio2Ref.current = new Audio();
    audio2Ref.current.volume = 0;
    audio2Ref.current.loop = false;

    return () => {
      audio1Ref.current?.pause();
      audio2Ref.current?.pause();
      clearFade();
      stopCrossfadeMonitor();
    };
  }, []);

  useEffect(() => {
    const primary = getActiveAudio();
    if (primary && !fadeIntervalRef.current && !isCrossfading.current) {
      primary.volume = volume;
    }
  }, [volume]);

  const clearFade = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const stopCrossfadeMonitor = () => {
    if (crossfadeMonitorRef.current) {
      clearInterval(crossfadeMonitorRef.current);
      crossfadeMonitorRef.current = null;
    }
  };

  const startCrossfadeMonitor = () => {
    stopCrossfadeMonitor();
    crossfadeMonitorRef.current = window.setInterval(() => {
      const primary = getActiveAudio();
      const secondary = getInactiveAudio();
      
      if (!primary || !secondary || !enableCrossfade || isPaused || isCrossfading.current) return;

      // Si llegamos cerca del final del audio
      if (primary.duration && primary.currentTime > primary.duration - crossfadeDuration) {
        performCrossfade();
      }
    }, 500);
  };

  const performCrossfade = () => {
    const primary = getActiveAudio();
    const secondary = getInactiveAudio();
    if (!primary || !secondary) return;

    isCrossfading.current = true;
    secondary.src = primary.src;
    secondary.currentTime = 0;
    secondary.volume = 0;
    secondary.play().catch(() => {});

    const steps = 30;
    const stepTime = (crossfadeDuration * 1000) / steps;
    const volumeStep = volume / steps;

    let currentStep = 0;
    const interval = window.setInterval(() => {
      currentStep++;
      if (primary) primary.volume = Math.max(0, primary.volume - volumeStep);
      if (secondary) secondary.volume = Math.min(volume, secondary.volume + volumeStep);

      if (currentStep >= steps) {
        clearInterval(interval);
        if (primary) {
          primary.pause();
          primary.volume = 0;
        }
        activeAudioIndex.current = activeAudioIndex.current === 1 ? 2 : 1;
        isCrossfading.current = false;
      }
    }, stepTime);
  };

  const startWithFadeIn = (src: string) => {
    const audio = getActiveAudio();
    if (!audio) return;
    
    clearFade();
    audio.src = src;
    audio.currentTime = 0;
    
    if (!enableFadeIn || fadeInDuration <= 0) {
      audio.volume = volume;
      audio.play().catch(() => {});
      startCrossfadeMonitor();
      return;
    }

    audio.volume = 0;
    audio.play().catch(() => {});

    const steps = 30;
    const stepTime = (fadeInDuration * 1000) / steps;
    const volumeStep = volume / steps;

    fadeIntervalRef.current = window.setInterval(() => {
      if (audio) {
        const nextVolume = Math.min(volume, audio.volume + volumeStep);
        audio.volume = nextVolume;

        if (nextVolume >= volume) {
          audio.volume = volume;
          clearFade();
          startCrossfadeMonitor();
        }
      }
    }, stepTime);
  };

  const stopWithFadeOut = () => {
    const audio = getActiveAudio();
    if (!audio || audio.paused) return;

    clearFade();
    stopCrossfadeMonitor();

    if (!enableFadeOut || fadeOutDuration <= 0) {
      audio.pause();
      audio.src = "";
      return;
    }

    const startVolume = audio.volume;
    const steps = 30;
    const stepTime = (fadeOutDuration * 1000) / steps;
    const volumeStep = startVolume / steps;

    fadeIntervalRef.current = window.setInterval(() => {
      if (audio) {
        const nextVolume = Math.max(0, audio.volume - volumeStep);
        audio.volume = nextVolume;

        if (nextVolume <= 0) {
          audio.pause();
          audio.src = "";
          clearFade();
        }
      }
    }, stepTime);
  };

  useEffect(() => {
    const audio = getActiveAudio();
    if (!audio || !isUnlocked) return;

    if (!isTracking || !userLocation) {
      if (activeZoneId && !audio.paused) {
        stopWithFadeOut();
        onStateChange({ isPlaying: false, ...currentMeta.current });
      }
      return;
    }

    const currentZone = zones.find(zone => {
      const distance = calculateDistance(userLocation, zone.center);
      return distance <= zone.radius;
    });

    const activeZoneStillExists = activeZoneId ? zones.some(z => z.id === activeZoneId) : false;

    if (currentZone) {
      if (activeZoneId !== currentZone.id) {
        onResetPause();
        setActiveZoneId(currentZone.id);
        
        if (currentZone.music) {
          currentMeta.current = {
             trackName: currentZone.music.name,
             zoneName: currentZone.name,
             coverUrl: currentZone.music.coverUrl
          };
          
          startWithFadeIn(currentZone.music.url);
          onStateChange({ isPlaying: true, ...currentMeta.current });
        }
      } else {
        if (isPaused) {
          if (!audio.paused) audio.pause();
          onStateChange({ isPlaying: false, ...currentMeta.current });
        } else {
          if (audio.paused && audio.src) {
            audio.play().catch(() => {});
          }
          onStateChange({ isPlaying: true, ...currentMeta.current });
        }
      }
    } else {
      if (activeZoneId !== null) {
        stopWithFadeOut();
        currentMeta.current = {};
        onStateChange({ isPlaying: false });
        setActiveZoneId(null);
      }
    }

    if (activeZoneId && !activeZoneStillExists) {
        stopWithFadeOut();
        currentMeta.current = {};
        onStateChange({ isPlaying: false });
        setActiveZoneId(null);
    }

  }, [userLocation, zones, isTracking, activeZoneId, isPaused, isUnlocked, enableFadeOut, fadeOutDuration, enableFadeIn, fadeInDuration, volume, enableCrossfade, crossfadeDuration]);

  return <div className="hidden" aria-hidden="true" />;
};

export default AudioEngine;
