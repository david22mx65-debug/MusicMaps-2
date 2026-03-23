
import React from 'react';
import { PlayerState, AppSettings } from '../types';
import { Volume2, Pause, Play, Volume1, Music, GripHorizontal, Zap, ZapOff, SkipBack, SkipForward, X, ListMusic } from 'lucide-react';
import { motion } from 'motion/react';

interface MusicPlayerProps {
  playerState: PlayerState;
  onTogglePause: () => void;
  isPaused: boolean;
  settings: AppSettings;
  onToggleMotionMusic: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onClose?: () => void;
  onOpenPlaylist?: () => void;
  showFloatingPlayer: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  playerState, 
  onTogglePause, 
  isPaused, 
  settings,
  onVolumeChange,
  onToggleMotionMusic,
  onNext,
  onPrev,
  onClose,
  onOpenPlaylist,
  showFloatingPlayer
}) => {
  if (!showFloatingPlayer || !playerState.trackName) return null;

  const isMotionMusic = playerState.isMotionMusic;

  return (
    <motion.div 
      drag
      dragMomentum={false}
      dragElastic={0.1}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-[calc(85px+env(safe-area-inset-top))] left-4 right-4 z-[450] flex justify-center pointer-events-none"
    >
      <div className={`${settings.uiStyle === 'pixel' ? (settings.uiTheme === 'light' ? 'bg-[#fdf8f5]/95 text-black' : 'bg-[#1a1c1e]/95 text-white') : settings.uiStyle === 'liquid-glass' ? (settings.uiTheme === 'light' ? 'bg-white/40 text-black backdrop-blur-2xl' : 'bg-white/5 text-white backdrop-blur-2xl') : (settings.uiTheme === 'light' ? 'bg-white/95 text-black' : 'bg-[#181818]/95 text-white')} backdrop-blur-xl border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/10'} p-3 sm:p-4 rounded-[24px] sm:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 sm:gap-4 relative w-full max-w-md pointer-events-auto cursor-grab active:cursor-grabbing`}>
        
        {/* Drag Handle Indicator */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-20 hover:opacity-100 transition-opacity">
          <GripHorizontal size={20} className={settings.uiTheme === 'light' ? 'text-black' : 'text-white'} />
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <X size={14} />
        </button>

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
              <div className={`w-full h-full ${settings.uiStyle === 'pixel' ? 'bg-primary/20' : settings.uiStyle === 'liquid-glass' ? 'bg-white/10' : (settings.uiTheme === 'light' ? 'bg-black/5' : 'bg-[#282828]')} flex items-center justify-center`}>
                <Music className={settings.uiStyle === 'pixel' ? 'text-primary' : (settings.uiTheme === 'light' ? 'text-black/20' : 'text-[#B3B3B3]')} size={20} />
              </div>
            )}
          </div>
        </div>

        {/* Info de la música y Control de Volumen */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="min-w-0">
            <h3 className={`font-black text-xs sm:text-sm truncate leading-tight ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'}`}>
              {playerState.trackName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className={`${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate flex items-center gap-1`}>
                <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ backgroundColor: settings.primaryColor }}></span>
                {playerState.zoneName}
              </p>
              {isMotionMusic && (
                <span className="text-[8px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-black uppercase tracking-tighter">Motion</span>
              )}
            </div>
          </div>
          
          {/* Slider de Volumen Directo */}
          <div className="flex items-center gap-2 group">
            <Volume1 size={10} className={`${settings.uiTheme === 'light' ? 'text-black/20' : 'text-[#B3B3B3]/40'} group-hover:text-primary transition-colors`} />
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className={`flex-1 h-1.5 ${settings.uiTheme === 'light' ? 'bg-black/5' : 'bg-white/5'} rounded-full appearance-none cursor-pointer accent-primary hover:h-2 transition-all`}
              style={{ accentColor: settings.primaryColor }}
            />
            <Volume2 size={10} className={`${settings.uiTheme === 'light' ? 'text-black/20' : 'text-[#B3B3B3]/40'} group-hover:text-primary transition-colors`} />
          </div>
        </div>

        {/* Controles Separados */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isMotionMusic && (
            <>
              <button 
                onClick={onPrev}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${settings.uiTheme === 'light' ? 'bg-black/5 text-black/60' : 'bg-white/5 text-white/60'}`}
              >
                <SkipBack size={16} fill="currentColor" />
              </button>
              <button 
                onClick={onNext}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${settings.uiTheme === 'light' ? 'bg-black/5 text-black/60' : 'bg-white/5 text-white/60'}`}
              >
                <SkipForward size={16} fill="currentColor" />
              </button>
            </>
          )}

          {/* Toggle Motion Music (Manual Override) */}
          <button 
            onClick={onToggleMotionMusic}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-90 border ${settings.enableMotionMusic ? 'bg-primary/10 border-primary text-primary' : 'bg-black/5 border-transparent text-gray-400'}`}
            title={settings.enableMotionMusic ? "Desactivar Música de Movimiento" : "Activar Música de Movimiento"}
          >
            {settings.enableMotionMusic ? <Zap size={16} fill="currentColor" /> : <ZapOff size={16} />}
          </button>

          {/* Open Playlist Button */}
          <button 
            onClick={onOpenPlaylist}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-90 border ${settings.uiTheme === 'light' ? 'bg-black/5 border-transparent text-black/40' : 'bg-white/5 border-transparent text-white/40'}`}
            title="Abrir Playlist"
          >
            <ListMusic size={16} />
          </button>

          {/* BOTÓN DE PAUSA PRINCIPAL (Sin afectar volumen) */}
          <button 
            onClick={onTogglePause}
            className={`w-10 h-10 sm:w-12 sm:h-12 ${settings.uiStyle === 'pixel' || settings.uiStyle === 'liquid-glass' ? 'rounded-full' : 'rounded-xl sm:rounded-2xl'} flex items-center justify-center transition-all active:scale-90 shadow-lg`}
            style={{ backgroundColor: settings.primaryColor, color: '#000' }}
          >
            {isPaused ? <Play size={20} fill="currentColor" className="ml-0.5" /> : <Pause size={20} fill="currentColor" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MusicPlayer;
