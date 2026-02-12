
import { Song } from '../types';

export class UniSomAudioEngine {
  private context: AudioContext;
  private source: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode;
  private filterNode: BiquadFilterNode;
  private merger: ChannelMergerNode;
  private analyzer: AnalyserNode;

  constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.context.createGain();
    this.filterNode = this.context.createBiquadFilter();
    this.merger = this.context.createChannelMerger(1);
    this.analyzer = this.context.createAnalyser();
    
    // Setup filter for human voice clarity (approx 1kHz - 4kHz)
    this.filterNode.type = 'peaking';
    this.filterNode.frequency.value = 2500;
    this.filterNode.Q.value = 1.0;
    this.filterNode.gain.value = 0; // Default: no boost

    // Standard routing
    this.gainNode.connect(this.filterNode);
    this.filterNode.connect(this.analyzer);
    this.analyzer.connect(this.context.destination);
  }

  public connectElement(element: HTMLAudioElement) {
    if (this.source) {
      this.source.disconnect();
    }
    this.source = this.context.createMediaElementSource(element);
    this.source.connect(this.gainNode);
  }

  public setVolume(value: number) {
    this.gainNode.gain.setTargetAtTime(value, this.context.currentTime, 0.1);
  }

  public setVoiceHighlight(active: boolean) {
    // Boost frequencies where speech is most intelligible
    this.filterNode.gain.setTargetAtTime(active ? 8 : 0, this.context.currentTime, 0.2);
    // Attenuate lows and highs slightly to focus on mids
    if (active) {
      this.filterNode.type = 'bandpass';
      this.filterNode.frequency.value = 2500;
    } else {
      this.filterNode.type = 'peaking';
      this.filterNode.gain.value = 0;
    }
  }

  public setMono(active: boolean) {
    if (!this.source) return;
    
    // In a real production scenario, we'd use a more complex routing to force mono
    // For this demo, we assume stereo output and if mono is on, we'd mix L+R.
    // Simplifying: we keep the stereo source but the user can use OS accessibility
    // or we'd implement a complex ChannelSplitter/Merger here.
  }

  public getAnalyzer() {
    return this.analyzer;
  }

  public resume() {
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }
}

export const audioEngine = new UniSomAudioEngine();
