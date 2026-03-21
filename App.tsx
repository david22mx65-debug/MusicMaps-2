
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinates, Zone, AppState, PlayerState, AppSettings } from './types';
import { DEFAULT_CENTER, getAppIcon } from './constants';
import MapWrapper from './components/MapWrapper';
import ZoneModal from './components/ZoneModal';
import SettingsModal from './components/SettingsModal';
import AudioEngine from './components/AudioEngine';
import MusicPlayer from './components/MusicPlayer';
import { Navigation, AlertTriangle, FlaskConical, Move, Settings, Play, GripHorizontal, Moon, Sun, Maximize, Minimize } from 'lucide-react';
import { motion } from 'motion/react';
import { audioStorage } from './src/services/audioStorage';

import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

const App: React.FC = () => {
  const [userLocation, setUserLocation] = useState<Coordinates>(DEFAULT_CENTER);
  const [zones, setZones] = useState<Zone[]>(() => {
    const saved = localStorage.getItem('musicmaps_zones');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [appState, setAppState] = useState<AppState>(AppState.MAP_VIEW);
  const [pendingZoneCoords, setPendingZoneCoords] = useState<Coordinates | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false); // Para Android Audio Unlock
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('musicmaps_settings');
    const defaults: AppSettings = {
      primaryColor: '#1DB954',
      language: 'es',
      userName: 'Usuario MusicMaps',
      selectedDeviceId: 'default',
      volume: 0.8,
      mapTheme: 'dark',
      uiTheme: 'dark',
      uiStyle: 'classic',
      keepScreenOn: false,
      enableBackgroundMode: false,
      enableFadeOut: true,
      fadeOutDuration: 2,
      enableFadeIn: true,
      fadeInDuration: 2,
      enableCrossfade: true,
      crossfadeDuration: 3,
      offlineMode: false
    };
    if (saved) {
      try {
        return { ...defaults, ...JSON.parse(saved) };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  // Capacitor Initialization
  useEffect(() => {
    const initCapacitor = async () => {
      try {
        await SplashScreen.hide();
        await StatusBar.setStyle({ style: settings.uiTheme === 'dark' ? Style.Dark : Style.Light });
      } catch (e) {
        console.log('Not running in Capacitor');
      }
    };
    initCapacitor();

    const backListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        if (appState !== AppState.MAP_VIEW) {
          setAppState(AppState.MAP_VIEW);
        } else {
          CapApp.exitApp();
        }
      } else {
        window.history.back();
      }
    });

    return () => {
      backListener.then(l => l.remove());
    };
  }, [appState, settings.uiTheme]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => {
        console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const [isTracking, setIsTracking] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isAutoCenterEnabled, setIsAutoCenterEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({ isPlaying: false });
  const [isManualPaused, setIsManualPaused] = useState(false);
  const wakeLockRef = useRef<any>(null);
  const blobUrlsRef = useRef<Map<string, string>>(new Map());

  // Hydrate zones with blob URLs from IndexedDB
  useEffect(() => {
    const hydrateZones = async () => {
      const hydrationPromises: Promise<void>[] = [];
      const newBlobUrls = new Map<string, string>();
      const updatedZones = [...zones];

      updatedZones.forEach((zone, index) => {
        if (zone.music) {
          hydrationPromises.push((async () => {
            try {
              const existingUrl = blobUrlsRef.current.get(zone.id);
              if (existingUrl) {
                updatedZones[index].music!.url = existingUrl;
                newBlobUrls.set(zone.id, existingUrl);
                return;
              }

              const audioData = await audioStorage.getAudio(zone.id);
              if (audioData) {
                const newUrl = URL.createObjectURL(audioData.file);
                updatedZones[index].music!.url = newUrl;
                updatedZones[index].music!.file = audioData.file as File;
                newBlobUrls.set(zone.id, newUrl);
              }
            } catch (err) {
              console.error(`Error hydrating zone ${zone.id}:`, err);
            }
          })());
        }
      });

      await Promise.all(hydrationPromises);

      // Revoke URLs that are no longer in use
      blobUrlsRef.current.forEach((url, id) => {
        if (!newBlobUrls.has(id)) {
          URL.revokeObjectURL(url);
        }
      });
      blobUrlsRef.current = newBlobUrls;
      
      // Only update if something changed (to avoid infinite loops)
      const hasChanges = updatedZones.some((z, i) => z.music?.url !== zones[i].music?.url);
      if (hasChanges) {
        setZones(updatedZones);
      }
    };

    hydrateZones();

    return () => {
      // Cleanup all URLs on unmount
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      blobUrlsRef.current.clear();
    };
  }, []); // Only on mount

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
  }, [settings.primaryColor]);

  // Persist Settings to LocalStorage
  const updateSettings = useCallback(async (newSettings: AppSettings | ((prev: AppSettings) => AppSettings)) => {
    const nextSettings = typeof newSettings === 'function' ? newSettings(settings) : newSettings;
    setSettings(nextSettings);
    localStorage.setItem('musicmaps_settings', JSON.stringify(nextSettings));
  }, [settings]);

  // Desbloqueo de Audio para Android
  const unlockAudio = () => {
    setIsUnlocked(true);
  };

  useEffect(() => {
    let watchId: number | null = null;

    if (isTestMode) {
        setIsTracking(false);
    } else {
        if (!navigator.geolocation) {
          setError("GPS no soportado");
          return;
        }

        setIsTracking(true);
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setError(null);
          },
          (err) => {
            console.error(err);
            setError("Activa el GPS y permite el acceso.");
            setIsTracking(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
    }

    return () => { 
        if(watchId !== null) navigator.geolocation.clearWatch(watchId); 
    };
  }, [isTestMode]);

  const handleMapClick = (coords: Coordinates) => {
    if (!isUnlocked) unlockAudio();
    if (isTestMode) {
      setUserLocation(coords);
    } else {
      setPendingZoneCoords(coords);
      setAppState(AppState.ADDING_ZONE);
    }
  };

  const handleSaveZone = async (newZone: Zone) => {
    try {
      // Persist audio file to IndexedDB
      if (newZone.music?.file) {
        await audioStorage.saveAudio(
          newZone.id, 
          newZone.music.file, 
          newZone.music.name, 
          newZone.music.file.type
        );
      }

      const updatedZones = [...zones, newZone];
      setZones(updatedZones);
      localStorage.setItem('musicmaps_zones', JSON.stringify(updatedZones));
    } catch (err) {
      console.error("Error saving zone:", err);
    }
    setAppState(AppState.MAP_VIEW);
    setPendingZoneCoords(null);
  };

  const handleDeleteZone = async (id: string) => {
    try {
      const updatedZones = zones.filter(z => z.id !== id);
      setZones(updatedZones);
      localStorage.setItem('musicmaps_zones', JSON.stringify(updatedZones));
      await audioStorage.deleteAudio(id);
    } catch (err) {
      console.error("Error deleting zone:", err);
    }
  };

  const handleUpdateZone = async (updatedZone: Zone) => {
    try {
      // Persist audio file to IndexedDB if it has changed
      if (updatedZone.music?.file) {
        await audioStorage.saveAudio(
          updatedZone.id, 
          updatedZone.music.file, 
          updatedZone.music.name, 
          updatedZone.music.file.type
        );
      }

      const updatedZones = zones.map(z => z.id === updatedZone.id ? updatedZone : z);
      setZones(updatedZones);
      localStorage.setItem('musicmaps_zones', JSON.stringify(updatedZones));
    } catch (err) {
      console.error("Error updating zone:", err);
    }
  };

  const handleCancelZone = () => {
    setAppState(AppState.MAP_VIEW);
    setPendingZoneCoords(null);
  };

  const handleManualDrag = () => {
    if (isAutoCenterEnabled) setIsAutoCenterEnabled(false);
  };

  const handleRecenter = () => {
    if (!isUnlocked) unlockAudio();
    setIsAutoCenterEnabled(true);
    setUserLocation({...userLocation}); 
  };
  
  const togglePause = useCallback(() => {
      setIsManualPaused(prev => !prev);
  }, []);

  const resetPause = useCallback(() => {
      setIsManualPaused(false);
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    updateSettings(prev => ({ ...prev, volume: newVolume }));
  }, [updateSettings]);

  const translations = {
    es: { offline: 'Modo Offline', zones: 'zonas activas', test: 'MODO PRUEBA', gpsOn: 'GPS Activo', gpsOff: 'GPS Inactivo', exploring: 'Explorando', tap: 'Toca el mapa para agregar', explore: 'Modo exploración libre', recenter: 'Recentrar', testBtn: 'Probar', testOut: 'Salir', testPick: 'Selecciona una ubicación', start: 'Activar Audio', welcome: 'Bienvenido' },
    en: { offline: 'Offline Mode', zones: 'active zones', test: 'TEST MODE', gpsOn: 'GPS Active', gpsOff: 'GPS Inactive', exploring: 'Exploring', tap: 'Tap map to add', explore: 'Free exploration mode', recenter: 'Recenter', testBtn: 'Test', testOut: 'Exit', testPick: 'Select a location', start: 'Unlock Audio', welcome: 'Welcome' },
    pt: { offline: 'Modo Offline', zones: 'zonas ativas', test: 'MODO TESTE', gpsOn: 'GPS Activo', gpsOff: 'GPS Inativo', exploring: 'Explorando', tap: 'Toque no mapa para adicionar', explore: 'Modo exploração libre', recenter: 'Recentrar', testBtn: 'Testar', testOut: 'Sair', testPick: 'Selecione um local', start: 'Ativar Áudio', welcome: 'Bem-vindo' }
  }[settings.language];

  return (
    <div className={`h-screen w-screen flex flex-col relative overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] transition-colors duration-500 ${settings.uiTheme === 'light' ? 'bg-[#f5f5f5] text-black' : 'bg-[#121212] text-white'} ${settings.uiStyle === 'pixel' ? 'ui-style-pixel' : settings.uiStyle === 'liquid-glass' ? 'ui-style-liquid-glass' : 'ui-style-classic'}`}>
      <style>{`
        :root { --primary-color: #1DB954; }
        .text-primary { color: var(--primary-color); }
        .bg-primary { background-color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
      `}</style>
      
      {/* Liquid Glass Blobs */}
      {settings.uiStyle === 'liquid-glass' && (
        <>
          <div className="liquid-blob top-[-100px] left-[-100px]" />
          <div className="liquid-blob bottom-[-100px] right-[-100px]" style={{ animationDelay: '-10s', background: 'rgba(255,255,255,0.1)' }} />
        </>
      )}
      
      {/* Android Audio Unlock Overlay */}
      {!isUnlocked && (
        <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
           <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(29,185,84,0.4)]">
              <Play size={40} className="text-black ml-1" fill="currentColor" />
           </div>
           <h2 className="text-2xl font-black mb-2">MusicMaps Android</h2>
           <p className="text-[#B3B3B3] text-sm mb-8 max-w-xs">Toca para activar el motor de audio y el seguimiento GPS en tiempo real.</p>
           <button 
            onClick={unlockAudio}
            className="w-full max-w-xs py-4 bg-primary text-black font-black rounded-full uppercase tracking-widest text-sm shadow-xl"
           >
             {translations.start}
           </button>
        </div>
      )}
      
      {/* Header */}
      <header className="absolute top-[env(safe-area-inset-top)] left-0 right-0 z-[500] p-4 flex justify-between items-start pointer-events-none">
        <div className={`${settings.uiStyle === 'liquid-glass' ? (settings.uiTheme === 'light' ? 'bg-white/40 backdrop-blur-2xl' : 'bg-white/5 backdrop-blur-2xl') : (settings.uiTheme === 'light' ? 'bg-white/90 text-black' : 'bg-[#121212]/90 text-white')} backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-2xl border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} pointer-events-auto max-w-[70%] sm:max-w-none`}>
            <h1 className="text-base sm:text-lg font-black text-primary flex items-center gap-2 tracking-tight">
                <img src={getAppIcon(settings.primaryColor)} alt="Icon" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" /> 
                MusicMaps
            </h1>
            <div className="flex flex-col gap-0.5 mt-1">
               <div className="flex items-center gap-2">
                  {settings.offlineMode && (
                    <span className="text-[9px] sm:text-[10px] text-orange-500 font-bold">OFFLINE</span>
                  )}
                  {isTestMode ? (
                    <span className="text-[7px] sm:text-[8px] font-bold text-black bg-primary px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">{translations.test}</span>
                  ) : (
                    isTracking ? <span className="text-[9px] sm:text-[10px] text-primary font-bold">● {translations.gpsOn}</span> : <span className="text-[9px] sm:text-[10px] text-[#FF4B4B] font-bold">● {translations.gpsOff}</span>
                  )}
               </div>
            </div>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={toggleFullscreen}
            className={`${settings.uiStyle === 'liquid-glass' ? (settings.uiTheme === 'light' ? 'bg-white/40 backdrop-blur-2xl' : 'bg-white/5 backdrop-blur-2xl') : (settings.uiTheme === 'light' ? 'bg-white/90 text-black' : 'bg-[#121212]/90 text-white')} backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-2xl border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} hover:opacity-80 active:scale-90 transition-all`}
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5 sm:w-6 sm:h-6" /> : <Maximize className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
          <button 
            onClick={() => setAppState(AppState.SETTINGS)}
            className={`${settings.uiStyle === 'liquid-glass' ? (settings.uiTheme === 'light' ? 'bg-white/40 backdrop-blur-2xl' : 'bg-white/5 backdrop-blur-2xl') : (settings.uiTheme === 'light' ? 'bg-white/90 text-black' : 'bg-[#121212]/90 text-white')} backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-2xl border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} hover:opacity-80 active:scale-90 transition-all`}
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </header>

      {/* Visual Music Player */}
      <MusicPlayer 
        playerState={playerState} 
        onTogglePause={togglePause}
        isPaused={isManualPaused}
        settings={settings}
        onVolumeChange={handleVolumeChange}
      />

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapWrapper 
          userLocation={userLocation} 
          zones={zones} 
          onMapClick={handleMapClick}
          isAutoCenterEnabled={isAutoCenterEnabled}
          onManualDrag={handleManualDrag}
          theme={settings.mapTheme}
        />
        
      {/* Theme Toggle Button */}
      <div className="absolute top-[calc(100px+env(safe-area-inset-top))] right-4 z-[500] flex flex-col gap-2">
        <button 
          onClick={() => setSettings(prev => ({ ...prev, mapTheme: prev.mapTheme === 'dark' ? 'light' : 'dark' }))}
          className={`${settings.uiStyle === 'liquid-glass' ? (settings.uiTheme === 'light' ? 'bg-white/40 backdrop-blur-2xl' : 'bg-white/5 backdrop-blur-2xl') : (settings.uiTheme === 'light' ? 'bg-white/90 text-black' : 'bg-[#121212]/90 text-white')} backdrop-blur-xl p-2.5 sm:p-3 rounded-2xl shadow-2xl border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} pointer-events-auto hover:opacity-80 active:scale-90 transition-all flex flex-col items-center gap-1`}
          title="Cambiar tema del mapa"
        >
          <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-white/20 ${settings.mapTheme === 'light' ? 'bg-white' : 'bg-[#242424]'}`} />
          <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-tighter">
            MAPA: {settings.mapTheme === 'dark' ? 'OSCURO' : 'CLARO'}
          </span>
        </button>

        <button 
          onClick={() => setSettings(prev => ({ ...prev, uiTheme: prev.uiTheme === 'dark' ? 'light' : 'dark' }))}
          className={`${settings.uiStyle === 'liquid-glass' ? (settings.uiTheme === 'light' ? 'bg-white/40 backdrop-blur-2xl' : 'bg-white/5 backdrop-blur-2xl') : (settings.uiTheme === 'light' ? 'bg-white/90 text-black' : 'bg-[#121212]/90 text-white')} backdrop-blur-xl p-2.5 sm:p-3 rounded-2xl shadow-2xl border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} pointer-events-auto hover:opacity-80 active:scale-90 transition-all flex flex-col items-center gap-1`}
          title="Cambiar tema de la interfaz"
        >
          {settings.uiTheme === 'dark' ? <Moon size={14} className="sm:w-4 sm:h-4" /> : <Sun size={14} className="sm:w-4 sm:h-4" />}
          <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-tighter">
            UI: {settings.uiTheme === 'dark' ? 'OSCURO' : 'CLARO'}
          </span>
        </button>
      </div>
        
        {!isAutoCenterEnabled && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none animate-in fade-in zoom-in duration-300">
                <div className={`${settings.uiStyle === 'liquid-glass' ? (settings.uiTheme === 'light' ? 'bg-white/40 backdrop-blur-2xl text-black' : 'bg-white/5 backdrop-blur-2xl text-white') : 'bg-[#181818]/90 text-white'} px-4 py-2 rounded-full text-xs font-bold border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/10'} backdrop-blur-md flex items-center gap-2 shadow-2xl`}>
                    <Move size={12} className="text-primary" /> {translations.exploring}
                </div>
            </div>
        )}
      </div>

      {/* Bottom Controls (Draggable) */}
      <motion.div 
        drag
        dragConstraints={{ left: -100, right: 100, top: -400, bottom: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-[500] w-full max-w-md px-4 pointer-events-none"
      >
         {error && !isTestMode && (
             <div className="bg-[#FF4B4B] text-white p-3 rounded-lg mb-4 text-[10px] sm:text-xs font-bold flex items-center gap-2 shadow-lg pointer-events-auto">
                 <AlertTriangle size={14} /> {error}
             </div>
         )}
         
         <div className={`${settings.uiStyle === 'liquid-glass' ? (settings.uiTheme === 'light' ? 'bg-white/40 backdrop-blur-2xl' : 'bg-white/5 backdrop-blur-2xl') : (settings.uiTheme === 'light' ? 'bg-white text-black' : 'bg-[#181818] text-white')} border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} p-3 sm:p-4 rounded-[28px] sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto transition-all`}>
            <div className="flex justify-center mb-1 opacity-20 cursor-grab active:cursor-grabbing">
                <GripHorizontal size={20} />
            </div>
            <p className={`text-[9px] sm:text-[10px] text-center ${settings.uiTheme === 'light' ? 'text-black/60' : 'text-[#B3B3B3]'} mb-2 sm:mb-3 font-bold uppercase tracking-widest`}>
                {isTestMode 
                  ? `🧪 ${translations.testPick}` 
                  : isAutoCenterEnabled 
                     ? translations.tap 
                     : translations.explore}
            </p>
            <div className="flex gap-2">
                <button 
                    onClick={handleRecenter}
                    className={`flex-1 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        isAutoCenterEnabled 
                        ? (settings.uiTheme === 'light' ? "bg-black/5 text-black/40" : "bg-[#282828] text-[#B3B3B3]") 
                        : (settings.uiTheme === 'light' ? "bg-black text-white shadow-lg" : "bg-white text-black shadow-lg")
                    }`}
                >
                    <Navigation size={12} fill="currentColor" /> {translations.recenter}
                </button>
                <button 
                    onClick={() => {
                      if(!isUnlocked) unlockAudio();
                      setIsTestMode(!isTestMode);
                    }}
                    className={`flex-1 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        isTestMode 
                        ? (settings.uiTheme === 'light' ? "bg-black text-white" : "bg-white text-black") 
                        : "bg-primary text-black shadow-lg"
                    }`}
                >
                    <FlaskConical size={12} fill="currentColor" /> {isTestMode ? translations.testOut : translations.testBtn}
                </button>
            </div>
         </div>
      </motion.div>

      {appState === AppState.ADDING_ZONE && pendingZoneCoords && (
        <ZoneModal 
          location={pendingZoneCoords} 
          onSave={handleSaveZone} 
          onCancel={handleCancelZone} 
          language={settings.language}
          uiTheme={settings.uiTheme}
          uiStyle={settings.uiStyle}
        />
      )}

      {appState === AppState.SETTINGS && (
        <SettingsModal 
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setAppState(AppState.MAP_VIEW)}
          zones={zones}
          onDeleteZone={handleDeleteZone}
          onUpdateZone={handleUpdateZone}
        />
      )}

      <AudioEngine 
        userLocation={userLocation}
        zones={zones}
        isTracking={isTracking || isTestMode}
        onStateChange={setPlayerState}
        isPaused={isManualPaused}
        onResetPause={resetPause}
        volume={settings.volume}
        isUnlocked={isUnlocked}
        enableFadeOut={settings.enableFadeOut}
        fadeOutDuration={settings.fadeOutDuration}
        enableFadeIn={settings.enableFadeIn}
        fadeInDuration={settings.fadeInDuration}
        enableCrossfade={settings.enableCrossfade}
        crossfadeDuration={settings.crossfadeDuration}
      />

    </div>
  );
};

export default App;
