
import React, { useState, useEffect, useRef } from 'react';
import { Song, GuardianStatus, GuardianConfig } from './types';
import { audioEngine } from './services/audioService';
import { guardianAI } from './services/geminiService';
import Visualizer from './components/Visualizer';
import SettingsModal from './components/SettingsModal';
import Library from './components/Library';

const DEFAULT_PLAYLIST: Song[] = [
  { id: '1', title: 'Midnight City', artist: 'M83', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: 'https://picsum.photos/seed/m83/300/300' },
  { id: '2', title: 'Starlight', artist: 'Muse', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: 'https://picsum.photos/seed/muse/300/300' },
  { id: '3', title: 'Solar Wind', artist: 'Astral Project', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: 'https://picsum.photos/seed/astral/300/300' },
];

const App: React.FC = () => {
  const [playlist, setPlaylist] = useState<Song[]>(DEFAULT_PLAYLIST);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [guardianStatus, setGuardianStatus] = useState<GuardianStatus>(GuardianStatus.IDLE);
  const [lastTranscript, setLastTranscript] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  const [config, setConfig] = useState<GuardianConfig>({
    userName: 'Usuário',
    sensitivity: 0.5,
    adaptiveVolume: true,
    voiceHighlight: true,
    monoMix: true,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentSong = playlist[currentSongIndex];

  // Initialize Audio Engine
  useEffect(() => {
    if (audioRef.current) {
      audioEngine.connectElement(audioRef.current);
    }
  }, []);

  // Sync settings with audio engine
  useEffect(() => {
    audioEngine.setVoiceHighlight(config.voiceHighlight);
    audioEngine.setMono(config.monoMix);
  }, [config.voiceHighlight, config.monoMix]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioEngine.resume();
      audioRef.current?.play().catch(err => {
        console.warn("Audio playback failed:", err);
        setIsPlaying(false);
      });
      
      // Start Guardian mode if idle
      if (guardianStatus === GuardianStatus.IDLE) {
        setGuardianStatus(GuardianStatus.LISTENING);
        guardianAI.startMonitoring(config.userName, {
          onVoice: (text) => {
            setLastTranscript(text);
            if (config.adaptiveVolume && text.length > 5) {
              handleDucking();
            }
          },
          onName: () => {
            handleNameAlert();
          }
        }).catch(err => console.error("Guardian AI start failed:", err));
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleDucking = () => {
    setGuardianStatus(GuardianStatus.VOICE_DETECTION);
    audioEngine.setVolume(0.3);
    setTimeout(() => {
      audioEngine.setVolume(1.0);
      setGuardianStatus(GuardianStatus.LISTENING);
    }, 4000);
  };

  const handleNameAlert = () => {
    setGuardianStatus(GuardianStatus.ALERTING);
    audioRef.current?.pause();
    setIsPlaying(false);
    setTimeout(() => {
       setGuardianStatus(GuardianStatus.LISTENING);
    }, 5000);
  };

  const skipNext = () => {
    const nextIndex = (currentSongIndex + 1) % playlist.length;
    setCurrentSongIndex(nextIndex);
    setIsPlaying(true);
    // Use timeout to ensure source is updated before playing
    setTimeout(() => audioRef.current?.play(), 0);
  };

  const skipPrev = () => {
    const prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    setCurrentSongIndex(prevIndex);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 0);
  };

  const selectSong = (index: number) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 0);
  };

  const handleAddLocalFiles = (files: FileList) => {
    const newSongs: Song[] = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      // Clean name: remove extension
      const title = file.name.replace(/\.[^/.]+$/, "");
      return {
        id: Math.random().toString(36).substr(2, 9),
        title: title,
        artist: 'Biblioteca Local',
        url: url,
        cover: `https://picsum.photos/seed/${title}/300/300`
      };
    });
    setPlaylist(prev => [...prev, ...newSongs]);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 md:p-12 max-w-lg mx-auto bg-slate-950 pb-20">
      
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-500">UniSom</h1>
          <p className="text-xs text-slate-400">Guardian AI Ativo</p>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition-all text-slate-200"
        >
          <i className="fa-solid fa-sliders"></i>
        </button>
      </div>

      {/* Main Player Card */}
      <div className="w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative">
        
        {/* Album Art */}
        <div className="aspect-square relative overflow-hidden bg-slate-800">
          <img 
            src={currentSong?.cover} 
            alt={currentSong?.title} 
            className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'scale-105' : 'scale-100 opacity-60'}`}
          />
          {guardianStatus === GuardianStatus.ALERTING && (
            <div className="absolute inset-0 bg-red-600/60 flex flex-col items-center justify-center animate-pulse">
              <i className="fa-solid fa-bell text-6xl mb-4"></i>
              <p className="text-xl font-bold uppercase tracking-widest">NOME DETECTADO</p>
            </div>
          )}
          {guardianStatus === GuardianStatus.VOICE_DETECTION && (
            <div className="absolute top-4 left-4 bg-blue-600/80 px-3 py-1 rounded-full text-xs font-bold animate-bounce flex items-center gap-2">
              <i className="fa-solid fa-microphone"></i> VOZ DETECTADA
            </div>
          )}
        </div>

        {/* Info & Controls */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white truncate">{currentSong?.title || "Sem Música"}</h2>
            <p className="text-slate-400">{currentSong?.artist || "Selecione um arquivo"}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-blue-500 h-full transition-all duration-300" 
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Player Buttons */}
          <div className="flex justify-between items-center mb-6">
            <button onClick={skipPrev} className="text-slate-400 hover:text-white transition-all p-2">
              <i className="fa-solid fa-backward-step text-2xl"></i>
            </button>
            <button 
              onClick={togglePlay}
              className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-500 hover:scale-105 transition-all shadow-lg shadow-blue-900/40"
            >
              <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-2xl ml-${isPlaying ? '0' : '1'}`}></i>
            </button>
            <button onClick={skipNext} className="text-slate-400 hover:text-white transition-all p-2">
              <i className="fa-solid fa-forward-step text-2xl"></i>
            </button>
          </div>

          <Visualizer analyzer={audioEngine.getAnalyzer()} color="#3b82f6" />
        </div>
      </div>

      {/* Environmental Monitor Status */}
      <div className="w-full mt-6 bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-2 h-2 rounded-full ${guardianStatus !== GuardianStatus.IDLE ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monitor Ambiente</span>
        </div>
        <div className="h-12 overflow-hidden flex items-end">
          {lastTranscript ? (
            <p className="text-sm italic text-slate-300 line-clamp-2">"...{lastTranscript}"</p>
          ) : (
            <p className="text-sm text-slate-600">Aguardando detecção de som...</p>
          )}
        </div>
      </div>

      {/* Library Management Section */}
      <Library 
        playlist={playlist} 
        currentSongIndex={currentSongIndex} 
        onSelectSong={selectSong} 
        onAddFiles={handleAddLocalFiles}
      />

      {/* Audio Hidden Element */}
      <audio 
        ref={audioRef}
        src={currentSong?.url}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={skipNext}
      />

      {/* Modals */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        config={config} 
        setConfig={setConfig} 
      />

      <div className="mt-8 text-center text-slate-500 text-xs px-4">
        Desenvolvido para acessibilidade auditiva unilateral. <br/> 
        O Guardian AI detecta fala e alerta sobre perigos ou chamados.
      </div>
    </div>
  );
};

export default App;
