
export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string;
}

export enum GuardianStatus {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  ALERTING = 'ALERTING',
  VOICE_DETECTION = 'VOICE_DETECTION'
}

export interface GuardianConfig {
  userName: string;
  sensitivity: number;
  adaptiveVolume: boolean;
  voiceHighlight: boolean;
  monoMix: boolean;
}

export interface AlertLog {
  id: string;
  timestamp: Date;
  type: 'NAME' | 'VOICE';
  message: string;
}
