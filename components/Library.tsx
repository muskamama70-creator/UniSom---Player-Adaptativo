
import React from 'react';
import { Song } from '../types';

interface LibraryProps {
  playlist: Song[];
  currentSongIndex: number;
  onSelectSong: (index: number) => void;
  onAddFiles: (files: FileList) => void;
}

const Library: React.FC<LibraryProps> = ({ playlist, currentSongIndex, onSelectSong, onAddFiles }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
    }
  };

  return (
    <div className="w-full mt-8 bg-slate-900 rounded-3xl border border-slate-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
          <i className="fa-solid fa-compact-disc text-blue-500"></i>
          Sua Biblioteca
        </h3>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-4 py-2 rounded-xl transition-all text-sm font-semibold"
        >
          <i className="fa-solid fa-plus"></i>
          Adicionar
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="audio/*" 
          multiple 
          onChange={handleFileChange}
        />
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {playlist.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <i className="fa-solid fa-folder-open text-3xl mb-3 block"></i>
            <p>Sua biblioteca está vazia.</p>
          </div>
        ) : (
          playlist.map((song, index) => (
            <button
              key={song.id}
              onClick={() => onSelectSong(index)}
              className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all border ${
                index === currentSongIndex 
                  ? 'bg-blue-600/10 border-blue-500/50' 
                  : 'bg-slate-800/40 border-transparent hover:bg-slate-800'
              }`}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                <img src={song.cover} alt={song.title} className="w-full h-full object-cover" />
                {index === currentSongIndex && (
                  <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                    <div className="flex gap-1 items-end h-3">
                      <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 bg-white animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-grow text-left truncate">
                <p className={`font-bold text-sm truncate ${index === currentSongIndex ? 'text-blue-400' : 'text-slate-200'}`}>
                  {song.title}
                </p>
                <p className="text-xs text-slate-500 truncate">{song.artist}</p>
              </div>
              {index === currentSongIndex && (
                <div className="text-blue-500">
                  <i className="fa-solid fa-volume-high"></i>
                </div>
              )}
            </button>
          ))
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default Library;
