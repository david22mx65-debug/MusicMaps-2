
import React, { useState, useEffect } from 'react';
import { MusicTrack, Language, AppSettings } from '../types';
import { X, Music, Upload, Trash2, GripVertical, AlertCircle, Plus, FolderOpen, Library, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { audioStorage, AudioFileData } from '../src/services/audioStorage';
import { extractMetadata } from '../src/lib/metadata';

interface MotionPlaylistModalProps {
  onClose: () => void;
  language: Language;
  uiTheme: 'dark' | 'light';
  uiStyle: 'classic' | 'pixel' | 'liquid-glass';
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings | ((prev: AppSettings) => AppSettings)) => void;
}

const MotionPlaylistModal: React.FC<MotionPlaylistModalProps> = ({ 
  onClose, 
  language, 
  uiTheme, 
  uiStyle,
  settings,
  onUpdateSettings
}) => {
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
  const [library, setLibrary] = useState<AudioFileData[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const t = {
    es: {
      title: 'Música en Movimiento',
      desc: 'Esta música sonará mientras te desplazas fuera de las zonas.',
      limit: 'Límite: 10,000 canciones (MP3/FLAC)',
      upload: 'Añadir Canción',
      uploadFolder: 'Importar Carpeta',
      library: 'Biblioteca',
      empty: 'No hay canciones en tu playlist de movimiento.',
      delete: 'Eliminar',
      errorLimit: 'Has alcanzado el límite de 10,000 canciones.',
      errorFormat: 'Solo se permiten archivos MP3 o FLAC.',
      addFromLibrary: 'Añadir desde Biblioteca',
      shuffle: 'Aleatorio',
      repeat: 'Bucle',
      repeatNone: 'Sin Bucle',
      repeatAll: 'Bucle Todo',
      repeatOne: 'Bucle Uno'
    },
    en: {
      title: 'Music in Motion',
      desc: 'This music will play while you move outside of zones.',
      limit: 'Limit: 10,000 songs (MP3/FLAC)',
      upload: 'Add Song',
      uploadFolder: 'Import Folder',
      library: 'Library',
      empty: 'No songs in your motion playlist.',
      delete: 'Delete',
      errorLimit: 'You have reached the limit of 10,000 songs.',
      errorFormat: 'Only MP3 or FLAC files are allowed.',
      addFromLibrary: 'Add from Library',
      shuffle: 'Shuffle',
      repeat: 'Repeat',
      repeatNone: 'No Repeat',
      repeatAll: 'Repeat All',
      repeatOne: 'Repeat One'
    },
    pt: {
      title: 'Música em Movimento',
      desc: 'Esta música tocará enquanto você se desloca fora das zonas.',
      limit: 'Limite: 10,000 canções (MP3/FLAC)',
      upload: 'Adicionar Canção',
      uploadFolder: 'Importar Pasta',
      library: 'Biblioteca',
      empty: 'Não há canções na sua playlist de movimento.',
      delete: 'Excluir',
      errorLimit: 'Você atingiu o limite de 10,000 canções.',
      errorFormat: 'Apenas arquivos MP3 ou FLAC são permitidos.',
      addFromLibrary: 'Adicionar da Biblioteca',
      shuffle: 'Aleatório',
      repeat: 'Repetir',
      repeatNone: 'Sem Repetir',
      repeatAll: 'Repetir Tudo',
      repeatOne: 'Repetir Uma'
    }
  }[language];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedTracks, libraryTracks] = await Promise.all([
          audioStorage.getAllMotionAudio(),
          audioStorage.getAllLibraryAudio()
        ]);

        const tracks: MusicTrack[] = storedTracks.map(t => ({
          id: t.id,
          name: t.name,
          file: t.file as File,
          url: URL.createObjectURL(t.file),
          coverUrl: t.coverUrl
        }));
        setPlaylist(tracks);
        setLibrary(libraryTracks);
      } catch (err) {
        console.error("Error loading motion data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    return () => {
      playlist.forEach(t => URL.revokeObjectURL(t.url));
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (playlist.length >= 10000) {
      alert(t.errorLimit);
      return;
    }

    const files = Array.from(e.target.files || []) as File[];
    const validFiles = files.filter(f => f.type === 'audio/mpeg' || f.type === 'audio/flac' || f.name.endsWith('.mp3') || f.name.endsWith('.flac'));

    if (validFiles.length === 0 && files.length > 0) {
      alert(t.errorFormat);
      return;
    }

    const newTracks: MusicTrack[] = [];
    for (const file of validFiles) {
      if (playlist.length + newTracks.length >= 10000) break;
      
      const id = `motion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Extract metadata
      const metadata = await extractMetadata(file);
      
      await audioStorage.saveMotionAudio(id, file, metadata.title || file.name, file.type, metadata.coverUrl);
      
      newTracks.push({
        id,
        name: metadata.title || file.name,
        file,
        url: URL.createObjectURL(file),
        coverUrl: metadata.coverUrl
      });
    }

    setPlaylist(prev => [...prev, ...newTracks]);
    onUpdateSettings(prev => ({ ...prev, motionPlaylistVersion: (prev.motionPlaylistVersion || 0) + 1 }));
    // Refresh library
    const updatedLibrary = await audioStorage.getAllLibraryAudio();
    setLibrary(updatedLibrary);
  };

  const handleAddFromLibrary = async (track: AudioFileData) => {
    if (playlist.length >= 10000) {
      alert(t.errorLimit);
      return;
    }
    if (playlist.some(t => t.id === track.id)) return;

    await audioStorage.saveMotionAudio(track.id, track.file, track.name, track.type, track.coverUrl);
    const newTrack: MusicTrack = {
      id: track.id,
      name: track.name,
      file: track.file as File,
      url: URL.createObjectURL(track.file),
      coverUrl: track.coverUrl
    };
    setPlaylist(prev => [...prev, newTrack]);
    onUpdateSettings(prev => ({ ...prev, motionPlaylistVersion: (prev.motionPlaylistVersion || 0) + 1 }));
  };

  const handleDelete = async (id: string) => {
    try {
      await audioStorage.deleteMotionAudio(id);
      setPlaylist(prev => {
        const track = prev.find(t => t.id === id);
        if (track) URL.revokeObjectURL(track.url);
        return prev.filter(t => t.id !== id);
      });
      onUpdateSettings(prev => ({ ...prev, motionPlaylistVersion: (prev.motionPlaylistVersion || 0) + 1 }));
    } catch (err) {
      console.error("Error deleting motion track:", err);
    }
  };

  const toggleShuffle = () => {
    onUpdateSettings(prev => ({ ...prev, motionShuffle: !prev.motionShuffle }));
  };

  const cycleRepeat = () => {
    onUpdateSettings(prev => {
      const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
      const currentIndex = modes.indexOf(prev.motionRepeat);
      const nextIndex = (currentIndex + 1) % modes.length;
      return { ...prev, motionRepeat: modes[nextIndex] };
    });
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className={`${uiStyle === 'pixel' ? (uiTheme === 'light' ? 'bg-[#fdf8f5]' : 'bg-[#1a1c1e]') : uiStyle === 'liquid-glass' ? (uiTheme === 'light' ? 'bg-white/40 backdrop-blur-2xl' : 'bg-white/5 backdrop-blur-2xl') : (uiTheme === 'light' ? 'bg-[#f5f5f5]' : 'bg-[#121212]')} border ${uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col gap-4 sm:gap-6 animate-in slide-in-from-bottom-20 duration-500 max-h-[95vh] sm:max-h-[90vh] overflow-hidden`}>
        
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`text-xl sm:text-2xl font-black ${uiTheme === 'light' ? 'text-black' : 'text-white'} tracking-tighter`}>
              {t.title}
            </h2>
            <p className={`text-[10px] ${uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} font-bold uppercase tracking-wider`}>
              {t.limit}
            </p>
          </div>
          <button onClick={onClose} className={`p-2 ${uiStyle === 'pixel' ? 'bg-primary/20 text-primary' : uiStyle === 'liquid-glass' ? 'bg-white/10 text-white' : (uiTheme === 'light' ? 'hover:bg-black/5 text-black/40' : 'hover:bg-[#282828] text-[#B3B3B3]')} rounded-full transition-colors`}>
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <p className={`text-xs ${uiTheme === 'light' ? 'text-black/60' : 'text-[#B3B3B3]'} leading-relaxed`}>
          {t.desc}
        </p>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleShuffle}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border transition-all ${settings.motionShuffle ? 'bg-primary/20 border-primary text-primary' : (uiTheme === 'light' ? 'bg-black/5 border-transparent text-black/40' : 'bg-white/5 border-transparent text-white/40')}`}
          >
            <Shuffle size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider">{t.shuffle}</span>
          </button>
          <button 
            onClick={cycleRepeat}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border transition-all ${settings.motionRepeat !== 'none' ? 'bg-primary/20 border-primary text-primary' : (uiTheme === 'light' ? 'bg-black/5 border-transparent text-black/40' : 'bg-white/5 border-transparent text-white/40')}`}
          >
            {settings.motionRepeat === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
            <span className="text-[10px] font-black uppercase tracking-wider">
              {settings.motionRepeat === 'none' ? t.repeatNone : settings.motionRepeat === 'all' ? t.repeatAll : t.repeatOne}
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : showLibrary ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className={`text-sm font-black ${uiTheme === 'light' ? 'text-black' : 'text-white'} uppercase tracking-wider`}>{t.library}</h3>
                <button 
                  onClick={() => setShowLibrary(false)}
                  className="text-[10px] font-black text-primary uppercase"
                >
                  Volver a Playlist
                </button>
              </div>
              {library.length === 0 ? (
                <p className="text-center py-8 opacity-40 text-xs">Biblioteca vacía</p>
              ) : (
                library.map((track) => (
                  <div 
                    key={track.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl ${uiTheme === 'light' ? 'bg-black/5' : 'bg-[#181818]'} border border-white/5`}
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                      <Music size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${uiTheme === 'light' ? 'text-black' : 'text-white'}`}>
                        {track.name}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleAddFromLibrary(track)}
                      disabled={playlist.some(p => p.id === track.id)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-20"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : playlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
              <Music size={48} className="mb-4" />
              <p className="text-sm font-bold">{t.empty}</p>
            </div>
          ) : (
            playlist.map((track) => (
              <div 
                key={track.id}
                className={`flex items-center gap-3 p-3 rounded-2xl ${uiTheme === 'light' ? 'bg-black/5' : 'bg-[#181818]'} border border-white/5 group`}
              >
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shrink-0 overflow-hidden">
                  {track.coverUrl ? (
                    <img src={track.coverUrl} className="w-full h-full object-cover" alt="Cover" />
                  ) : (
                    <Music size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${uiTheme === 'light' ? 'text-black' : 'text-white'}`}>
                    {track.name}
                  </p>
                </div>
                <button 
                  onClick={() => handleDelete(track.id)}
                  className="p-2 text-[#FF4B4B] hover:bg-[#FF4B4B]/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input 
                type="file" 
                multiple 
                accept=".mp3,.flac,audio/mpeg,audio/flac"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={playlist.length >= 10000}
              />
              <button 
                className={`w-full py-3 rounded-xl border border-dashed ${uiTheme === 'light' ? 'border-black/10 text-black/40' : 'border-white/10 text-white/40'} flex items-center justify-center gap-2 font-bold text-[10px] hover:border-primary hover:text-primary transition-all`}
              >
                <Plus size={14} /> {t.upload}
              </button>
            </div>

            <div className="relative">
              <input 
                type="file" 
                multiple 
                {...({ webkitdirectory: "", directory: "" } as any)}
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={playlist.length >= 10000}
              />
              <button 
                className={`w-full py-3 rounded-xl border border-dashed ${uiTheme === 'light' ? 'border-black/10 text-black/40' : 'border-white/10 text-white/40'} flex items-center justify-center gap-2 font-bold text-[10px] hover:border-primary hover:text-primary transition-all`}
              >
                <FolderOpen size={14} /> {t.uploadFolder}
              </button>
            </div>
          </div>

          <button 
            onClick={() => setShowLibrary(!showLibrary)}
            className={`w-full py-3 rounded-xl ${uiTheme === 'light' ? 'bg-black/5 text-black' : 'bg-[#282828] text-white'} flex items-center justify-center gap-2 font-bold text-xs hover:bg-primary/10 hover:text-primary transition-all`}
          >
            <Library size={16} /> {t.library} ({library.length})
          </button>

          <button 
            onClick={onClose}
            className="w-full bg-primary text-black font-black py-4 rounded-full uppercase tracking-widest text-xs shadow-xl shadow-primary/20 active:scale-95 transition-all mt-2"
          >
            Listo
          </button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${uiTheme === 'light' ? 'rgba(0,0,0,0.1)' : '#282828'}; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MotionPlaylistModal;
