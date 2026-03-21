
import React, { useState } from 'react';
import { Coordinates, Zone, MusicTrack, Language } from '../types';
import { X, Music, Upload, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { generateZoneDetails } from '../services/geminiService';

interface ZoneModalProps {
  location: Coordinates;
  onSave: (zone: Zone) => void;
  onCancel: () => void;
  language: Language;
  uiTheme: 'dark' | 'light';
  uiStyle: 'classic' | 'pixel' | 'liquid-glass';
}

const ZoneModal: React.FC<ZoneModalProps> = ({ location, onSave, onCancel, language, uiTheme, uiStyle }) => {
  const [name, setName] = useState('');
  const [radius, setRadius] = useState(50);
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const t = {
    es: {
      title: 'Nueva Zona',
      idLabel: 'Identificador',
      idPlaceholder: 'Nombre de la ubicación',
      suggestTip: 'Sugerir nombre con IA',
      rangeLabel: 'Rango Geográfico',
      audioTitle: 'Configuración de Audio',
      audioDesc: 'Música y portada personalizada',
      uploadAudio: 'Subir Audio',
      uploadCover: 'Subir Portada',
      optional: '(Opcional)',
      saveBtn: 'Guardar Cambios',
      changeCover: 'Cambiar Portada'
    },
    en: {
      title: 'New Zone',
      idLabel: 'Identifier',
      idPlaceholder: 'Location name',
      suggestTip: 'Suggest name with IA',
      rangeLabel: 'Geographic Range',
      audioTitle: 'Audio Setup',
      audioDesc: 'Custom music and cover',
      uploadAudio: 'Upload Audio',
      uploadCover: 'Upload Cover',
      optional: '(Optional)',
      saveBtn: 'Save Changes',
      changeCover: 'Change Cover'
    },
    pt: {
      title: 'Nova Zona',
      idLabel: 'Identificador',
      idPlaceholder: 'Nome do local',
      suggestTip: 'Sugerir nome com IA',
      rangeLabel: 'Alcance Geográfico',
      audioTitle: 'Configuração de Áudio',
      audioDesc: 'Música e capa personalizada',
      uploadAudio: 'Carregar Áudio',
      uploadCover: 'Carregar Capa',
      optional: '(Opcional)',
      saveBtn: 'Salvar Alterações',
      changeCover: 'Mudar Capa'
    }
  }[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMusicFile(e.target.files[0]);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGeminiSuggestion = async () => {
    setIsGenerating(true);
    try {
      const details = await generateZoneDetails(location.lat, location.lng);
      setName(details.suggestedName);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!name || !musicFile) return;

    const newZone: Zone = {
      id: Date.now().toString(),
      name,
      center: location,
      radius,
      music: {
        file: musicFile,
        url: URL.createObjectURL(musicFile),
        name: musicFile.name,
        coverUrl: coverImage || undefined
      },
    };

    onSave(newZone);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className={`${uiStyle === 'pixel' ? (uiTheme === 'light' ? 'bg-[#fdf8f5]' : 'bg-[#1a1c1e]') : uiStyle === 'liquid-glass' ? (uiTheme === 'light' ? 'bg-white/40 backdrop-blur-2xl' : 'bg-white/5 backdrop-blur-2xl') : (uiTheme === 'light' ? 'bg-[#f5f5f5]' : 'bg-[#121212]')} border ${uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col gap-4 sm:gap-6 animate-in slide-in-from-bottom-20 duration-500 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar`}>
        
        <div className="flex justify-between items-center">
          <h2 className={`text-xl sm:text-2xl font-black ${uiTheme === 'light' ? 'text-black' : 'text-white'} tracking-tighter`}>
            {t.title}
          </h2>
          <button onClick={onCancel} className={`p-2 ${uiStyle === 'pixel' ? 'bg-primary/20 text-primary' : uiStyle === 'liquid-glass' ? 'bg-white/10 text-white' : (uiTheme === 'light' ? 'hover:bg-black/5 text-black/40' : 'hover:bg-[#282828] text-[#B3B3B3]')} rounded-full transition-colors`}>
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label className={`text-[9px] sm:text-[10px] ${uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} font-black uppercase tracking-[0.2em]`}>{t.idLabel}</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.idPlaceholder}
                className={`flex-1 ${uiStyle === 'pixel' ? (uiTheme === 'light' ? 'bg-primary/10 text-black' : 'bg-primary/5 text-white') : uiStyle === 'liquid-glass' ? (uiTheme === 'light' ? 'bg-white/20 text-black' : 'bg-white/5 text-white') : (uiTheme === 'light' ? 'bg-black/5 text-black placeholder:text-black/20' : 'bg-[#282828] text-white placeholder:text-[#535353]')} border-none rounded-2xl p-3 sm:p-4 text-sm sm:text-base focus:ring-2 focus:ring-primary outline-none font-bold`}
              />
              <button 
                onClick={handleGeminiSuggestion}
                disabled={isGenerating}
                className={`${uiStyle === 'pixel' ? 'bg-primary/20 hover:bg-primary/30' : uiStyle === 'liquid-glass' ? 'bg-white/10 hover:bg-white/20 text-primary' : (uiTheme === 'light' ? 'bg-black/5 hover:bg-black/10' : 'bg-[#282828] hover:bg-[#3e3e3e]')} p-3 sm:p-4 rounded-2xl text-primary disabled:opacity-50 transition-all border ${uiTheme === 'light' ? 'border-black/5' : 'border-white/5'}`}
                title={t.suggestTip}
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" fill="currentColor" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className={`text-[9px] sm:text-[10px] ${uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} font-black uppercase tracking-[0.2em] flex justify-between`}>
              <span>{t.rangeLabel}</span>
              <span className="text-primary">{radius}m</span>
            </label>
            <input 
              type="range" 
              min="5" 
              max="300" 
              step="5"
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))}
              className={`w-full h-1 ${uiTheme === 'light' ? 'bg-black/10' : 'bg-[#282828]'} rounded-lg appearance-none cursor-pointer accent-primary`}
            />
          </div>

          <div className={`${uiStyle === 'pixel' ? (uiTheme === 'light' ? 'bg-primary/10' : 'bg-primary/5') : uiStyle === 'liquid-glass' ? (uiTheme === 'light' ? 'bg-white/20' : 'bg-white/5') : (uiTheme === 'light' ? 'bg-black/5' : 'bg-[#181818]')} p-4 sm:p-6 rounded-3xl border ${uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} space-y-3 sm:space-y-4`}>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${uiStyle === 'pixel' ? 'bg-primary/30' : 'bg-primary'} rounded-xl flex items-center justify-center shrink-0`}>
                    <Music className={`${uiStyle === 'pixel' ? 'text-primary' : 'text-black'} w-4 h-4 sm:w-5 sm:h-5`} />
                </div>
                <div>
                    <h4 className={`text-xs sm:text-sm font-black ${uiTheme === 'light' ? 'text-black' : 'text-white'} uppercase tracking-tight`}>{t.audioTitle}</h4>
                    <p className={`text-[9px] sm:text-[10px] ${uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} font-bold`}>{t.audioDesc}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="relative group">
                    <input 
                      type="file" 
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`h-full flex flex-col items-center gap-2 p-3 sm:p-4 ${uiStyle === 'pixel' ? 'bg-primary/10' : uiStyle === 'liquid-glass' ? 'bg-white/10' : (uiTheme === 'light' ? 'bg-black/5' : 'bg-[#282828]')} rounded-2xl border border-transparent group-hover:border-primary transition-all text-center justify-center min-h-[80px] sm:min-h-[100px]`}>
                      <Upload className={`w-4 h-4 sm:w-5 sm:h-5 ${uiTheme === 'light' ? 'text-black/20' : 'text-[#B3B3B3]'}`} />
                      <div className={`text-[9px] sm:text-[10px] font-bold ${uiTheme === 'light' ? 'text-black' : 'text-white'} line-clamp-2`}>
                        {musicFile ? musicFile.name : t.uploadAudio}
                      </div>
                    </div>
                </div>

                <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`h-full flex flex-col items-center gap-2 p-3 sm:p-4 ${uiStyle === 'pixel' ? 'bg-primary/10' : uiStyle === 'liquid-glass' ? 'bg-white/10' : (uiTheme === 'light' ? 'bg-black/5' : 'bg-[#282828]')} rounded-2xl border border-transparent group-hover:border-primary transition-all text-center justify-center relative overflow-hidden min-h-[80px] sm:min-h-[100px]`}>
                      {coverImage ? (
                        <img src={coverImage} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Cover preview" />
                      ) : (
                        <ImageIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${uiTheme === 'light' ? 'text-black/20' : 'text-[#B3B3B3]'}`} />
                      )}
                      <div className={`text-[9px] sm:text-[10px] font-bold ${uiTheme === 'light' ? 'text-black' : 'text-white'} relative z-20`}>
                        {coverImage ? t.changeCover : (
                          <div className="flex flex-col">
                            <span>{t.uploadCover}</span>
                            <span className="opacity-60 text-[7px] sm:text-[8px]">{t.optional}</span>
                          </div>
                        )}
                      </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={!name || !musicFile}
          className={`w-full ${uiStyle === 'pixel' ? 'bg-primary text-black' : 'bg-primary text-black'} hover:brightness-110 font-black py-3.5 sm:py-4 rounded-full transition-all duration-200 disabled:opacity-30 disabled:grayscale active:scale-95 shadow-xl shadow-primary/20 uppercase tracking-widest text-xs sm:text-sm`}
        >
          {t.saveBtn}
        </button>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${uiTheme === 'light' ? 'rgba(0,0,0,0.1)' : '#282828'}; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ZoneModal;
