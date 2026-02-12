
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export class GuardianAI {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private onVoiceDetected: (text: string) => void = () => {};
  private onNameDetected: () => void = () => {};

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  public async startMonitoring(
    userName: string, 
    callbacks: { onVoice: (t: string) => void, onName: () => void }
  ) {
    this.onVoiceDetected = callbacks.onVoice;
    this.onNameDetected = callbacks.onName;

    const systemInstruction = `
      Você é um assistente de segurança para uma pessoa com audição unilateral. 
      Sua tarefa é monitorar o som ambiente através do microfone.
      1. Se ouvir o nome "${userName}", responda IMEDIATAMENTE com a palavra "NOME_DETECTADO".
      2. Se detectar alguém iniciando uma conversa próxima ou falando diretamente com o usuário, relate brevemente o que foi dito.
      Mantenha as respostas curtas e focais.
    `;

    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => console.log("Guardian AI: Monitoramento ativado."),
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.inputTranscription) {
            const text = message.serverContent.inputTranscription.text.toLowerCase();
            if (text.includes(userName.toLowerCase())) {
              this.onNameDetected();
            }
            this.onVoiceDetected(text);
          }
        },
        onerror: (e) => console.error("Guardian AI Error:", e),
        onclose: () => console.log("Guardian AI: Monitoramento encerrado."),
      }
    });

    // Microphone setup for streaming
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = audioCtx.createMediaStreamSource(stream);
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = this.floatTo16BitPCM(inputData);
      const base64Data = this.encode(new Uint8Array(pcmData.buffer));
      
      this.sessionPromise?.then(session => {
        session.sendRealtimeInput({
          media: {
            data: base64Data,
            mimeType: 'audio/pcm;rate=16000'
          }
        });
      });
    };

    source.connect(processor);
    processor.connect(audioCtx.destination);
  }

  private floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  }

  private encode(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

export const guardianAI = new GuardianAI();
