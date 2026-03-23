
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Zone, Coordinates, PlayerState, MusicTrack } from '../types';
import { calculateDistance, isPointInPolygon, isPointInRect } from '../constants';
import { audioStorage } from '../src/services/audioStorage';

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
  enableMotionMusic: boolean;
  motionPlaylistVersion: number;
  motionShuffle: boolean;
  motionRepeat: 'none' | 'all' | 'one';
}

export interface AudioEngineRef {
  unlock: () => void;
  testAudio: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

const AudioEngine = forwardRef<AudioEngineRef, AudioEngineProps>(({ 
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
  crossfadeDuration,
  enableMotionMusic,
  motionPlaylistVersion,
  motionShuffle,
  motionRepeat
}, ref) => {
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [motionPlaylist, setMotionPlaylist] = useState<MusicTrack[]>([]);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [currentMotionIndex, setCurrentMotionIndex] = useState(0);
  const [isMotionActive, setIsMotionActive] = useState(false);

  const audio1Ref = useRef<HTMLAudioElement | null>(null);
  const audio2Ref = useRef<HTMLAudioElement | null>(null);
  const activeAudioIndex = useRef<1 | 2>(1);
  const fadeIntervalRef = useRef<number | null>(null);
  const crossfadeMonitorRef = useRef<number | null>(null);
  const isCrossfading = useRef(false);

  useImperativeHandle(ref, () => ({
    unlock: () => {
      // Play and immediately pause to unlock audio on mobile browsers
      if (audio1Ref.current) {
        audio1Ref.current.play().then(() => audio1Ref.current?.pause()).catch(() => {});
      }
      if (audio2Ref.current) {
        audio2Ref.current.play().then(() => audio2Ref.current?.pause()).catch(() => {});
      }
      console.log("Audio elements unlocked via user gesture");
    },
    testAudio: () => {
      const audio = getActiveAudio();
      if (audio) {
        const originalSrc = audio.src;
        const originalVolume = audio.volume;
        // Simple beep using Data URL
        audio.src = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YV9vT18A";
        audio.volume = volume;
        audio.play().then(() => {
          setTimeout(() => {
            audio.pause();
            audio.src = originalSrc;
            audio.volume = originalVolume;
          }, 500);
        }).catch(e => console.error("Test audio failed:", e));
      }
    },
    nextTrack: () => {
      if (isMotionActive) {
        const nextIndex = getNextMotionIndex(currentMotionIndex);
        if (nextIndex !== -1) setCurrentMotionIndex(nextIndex);
      }
    },
    prevTrack: () => {
      if (isMotionActive) {
        const prevIndex = getPrevMotionIndex(currentMotionIndex);
        setCurrentMotionIndex(prevIndex);
      }
    }
  }));
  
  const [currentMeta, setCurrentMeta] = useState<{
    trackName?: string;
    zoneName?: string;
    coverUrl?: string;
    isMotionMusic?: boolean;
  }>({});

  const getActiveAudio = () => activeAudioIndex.current === 1 ? audio1Ref.current : audio2Ref.current;
  const getInactiveAudio = () => activeAudioIndex.current === 1 ? audio2Ref.current : audio1Ref.current;
  
  // Load Motion Playlist
  useEffect(() => {
    const loadMotionPlaylist = async () => {
      if (!enableMotionMusic) {
        setMotionPlaylist([]);
        return;
      }
      try {
        const storedTracks = await audioStorage.getAllMotionAudio();
        const tracks: MusicTrack[] = storedTracks.map(t => ({
          id: t.id,
          name: t.name,
          file: t.file as File,
          url: URL.createObjectURL(t.file),
          coverUrl: t.coverUrl
        }));
        setMotionPlaylist(tracks);
        
        // Initialize shuffled indices
        const indices = Array.from({ length: tracks.length }, (_, i) => i);
        if (motionShuffle) {
          for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
          }
        }
        setShuffledIndices(indices);
      } catch (err) {
        console.error("Error loading motion playlist in engine:", err);
      }
    };
    loadMotionPlaylist();

    return () => {
      motionPlaylist.forEach(t => URL.revokeObjectURL(t.url));
    };
  }, [enableMotionMusic, motionPlaylistVersion]);

  // Initialize audio elements once
  useEffect(() => {
    const a1 = new Audio();
    a1.volume = 0;
    a1.loop = false;
    a1.preload = 'auto';

    const a2 = new Audio();
    a2.volume = 0;
    a2.loop = false;
    a2.preload = 'auto';

    audio1Ref.current = a1;
    audio2Ref.current = a2;

    const handleEnded = () => {
      // We use a ref for the current state to avoid closure issues in the event listener
      // but since we want to trigger a state change in the component, we'll use a trick
      // or just rely on the fact that this listener is stable.
      // Actually, it's better to use a stable listener that checks the latest state.
    };

    return () => {
      a1.pause();
      a2.pause();
      a1.src = "";
      a2.src = "";
      clearFade();
      stopCrossfadeMonitor();
    };
  }, []);

  // Handle shuffle change
  useEffect(() => {
    if (motionPlaylist.length === 0) return;
    const indices = Array.from({ length: motionPlaylist.length }, (_, i) => i);
    if (motionShuffle) {
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      // Ensure current track is first in shuffled list if possible
      const currentInShuffled = indices.indexOf(currentMotionIndex);
      if (currentInShuffled !== -1) {
        [indices[0], indices[currentInShuffled]] = [indices[currentInShuffled], indices[0]];
      }
    }
    setShuffledIndices(indices);
  }, [motionShuffle, motionPlaylist.length]);

  const getNextMotionIndex = (currentIndex: number) => {
    if (motionPlaylist.length === 0) return 0;
    
    if (motionRepeat === 'one') return currentIndex;
    
    const currentPosInShuffled = shuffledIndices.indexOf(currentIndex);
    if (currentPosInShuffled === -1) return 0;
    
    const nextPos = currentPosInShuffled + 1;
    
    if (nextPos >= shuffledIndices.length) {
      if (motionRepeat === 'all') {
        return shuffledIndices[0];
      } else {
        return -1; // End of playlist
      }
    }
    
    return shuffledIndices[nextPos];
  };

  const getPrevMotionIndex = (currentIndex: number) => {
    if (motionPlaylist.length === 0) return 0;
    
    const currentPosInShuffled = shuffledIndices.indexOf(currentIndex);
    if (currentPosInShuffled === -1) return 0;
    
    const prevPos = currentPosInShuffled - 1;
    
    if (prevPos < 0) {
      if (motionRepeat === 'all') {
        return shuffledIndices[shuffledIndices.length - 1];
      } else {
        return 0;
      }
    }
    
    return shuffledIndices[prevPos];
  };

  // Handle ended event separately to keep it updated with latest state
  useEffect(() => {
    const handleEnded = () => {
      if (isMotionActive && motionPlaylist.length > 0) {
        const nextIndex = getNextMotionIndex(currentMotionIndex);
        if (nextIndex !== -1) {
          if (nextIndex === currentMotionIndex) {
            // Repeat one
            const audio = getActiveAudio();
            if (audio) {
              audio.currentTime = 0;
              audio.play().catch(() => {});
            }
          } else {
            setCurrentMotionIndex(nextIndex);
          }
        } else {
          // End of playlist
          stopWithFadeOut();
          onStateChange({ isPlaying: false });
        }
      }
    };

    const a1 = audio1Ref.current;
    const a2 = audio2Ref.current;

    if (a1) a1.onended = handleEnded;
    if (a2) a2.onended = handleEnded;

    return () => {
      if (a1) a1.onended = null;
      if (a2) a2.onended = null;
    };
  }, [isMotionActive, motionPlaylist.length, currentMotionIndex]);

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

      if (primary.duration && primary.currentTime > primary.duration - crossfadeDuration) {
        if (isMotionActive && motionPlaylist.length > 0) {
          // For motion music, we crossfade to the next track
          const nextIndex = getNextMotionIndex(currentMotionIndex);
          if (nextIndex !== -1) {
            if (nextIndex === currentMotionIndex) {
              // Loop one
              performCrossfade(primary.src);
            } else {
              const nextTrack = motionPlaylist[nextIndex];
              if (nextTrack) {
                performCrossfade(nextTrack.url);
                setCurrentMotionIndex(nextIndex);
              }
            }
          }
        } else {
          // For zone music, we loop the same track
          performCrossfade(primary.src);
        }
      }
    }, 500);
  };

  const performCrossfade = (nextSrc: string) => {
    const primary = getActiveAudio();
    const secondary = getInactiveAudio();
    if (!primary || !secondary) return;

    isCrossfading.current = true;
    secondary.src = nextSrc;
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
        startCrossfadeMonitor();
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
    if (!audio || !isUnlocked || isCrossfading.current) return;

    if (!isTracking || !userLocation) {
      if ((activeZoneId || isMotionActive) && !audio.paused) {
        stopWithFadeOut();
        onStateChange({ isPlaying: false, ...currentMeta });
      }
      return;
    }

    const currentZone = zones.find(zone => {
      if (!zone.shape || zone.shape === 'circle') {
        const distance = calculateDistance(userLocation, zone.center);
        return distance <= zone.radius;
      } else if (zone.shape === 'rectangle' && zone.bounds) {
        return isPointInRect(userLocation, zone.bounds);
      } else if (zone.shape === 'square') {
        // Square is center + radius (half-side)
        const latDiff = (zone.radius / 111320);
        const lngDiff = (zone.radius / (111320 * Math.cos(zone.center.lat * Math.PI / 180)));
        const bounds: [Coordinates, Coordinates] = [
          { lat: zone.center.lat - latDiff, lng: zone.center.lng - lngDiff },
          { lat: zone.center.lat + latDiff, lng: zone.center.lng + lngDiff }
        ];
        return isPointInRect(userLocation, bounds);
      } else if ((zone.shape === 'triangle' || zone.shape === 'custom') && zone.points) {
        return isPointInPolygon(userLocation, zone.points);
      }
      return false;
    });

    const activeZoneStillExists = activeZoneId ? zones.some(z => z.id === activeZoneId) : false;

    if (currentZone) {
      // ENTERING OR STAYING IN A ZONE
      if (activeZoneId !== currentZone.id) {
        console.log(`[AudioEngine] Entering zone: ${currentZone.name}`);
        onResetPause();
        setActiveZoneId(currentZone.id);
        setIsMotionActive(false);
        
        if (currentZone.music) {
          const newMeta = {
             trackName: currentZone.music.name,
             zoneName: currentZone.name,
             coverUrl: currentZone.music.coverUrl,
             isMotionMusic: false
          };
          setCurrentMeta(newMeta);
          
          if (enableCrossfade && crossfadeDuration > 0 && audio.src) {
            performCrossfade(currentZone.music.url);
          } else {
            startWithFadeIn(currentZone.music.url);
          }
          onStateChange({ isPlaying: true, ...newMeta });
        }
      } else {
        if (isPaused) {
          if (!audio.paused) audio.pause();
          onStateChange({ isPlaying: false, ...currentMeta });
        } else {
          if (audio.paused && audio.src) {
            audio.play().catch(() => {});
          }
          onStateChange({ isPlaying: true, ...currentMeta });
        }
      }
    } else {
      // OUTSIDE ZONES
      if (activeZoneId !== null) {
        // Just left a zone
        console.log(`[AudioEngine] Left zone, switching to motion music if enabled`);
        onResetPause();
        setActiveZoneId(null);
        if (enableMotionMusic && motionPlaylist.length > 0) {
          // Switch to motion music
          setIsMotionActive(true);
          const track = motionPlaylist[currentMotionIndex];
          const newMeta = {
            trackName: track.name,
            zoneName: 'En Movimiento',
            coverUrl: track.coverUrl,
            isMotionMusic: true
          };
          setCurrentMeta(newMeta);
          
          if (enableCrossfade && crossfadeDuration > 0 && audio.src) {
            performCrossfade(track.url);
          } else {
            startWithFadeIn(track.url);
          }
          onStateChange({ isPlaying: true, ...newMeta });
        } else {
          stopWithFadeOut();
          setCurrentMeta({});
          onStateChange({ isPlaying: false });
        }
      } else if (enableMotionMusic && motionPlaylist.length > 0) {
        // Stay in motion music
        if (!isMotionActive) {
          console.log(`[AudioEngine] Activating motion music. Tracks: ${motionPlaylist.length}`);
          setIsMotionActive(true);
          const safeIndex = currentMotionIndex >= motionPlaylist.length ? 0 : currentMotionIndex;
          if (safeIndex !== currentMotionIndex) setCurrentMotionIndex(safeIndex);
          
          const track = motionPlaylist[safeIndex];
          const newMeta = {
            trackName: track.name,
            zoneName: 'En Movimiento',
            coverUrl: track.coverUrl,
            isMotionMusic: true
          };
          setCurrentMeta(newMeta);
          startWithFadeIn(track.url);
          onStateChange({ isPlaying: true, ...newMeta });
        } else {
          // Update meta if track changed
          const safeIndex = currentMotionIndex >= motionPlaylist.length ? 0 : currentMotionIndex;
          if (safeIndex !== currentMotionIndex) {
             setCurrentMotionIndex(safeIndex);
             return; // Let next effect run handle it
          }
          
          const track = motionPlaylist[safeIndex];
          if (track && currentMeta.trackName !== track.name) {
             console.log(`[AudioEngine] Motion track changed to: ${track.name}`);
             const newMeta = {
                trackName: track.name,
                zoneName: 'En Movimiento',
                coverUrl: track.coverUrl,
                isMotionMusic: true
             };
             setCurrentMeta(newMeta);
             if (enableCrossfade && crossfadeDuration > 0 && audio.src) {
               performCrossfade(track.url);
             } else {
               startWithFadeIn(track.url);
             }
             onStateChange({ isPlaying: true, ...newMeta });
          }

          if (isPaused) {
            if (!audio.paused) audio.pause();
            onStateChange({ isPlaying: false, ...currentMeta });
          } else {
            if (audio.paused && audio.src) {
              console.log(`[AudioEngine] Resuming motion music: ${track?.name}`);
              audio.play().catch(e => console.error("[AudioEngine] Play failed:", e));
            }
            onStateChange({ isPlaying: true, ...currentMeta });
          }
        }
      } else if (isMotionActive) {
        // Motion music was active but now disabled or empty
        console.log(`[AudioEngine] Deactivating motion music (disabled or empty playlist)`);
        setIsMotionActive(false);
        stopWithFadeOut();
        setCurrentMeta({});
        onStateChange({ isPlaying: false });
      }
    }

    if (activeZoneId && !activeZoneStillExists) {
        stopWithFadeOut();
        setCurrentMeta({});
        onStateChange({ isPlaying: false });
        setActiveZoneId(null);
    }

  }, [userLocation, zones, isTracking, activeZoneId, isPaused, isUnlocked, enableFadeOut, fadeOutDuration, enableFadeIn, fadeInDuration, volume, enableCrossfade, crossfadeDuration, enableMotionMusic, motionPlaylist, currentMotionIndex, isMotionActive, currentMeta]);

  // MediaSession API Support
  useEffect(() => {
    if ('mediaSession' in navigator && currentMeta.trackName) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentMeta.trackName,
        artist: currentMeta.zoneName || 'MusicMaps',
        album: currentMeta.isMotionMusic ? 'Playlist Movimiento' : 'MusicMaps Zones',
        artwork: [
          { src: currentMeta.coverUrl || 'https://picsum.photos/seed/music/512/512', sizes: '512x512', type: 'image/png' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (isPaused) onResetPause();
        const audio = activeAudioIndex.current === 1 ? audio1Ref.current : audio2Ref.current;
        audio?.play().catch(() => {});
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (!isPaused) onResetPause();
        const audio = activeAudioIndex.current === 1 ? audio1Ref.current : audio2Ref.current;
        audio?.pause();
      });
      
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (isMotionActive) {
          const nextIndex = getNextMotionIndex(currentMotionIndex);
          if (nextIndex !== -1) setCurrentMotionIndex(nextIndex);
        }
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (isMotionActive) {
          const prevIndex = getPrevMotionIndex(currentMotionIndex);
          setCurrentMotionIndex(prevIndex);
        }
      });

      // Update position state for the notification progress bar
      const audio = activeAudioIndex.current === 1 ? audio1Ref.current : audio2Ref.current;
      if (audio && audio.duration && isFinite(audio.duration)) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: audio.currentTime
          });
        } catch (e) {
          console.error("Error setting position state:", e);
        }
      }
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPaused ? 'paused' : 'playing';
    }
  }, [currentMeta.trackName, currentMeta.zoneName, currentMeta.coverUrl, isPaused, onResetPause, isMotionActive, motionPlaylist.length]);

  return <div className="hidden" aria-hidden="true" />;
});

export default AudioEngine;
