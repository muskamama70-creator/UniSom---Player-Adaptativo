
import React from 'react';
import { GuardianConfig } from '../types';

interface SettingsModalProps {
  config: GuardianConfig;
  setConfig: (config: GuardianConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ config, setConfig, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Configurações Adaptativas</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Seu Nome (para detecção)</label>
            <input 
              type="text" 
              value={config.userName}
              onChange={(e) => setConfig({ ...config, userName: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Carlos"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mixagem Mono</p>
              <p className="text-xs text-slate-400 text-balance">Combina canais L e R para audição unilateral.</p>
            </div>
            <button 
              onClick={() => setConfig({ ...config, monoMix: !config.monoMix })}
              className={`w-12 h-6 rounded-full transition-colors relative ${config.monoMix ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${config.monoMix ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Destaque de Voz</p>
              <p className="text-xs text-slate-400 text-balance">Ajusta o equalizador para priorizar vozes humanas.</p>
            </div>
            <button 
              onClick={() => setConfig({ ...config, voiceHighlight: !config.voiceHighlight })}
              className={`w-12 h-6 rounded-full transition-colors relative ${config.voiceHighlight ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${config.voiceHighlight ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Volume Adaptativo</p>
              <p className="text-xs text-slate-400 text-balance">Abaixa a música ao detectar conversas externas.</p>
            </div>
            <button 
              onClick={() => setConfig({ ...config, adaptiveVolume: !config.adaptiveVolume })}
              className={`w-12 h-6 rounded-full transition-colors relative ${config.adaptiveVolume ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${config.adaptiveVolume ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition-all"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
