
import React, { useState } from 'react';
import { AppSettings, Language, Zone, MusicTrack } from '../types';
import { X, Palette, Globe, User, ChevronRight, Volume2, Image as ImageIcon, Edit3, VolumeX, Volume1, MapPin, Trash2, Music, Waves, ArrowUpRight, ArrowDownRight, MoveHorizontal, Repeat } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onClose: () => void;
  zones: Zone[];
  onDeleteZone: (id: string) => void;
  onUpdateZone: (zone: Zone) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  settings, 
  onUpdate, 
  onClose, 
  zones, 
  onDeleteZone, 
  onUpdateZone 
}) => {
  const [activeTab, setActiveTab] = useState<'root' | 'appearance' | 'language' | 'volume' | 'profile' | 'locations'>('root');

  const t = {
    es: {
      settings: 'Ajustes',
      appearance: 'Apariencia',
      language: 'Idioma',
      profile: 'Perfil',
      volumeTitle: 'Control de Volumen',
      locationsTitle: 'Ubicaciones Activas',
      user: 'Usuario MusicMaps',
      editProfile: 'Editar Perfil',
      customization: 'Personalización',
      accentColor: 'Color de Acento',
      uiTheme: 'Tema de la Interfaz',
      mapTheme: 'Tema del Mapa',
      themeDark: 'Oscuro',
      themeLight: 'Claro',
      uiStyle: 'Estilo de Interfaz',
      styleClassic: 'Clásico',
      stylePixel: 'Google Pixel (Adaptativo)',
      uiColorDesc: 'Cambia el color de la interfaz',
      langDesc: 'Selecciona tu lengua preferida',
      volumeDesc: 'Ajusta el nivel de sonido',
      locationsDesc: 'Gestiona tus zonas con música',
      userNameLabel: 'Nombre de Usuario',
      userNamePlaceholder: 'Escribe tu nombre...',
      profileInfo: 'Tu perfil es solo para personalización local. No se mostrará en el reproductor de música.',
      close: 'Cerrar Ajustes',
      back: 'Volver',
      volumeLabel: 'Volumen Maestro',
      mute: 'Silencio',
      noLocations: 'No tienes ubicaciones configuradas.',
      changeMusic: 'Cambiar música',
      changeCover: 'Cambiar portada',
      delete: 'Eliminar',
      track: 'Pista',
      noMusic: 'Sin música',
      radius: 'Radio',
      fadeOutTitle: 'Desvanecimiento al salir',
      fadeOutDesc: 'Baja el volumen suavemente',
      fadeInTitle: 'Entrada al ingresar',
      fadeInDesc: 'Sube el volumen suavemente',
      crossfadeTitle: 'Bucle Crossfade',
      crossfadeDesc: 'Bucle sin pausas (solapado)',
      durationLabel: 'Duración',
      rangeAdjust: 'Ajustar Rango'
    },
    en: {
      settings: 'Settings',
      appearance: 'Appearance',
      language: 'Language',
      profile: 'Profile',
      volumeTitle: 'Volume Control',
      locationsTitle: 'Active Locations',
      user: 'MusicMaps User',
      editProfile: 'Edit Profile',
      customization: 'Customization',
      accentColor: 'Accent Color',
      uiTheme: 'UI Theme',
      mapTheme: 'Map Theme',
      themeDark: 'Dark',
      themeLight: 'Light',
      uiStyle: 'UI Style',
      styleClassic: 'Classic',
      stylePixel: 'Google Pixel (Adaptive)',
      uiColorDesc: 'Change UI accent color',
      langDesc: 'Select your preferred language',
      volumeDesc: 'Adjust sound levels',
      locationsDesc: 'Manage your music zones',
      userNameLabel: 'User Name',
      userNamePlaceholder: 'Type your name...',
      profileInfo: 'Your profile is for local personalization only. It will not be shown on the music player.',
      close: 'Close Settings',
      back: 'Back',
      volumeLabel: 'Master Volume',
      mute: 'Mute',
      noLocations: 'You have no locations configured.',
      changeMusic: 'Change music',
      changeCover: 'Change cover',
      delete: 'Delete',
      track: 'Track',
      noMusic: 'No music',
      radius: 'Radius',
      fadeOutTitle: 'Fade out on exit',
      fadeOutDesc: 'Lower volume smoothly',
      fadeInTitle: 'Fade in on entry',
      fadeInDesc: 'Raise volume smoothly',
      crossfadeTitle: 'Crossfade Loop',
      crossfadeDesc: 'Gapless loop (overlapping)',
      durationLabel: 'Duration',
      rangeAdjust: 'Adjust Range'
    },
    pt: {
      settings: 'Ajustes',
      appearance: 'Aparência',
      language: 'Idioma',
      profile: 'Perfil',
      volumeTitle: 'Controle de Volume',
      locationsTitle: 'Locais Ativos',
      user: 'Usuário MusicMaps',
      editProfile: 'Editar Perfil',
      customization: 'Personalização',
      accentColor: 'Cor de Destaque',
      uiTheme: 'Tema da Interface',
      mapTheme: 'Tema do Mapa',
      themeDark: 'Escuro',
      themeLight: 'Claro',
      uiStyle: 'Estilo da Interface',
      styleClassic: 'Clássico',
      stylePixel: 'Google Pixel (Adaptativo)',
      uiColorDesc: 'Altere a cor da interface',
      langDesc: 'Selecione seu idioma preferido',
      volumeDesc: 'Ajuste o nível de som',
      locationsDesc: 'Gerencie suas zonas de música',
      userNameLabel: 'Nome de Usuário',
      userNamePlaceholder: 'Digite seu nombre...',
      profileInfo: 'Seu perfil é apenas para personalización local. Não será mostrado no player de música.',
      close: 'Fechar Ajustes',
      back: 'Voltar',
      volumeLabel: 'Volume Mestre',
      mute: 'Mudo',
      noLocations: 'Você não tem locais configurados.',
      changeMusic: 'Mudar música',
      changeCover: 'Mudar capa',
      delete: 'Excluir',
      track: 'Faixa',
      noMusic: 'Sem música',
      radius: 'Raio',
      fadeOutTitle: 'Desvanecimento ao sair',
      fadeOutDesc: 'Baixar volume suavemente',
      fadeInTitle: 'Entrada ao ingressar',
      fadeInDesc: 'Aumentar volume suavemente',
      crossfadeTitle: 'Loop Crossfade',
      crossfadeDesc: 'Loop sem pausas (sobreposto)',
      durationLabel: 'Duração',
      rangeAdjust: 'Ajustar Alcance'
    }
  }[settings.language];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate({ ...settings, userImage: event.target?.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>, zone: Zone) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newTrack: MusicTrack = {
        ...(zone.music || { name: file.name, url: '', file }),
        file,
        url: URL.createObjectURL(file),
        name: file.name
      };
      onUpdateZone({ ...zone, music: newTrack });
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>, zone: Zone) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newTrack: MusicTrack = {
          ...(zone.music || { name: 'Track', url: '', file: new File([], 'temp') }),
          coverUrl: event.target?.result as string
        };
        onUpdateZone({ ...zone, music: newTrack });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>, zone: Zone) => {
    const newRadius = parseInt(e.target.value);
    onUpdateZone({ ...zone, radius: newRadius });
  };

  const SamsungCard = ({ icon: Icon, title, description, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 ${settings.uiStyle === 'pixel' ? (settings.uiTheme === 'light' ? 'bg-primary/10 hover:bg-primary/20' : 'bg-primary/5 hover:bg-primary/10') : (settings.uiTheme === 'light' ? 'bg-black/5 hover:bg-black/10' : 'bg-[#282828] hover:bg-[#333]')} active:scale-[0.98] transition-all rounded-2xl mb-2 text-left`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 ${settings.uiStyle === 'pixel' ? 'bg-primary/20' : (settings.uiTheme === 'light' ? 'bg-black/5' : 'bg-white/5')} rounded-full flex items-center justify-center text-primary`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className={`text-sm font-bold ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'}`}>{title}</h3>
          <p className={`text-[10px] ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} font-medium`}>{description}</p>
        </div>
      </div>
      <ChevronRight size={16} className={settings.uiTheme === 'light' ? 'text-black/20' : 'text-[#B3B3B3]'} />
    </button>
  );

  const colors = [
    '#1DB954', '#1ed760', '#76FF03', '#00E5FF', 
    '#FF0000', '#FF4081', '#E91E63', '#FF5252',
    '#3D5AFE', '#2979FF', '#D500F9', '#6200EA',
    '#FFD600', '#FFC107', '#FF9100', '#FF6D00',
    '#A1887F', '#8D6E63', '#795548', '#5D4037',
    '#607D8B', '#455A64', '#CFD8DC', '#FFFFFF'
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-300">
      <div className={`${settings.uiStyle === 'pixel' ? (settings.uiTheme === 'light' ? 'bg-[#fdf8f5]' : 'bg-[#1a1c1e]') : (settings.uiTheme === 'light' ? 'bg-[#f5f5f5]' : 'bg-[#121212]')} border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} w-full sm:max-w-md rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.8)] flex flex-col h-[90vh] sm:h-[85vh]`}>
        
        <div className="p-4 sm:p-6 pb-2 flex justify-between items-center">
            <h2 className={`text-lg sm:text-xl font-black ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'} tracking-tight`}>
              {activeTab === 'root' ? t.settings : 
               activeTab === 'appearance' ? t.appearance :
               activeTab === 'language' ? t.language :
               activeTab === 'profile' ? t.profile : 
               activeTab === 'locations' ? t.locationsTitle : t.volumeTitle}
            </h2>
            <button 
              onClick={activeTab === 'root' ? onClose : () => setActiveTab('root')} 
              className={`p-2 ${settings.uiStyle === 'pixel' ? 'bg-primary/20 text-primary' : (settings.uiTheme === 'light' ? 'bg-black/5 hover:bg-black/10 text-black' : 'bg-[#282828] hover:bg-[#333] text-white')} rounded-full transition-colors`}
            >
              <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
          {activeTab === 'root' && (
            <div className="space-y-3 sm:space-y-4">
              <div className={`p-4 ${settings.uiTheme === 'light' ? 'bg-primary/5' : 'bg-primary/10'} rounded-3xl border border-primary/20 flex items-center gap-4 mb-4`}>
                 <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ${settings.uiTheme === 'light' ? 'bg-black/5' : 'bg-[#282828]'} border-2 border-primary shrink-0`}>
                    {settings.userImage ? (
                      <img src={settings.userImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${settings.uiTheme === 'light' ? 'text-black/20' : 'text-[#B3B3B3]'}`}>
                        <User size={28} sm:size={32} />
                      </div>
                    )}
                 </div>
                 <div className="min-w-0 flex-1">
                    <h3 className={`font-bold ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'} truncate text-sm sm:text-base`}>{settings.userName}</h3>
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className="text-[9px] sm:text-[10px] font-black uppercase text-primary tracking-widest mt-1"
                    >
                      {t.editProfile}
                    </button>
                 </div>
              </div>

              <SamsungCard icon={MapPin} title={t.locationsTitle} description={t.locationsDesc} onClick={() => setActiveTab('locations')} />
              <SamsungCard icon={Palette} title={t.appearance} description={t.uiColorDesc} onClick={() => setActiveTab('appearance')} />
              <SamsungCard icon={Globe} title={t.language} description={t.langDesc} onClick={() => setActiveTab('language')} />
              <SamsungCard icon={Volume2} title={t.volumeTitle} description={t.volumeDesc} onClick={() => setActiveTab('volume')} />
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="space-y-4">
              {zones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className={`w-20 h-20 ${settings.uiTheme === 'light' ? 'bg-black/5 text-black/20' : 'bg-[#282828] text-[#535353]'} rounded-full flex items-center justify-center`}>
                    <MapPin size={40} />
                  </div>
                  <p className={`text-sm font-bold ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'}`}>{t.noLocations}</p>
                </div>
              ) : (
                zones.map(zone => (
                  <div key={zone.id} className={`${settings.uiTheme === 'light' ? 'bg-white' : 'bg-[#282828]'} rounded-3xl p-5 border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} space-y-4`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl overflow-hidden ${settings.uiTheme === 'light' ? 'bg-black/5 border-black/5' : 'bg-[#181818] border-white/10'} border shrink-0`}>
                           {zone.music?.coverUrl ? (
                             <img src={zone.music.coverUrl} className="w-full h-full object-cover" alt="Zone Art" />
                           ) : (
                             <div className={`w-full h-full flex items-center justify-center ${settings.uiTheme === 'light' ? 'text-black/20' : 'text-[#535353]'}`}>
                               <MapPin size={24} />
                             </div>
                           )}
                        </div>
                        <div className="min-w-0">
                          <h4 className={`font-black ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'} text-sm truncate`}>{zone.name}</h4>
                          <p className={`text-[10px] ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} font-bold`}>{t.radius}: {zone.radius}m</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onDeleteZone(zone.id)}
                        className="p-2 text-[#FF4B4B] hover:bg-[#FF4B4B]/10 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Range adjustment slider for existing zones */}
                    <div className={`${settings.uiTheme === 'light' ? 'bg-black/5' : 'bg-[#181818]'} p-3 rounded-2xl border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} space-y-2`}>
                      <div className={`flex justify-between items-center text-[10px] font-black uppercase tracking-widest ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'}`}>
                        <div className="flex items-center gap-2">
                          <MoveHorizontal size={12} className="text-primary" />
                          <span>{t.rangeAdjust}</span>
                        </div>
                        <span className="text-primary">{zone.radius}m</span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="300" 
                        step="5"
                        value={zone.radius} 
                        onChange={(e) => handleRadiusChange(e, zone)}
                        className={`w-full h-1 ${settings.uiTheme === 'light' ? 'bg-black/10' : 'bg-[#282828]'} rounded-full appearance-none cursor-pointer accent-primary`}
                        style={{ accentColor: settings.primaryColor }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <label className={`flex items-center justify-center gap-2 p-3 ${settings.uiTheme === 'light' ? 'bg-black/5 text-black/40 hover:text-black' : 'bg-[#181818] text-[#B3B3B3] hover:text-white'} rounded-2xl text-[10px] font-black uppercase tracking-widest border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} cursor-pointer`}>
                          <Music size={14} /> {t.changeMusic}
                          <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleMusicChange(e, zone)} />
                        </label>
                        <label className={`flex items-center justify-center gap-2 p-3 ${settings.uiTheme === 'light' ? 'bg-black/5 text-black/40 hover:text-black' : 'bg-[#181818] text-[#B3B3B3] hover:text-white'} rounded-2xl text-[10px] font-black uppercase tracking-widest border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} cursor-pointer`}>
                          <ImageIcon size={14} /> {t.changeCover}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCoverChange(e, zone)} />
                        </label>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className={`${settings.uiStyle === 'pixel' ? (settings.uiTheme === 'light' ? 'bg-primary/5' : 'bg-primary/5') : (settings.uiTheme === 'light' ? 'bg-black/5' : 'bg-[#282828]')} p-6 rounded-3xl`}>
                <label className={`text-xs font-black uppercase ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} block mb-4`}>{t.uiTheme}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onUpdate({ ...settings, uiTheme: 'dark' })}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${settings.uiStyle === 'pixel' ? (settings.uiTheme === 'dark' ? 'border-primary bg-primary/20' : 'border-transparent bg-primary/5') : (settings.uiTheme === 'dark' ? 'border-primary bg-primary/10' : (settings.uiTheme === 'light' ? 'border-black/5 bg-black/5' : 'border-white/5 bg-[#181818]'))}`}
                  >
                    <div className="w-full h-12 bg-[#121212] rounded-lg border border-white/10" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'}`}>{t.themeDark}</span>
                  </button>
                  <button 
                    onClick={() => onUpdate({ ...settings, uiTheme: 'light' })}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${settings.uiStyle === 'pixel' ? (settings.uiTheme === 'light' ? 'border-primary bg-primary/20' : 'border-transparent bg-primary/5') : (settings.uiTheme === 'light' ? 'border-primary bg-primary/10' : (settings.uiTheme === 'light' ? 'border-black/5 bg-black/5' : 'border-white/5 bg-[#181818]'))}`}
                  >
                    <div className="w-full h-12 bg-[#f5f5f5] rounded-lg border border-black/10" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'}`}>{t.themeLight}</span>
                  </button>
                </div>
              </div>

              <div className={`${settings.uiStyle === 'pixel' ? (settings.uiTheme === 'light' ? 'bg-primary/5' : 'bg-primary/5') : (settings.uiTheme === 'light' ? 'bg-black/5' : 'bg-[#282828]')} p-6 rounded-3xl`}>
                <label className={`text-xs font-black uppercase ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} block mb-4`}>{t.mapTheme}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onUpdate({ ...settings, mapTheme: 'dark' })}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${settings.uiStyle === 'pixel' ? (settings.mapTheme === 'dark' ? 'border-primary bg-primary/20' : 'border-transparent bg-primary/5') : (settings.mapTheme === 'dark' ? 'border-primary bg-primary/10' : (settings.uiTheme === 'light' ? 'border-black/5 bg-black/5' : 'border-white/5 bg-[#181818]'))}`}
                  >
                    <div className="w-full h-12 bg-[#242424] rounded-lg border border-white/10" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'}`}>{t.themeDark}</span>
                  </button>
                  <button 
                    onClick={() => onUpdate({ ...settings, mapTheme: 'light' })}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${settings.uiStyle === 'pixel' ? (settings.mapTheme === 'light' ? 'border-primary bg-primary/20' : 'border-transparent bg-primary/5') : (settings.mapTheme === 'light' ? 'border-primary bg-primary/10' : (settings.uiTheme === 'light' ? 'border-black/5 bg-black/5' : 'border-white/5 bg-[#181818]'))}`}
                  >
                    <div className="w-full h-12 bg-white rounded-lg border border-white/10" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'}`}>{t.themeLight}</span>
                  </button>
                </div>
              </div>

              <div className={`${settings.uiStyle === 'pixel' ? (settings.uiTheme === 'light' ? 'bg-primary/5' : 'bg-primary/5') : (settings.uiTheme === 'light' ? 'bg-black/5' : 'bg-[#282828]')} p-6 rounded-3xl`}>
                <label className={`text-xs font-black uppercase ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} block mb-4`}>{t.uiStyle}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onUpdate({ ...settings, uiStyle: 'classic' })}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${settings.uiStyle === 'pixel' ? (settings.uiStyle === 'classic' ? 'border-primary bg-primary/20' : 'border-transparent bg-primary/5') : (settings.uiStyle === 'classic' ? 'border-primary bg-primary/10' : (settings.uiTheme === 'light' ? 'border-black/5 bg-black/5' : 'border-white/5 bg-[#181818]'))}`}
                  >
                    <div className="w-full h-12 flex items-center justify-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-primary" />
                      <div className="w-8 h-2 rounded-full bg-gray-500" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'}`}>{t.styleClassic}</span>
                  </button>
                  <button 
                    onClick={() => onUpdate({ ...settings, uiStyle: 'pixel' })}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${settings.uiStyle === 'pixel' && settings.uiStyle === 'pixel' ? 'border-primary bg-primary/20' : (settings.uiStyle === 'pixel' ? 'border-transparent bg-primary/5' : (settings.uiTheme === 'light' ? 'border-black/5 bg-black/5' : 'border-white/5 bg-[#181818]'))}`}
                  >
                    <div className="w-full h-12 flex items-center justify-center gap-1">
                      <div className="w-6 h-6 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'}`}>{t.stylePixel}</span>
                  </button>
                </div>
              </div>

              <div className={`${settings.uiTheme === 'light' ? 'bg-black/5' : 'bg-[#282828]'} p-6 rounded-3xl`}>
                <label className={`text-xs font-black uppercase ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} block mb-4`}>{t.accentColor}</label>
                <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                  {colors.map(c => (
                    <button 
                      key={c} 
                      onClick={() => onUpdate({ ...settings, primaryColor: c })} 
                      className={`w-full aspect-square rounded-2xl border-4 transition-transform active:scale-90 ${settings.primaryColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent shadow-sm'}`} 
                      style={{ backgroundColor: c }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-2">
              {(['es', 'en', 'pt'] as Language[]).map(lang => (
                <button key={lang} onClick={() => onUpdate({ ...settings, language: lang })} className={`w-full p-4 rounded-2xl flex items-center justify-between ${settings.language === lang ? 'bg-primary text-black' : (settings.uiTheme === 'light' ? 'bg-black/5 text-black hover:bg-black/10' : 'bg-[#282828] text-white hover:bg-[#333]')}`}>
                  <span className="font-bold uppercase tracking-wider">{lang === 'es' ? 'Español' : lang === 'en' ? 'English' : 'Português'}</span>
                  {settings.language === lang && <div className={`w-2 h-2 rounded-full ${settings.uiTheme === 'light' ? 'bg-black' : 'bg-black'}`} />}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-8 flex flex-col items-center">
              <div className="relative">
                <div className={`w-32 h-32 rounded-full overflow-hidden ${settings.uiTheme === 'light' ? 'bg-black/5' : 'bg-[#282828]'} border-4 border-primary shadow-2xl`}>
                  {settings.userImage ? <img src={settings.userImage} className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center ${settings.uiTheme === 'light' ? 'text-black/20' : 'text-[#B3B3B3]'}`}><User size={64} /></div>}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-black cursor-pointer shadow-lg">
                   <ImageIcon size={20} /><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <div className="w-full space-y-2">
                <label className={`text-[10px] font-black uppercase ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} ml-2`}>{t.userNameLabel}</label>
                <input type="text" value={settings.userName} onChange={(e) => onUpdate({ ...settings, userName: e.target.value })} className={`w-full ${settings.uiTheme === 'light' ? 'bg-black/5 text-black' : 'bg-[#282828] text-white'} border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none font-bold`} placeholder={t.userNamePlaceholder} />
              </div>
              <p className={`text-xs ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} text-center px-6`}>{t.profileInfo}</p>
            </div>
          )}

          {activeTab === 'volume' && (
            <div className="space-y-4 py-2">
               {/* Crossfade Setting Card */}
               <div className={`${settings.uiTheme === 'light' ? 'bg-white' : 'bg-[#282828]'} p-5 rounded-3xl border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Repeat size={20} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-black ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'} uppercase tracking-tight`}>{t.crossfadeTitle}</h4>
                        <p className={`text-[10px] ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} font-bold`}>{t.crossfadeDesc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onUpdate({ ...settings, enableCrossfade: !settings.enableCrossfade })}
                      className={`w-12 h-6 rounded-full transition-all relative ${settings.enableCrossfade ? 'bg-primary' : (settings.uiTheme === 'light' ? 'bg-black/10' : 'bg-[#181818]')}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.enableCrossfade ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  {settings.enableCrossfade && (
                    <div className={`space-y-2 pt-2 border-t ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'}`}>
                      <div className={`flex justify-between text-[10px] font-black ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} uppercase tracking-widest`}>
                        <span>{t.durationLabel}</span>
                        <span className="text-primary">{settings.crossfadeDuration}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        step="1" 
                        value={settings.crossfadeDuration} 
                        onChange={(e) => onUpdate({ ...settings, crossfadeDuration: parseFloat(e.target.value) })}
                        className={`w-full h-1.5 ${settings.uiTheme === 'light' ? 'bg-black/10' : 'bg-[#181818]'} rounded-full appearance-none cursor-pointer accent-primary`}
                      />
                    </div>
                  )}
               </div>

               {/* Fade In Setting Card */}
               <div className={`${settings.uiTheme === 'light' ? 'bg-white' : 'bg-[#282828]'} p-5 rounded-3xl border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <ArrowUpRight size={20} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-black ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'} uppercase tracking-tight`}>{t.fadeInTitle}</h4>
                        <p className={`text-[10px] ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} font-bold`}>{t.fadeInDesc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onUpdate({ ...settings, enableFadeIn: !settings.enableFadeIn })}
                      className={`w-12 h-6 rounded-full transition-all relative ${settings.enableFadeIn ? 'bg-primary' : (settings.uiTheme === 'light' ? 'bg-black/10' : 'bg-[#181818]')}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.enableFadeIn ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  {settings.enableFadeIn && (
                    <div className={`space-y-2 pt-2 border-t ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'}`}>
                      <div className={`flex justify-between text-[10px] font-black ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} uppercase tracking-widest`}>
                        <span>{t.durationLabel}</span>
                        <span className="text-primary">{settings.fadeInDuration}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="5" 
                        step="0.5" 
                        value={settings.fadeInDuration} 
                        onChange={(e) => onUpdate({ ...settings, fadeInDuration: parseFloat(e.target.value) })}
                        className={`w-full h-1.5 ${settings.uiTheme === 'light' ? 'bg-black/10' : 'bg-[#181818]'} rounded-full appearance-none cursor-pointer accent-primary`}
                      />
                    </div>
                  )}
               </div>

               {/* Fade Out Setting Card */}
               <div className={`${settings.uiTheme === 'light' ? 'bg-white' : 'bg-[#282828]'} p-5 rounded-3xl border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <ArrowDownRight size={20} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-black ${settings.uiTheme === 'light' ? 'text-black' : 'text-white'} uppercase tracking-tight`}>{t.fadeOutTitle}</h4>
                        <p className={`text-[10px] ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} font-bold`}>{t.fadeOutDesc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onUpdate({ ...settings, enableFadeOut: !settings.enableFadeOut })}
                      className={`w-12 h-6 rounded-full transition-all relative ${settings.enableFadeOut ? 'bg-primary' : (settings.uiTheme === 'light' ? 'bg-black/10' : 'bg-[#181818]')}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.enableFadeOut ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  {settings.enableFadeOut && (
                    <div className={`space-y-2 pt-2 border-t ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'}`}>
                      <div className={`flex justify-between text-[10px] font-black ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} uppercase tracking-widest`}>
                        <span>{t.durationLabel}</span>
                        <span className="text-primary">{settings.fadeOutDuration}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="5" 
                        step="0.5" 
                        value={settings.fadeOutDuration} 
                        onChange={(e) => onUpdate({ ...settings, fadeOutDuration: parseFloat(e.target.value) })}
                        className={`w-full h-1.5 ${settings.uiTheme === 'light' ? 'bg-black/10' : 'bg-[#181818]'} rounded-full appearance-none cursor-pointer accent-primary`}
                      />
                    </div>
                  )}
               </div>

               {/* Master Volume Card */}
               <div className={`${settings.uiTheme === 'light' ? 'bg-white' : 'bg-[#282828]'} p-6 rounded-[40px] flex flex-col items-center gap-6 border ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'} relative overflow-hidden`}>
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary/20"><div className="h-full bg-primary" style={{ width: `${settings.volume * 100}%` }} /></div>
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20">{settings.volume === 0 ? <VolumeX size={40} /> : settings.volume < 0.5 ? <Volume1 size={40} /> : <Volume2 size={40} />}</div>
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center px-2"><span className={`text-[10px] font-black ${settings.uiTheme === 'light' ? 'text-black/40' : 'text-[#B3B3B3]'} uppercase tracking-widest`}>{t.volumeLabel}</span><span className="text-xl font-black text-primary">{Math.round(settings.volume * 100)}%</span></div>
                    <input type="range" min="0" max="1" step="0.01" value={settings.volume} onChange={(e) => onUpdate({ ...settings, volume: parseFloat(e.target.value) })} className={`w-full h-4 ${settings.uiTheme === 'light' ? 'bg-black/5' : 'bg-white/5'} rounded-full appearance-none cursor-pointer accent-primary`} />
                  </div>
               </div>

               <div className="flex gap-4">
                  <button onClick={() => onUpdate({ ...settings, volume: 0 })} className={`flex-1 py-4 ${settings.uiTheme === 'light' ? 'bg-black/5 text-black/40' : 'bg-[#282828] text-[#B3B3B3]'} rounded-2xl font-black text-xs uppercase`}>{t.mute}</button>
                  <button onClick={() => onUpdate({ ...settings, volume: 1 })} className={`flex-1 py-4 ${settings.uiTheme === 'light' ? 'bg-black/5' : 'bg-[#282828]'} text-primary rounded-2xl font-black text-xs uppercase`}>MAX</button>
               </div>
            </div>
          )}
        </div>

        <div className={`p-6 ${settings.uiTheme === 'light' ? 'bg-[#ebebeb]' : 'bg-[#181818]'} border-t ${settings.uiTheme === 'light' ? 'border-black/5' : 'border-white/5'}`}>
           <button onClick={activeTab === 'root' ? onClose : () => setActiveTab('root')} className="w-full py-4 bg-primary text-black font-black rounded-full uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all">
             {activeTab === 'root' ? t.close : t.back}
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
