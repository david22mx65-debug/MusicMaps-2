
import React, { useState } from 'react';
import { PlayerState, AppSettings } from '../types';
import { Volume2, Pause, Play, VolumeX, Volume1, Music, SlidersHorizontal, GripHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

interface MusicPlayerProps {
  playerState: PlayerState;
  onTogglePause: () => void;
  isPaused: boolean;
  settings: AppSettings;
  onVolumeChange: (volume: number) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  playerState, 
  onTogglePause, 
  isPaused, 
  settings,
  onVolumeChange
}) => {
  const [showVolume, setShowVolume] = useState(false);

  if (!playerState.trackName) return null;

  return (
    <motion.div 
      drag
      dragMomentum={false}
      dragElastic={0.1}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-[calc(85px+env(safe-area-inset-top))] left-4 right-4 z-[450] flex justify-center pointer-events-none"
    >
      <div className={`${settings.uiStyle === 'pixel' ? (settings.uiTheme === 'light' ? 'bg-[#fdf8f5]/95 text-black' : 'bg-[#1a1c1e]/95 text-white') : (settings.uiTheme === 'light' ? 'bg-white/95 text-black' : 'bg-[#181818]/95 text-white')} backdrop-blur-xl border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/10'} p-3 sm:p-4 rounded-[24px] sm:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 sm:gap-4 relative w-full max-w-md pointer-events-auto cursor-grab active:cursor-grabbing`}>
        
        {/* Drag Handle Indicator */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-20 hover:opacity-100 transition-opacity">
          <GripHorizontal size={20} className={settings.uiTheme === 'light' ? 'text-black' : 'text-white'} />
        </div>

        {/* Indicador de Volumen Actual (Solo visual) */}
        {!isPaused && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-1 items-end h-2.5 sm:h-3">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className="w-0.5 sm:w-1 bg-primary rounded-full animate-bounce" 
                style={{ 
                  height: `${Math.random() * 100}%`, 
                  animationDelay: `${i * 0.1}s`,
                  backgroundColor: settings.primaryColor 
                }} 
              />
            ))}
          </div>
        )}

        {/* Portada o Icono */}
        <div className="shrink-0 relative">
          <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-500 ${isPaused ? (settings.uiTheme === 'light' ? 'border-black/5 grayscale scale-95' : 'border-white/10 grayscale scale-95') : 'border-primary shadow-lg shadow-primary/20'}`} style={{ borderColor: !isPaused ? settings.primaryColor : undefined }}>
            {playerState.coverUrl ? (
              <img src={playerState.coverUrl} className="w-full h-full object-cover" alt="Cover" />
            ) : (
              <div className={`w-full h-full ${settings.uiStyle === 'pixel' ? 'bg-primary/20' : (settings.uiTheme === 'light' ? 'bg-black/5' : 'bg-[#282828]')} flex items-center justify-center`}>
                <Music className={settings.uiStyle === 'pixel' ? 'text-primary' : (settings.uiTheme === 'light' ? 'text-black/20' : 'text-[#B3B3B3]')} size={20} />
              </div>
            )}
          </div>
        </div>

        {/* Info de la música */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-black text-xs sm:text-sm truncate leading-tight ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'}`}>
            {playerState.trackName}
          </h3>
          <p className={`${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-0.5 truncate flex items-center gap-1`}>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ backgroundColor: settings.primaryColor }}></span>
            {playerState.zoneName}
          </p>
        </div>

        {/* Controles Separados */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Botón de Volumen (Abre slider) */}
          <button 
            onClick={() => setShowVolume(!showVolume)}
            className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all ${showVolume ? (settings.uiTheme === 'light' ? 'bg-black text-white' : 'bg-white text-black') : (settings.uiStyle === 'pixel' ? 'bg-primary/20 text-primary hover:bg-primary/30' : (settings.uiTheme === 'light' ? 'bg-black/5 text-black/40 hover:text-black' : 'bg-[#282828] text-[#B3B3B3] hover:text-white'))}`}
          >
            {settings.volume === 0 ? <VolumeX size={16} /> : <SlidersHorizontal size={16} />}
          </button>

          {/* BOTÓN DE PAUSA PRINCIPAL (Sin afectar volumen) */}
          <button 
            onClick={onTogglePause}
            className={`w-10 h-10 sm:w-12 sm:h-12 ${settings.uiStyle === 'pixel' ? 'rounded-full' : 'rounded-xl sm:rounded-2xl'} flex items-center justify-center transition-all active:scale-90 shadow-lg`}
            style={{ backgroundColor: settings.primaryColor, color: '#000' }}
          >
            {isPaused ? <Play size={20} fill="currentColor" className="ml-0.5" /> : <Pause size={20} fill="currentColor" />}
          </button>
        </div>

        {/* Slider de Volumen Flotante */}
        {showVolume && (
          <div className={`absolute top-full mt-2 right-0 ${settings.uiTheme === 'light' ? 'bg-white' : 'bg-[#282828]'} p-4 rounded-2xl shadow-2xl border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/10'} w-40 sm:w-48 animate-in fade-in slide-in-from-top-2`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <Volume1 size={14} className={settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} />
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className={`flex-1 h-1 ${settings.uiTheme === 'light' ? 'bg-black/10' : 'bg-white/10'} rounded-full appearance-none cursor-pointer accent-primary`}
                style={{ accentColor: settings.primaryColor }}
              />
              <Volume2 size={14} className={settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} />
            </div>
            <div className={`text-[9px] sm:text-[10px] font-black text-center mt-2 ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} uppercase tracking-widest`}>
              Volumen: {Math.round(settings.volume * 100)}%
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MusicPlayer;
