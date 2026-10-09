import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationSoundService {
  private audioContext?: AudioContext;
  private soundEnAttente = false;

  constructor() {
    window.addEventListener('pointerdown', this.unlock, { passive: true });
  }

  play(): void {
    const context = this.getAudioContext();
    if (!context) {
      return;
    }

    const start = (): void => {
      const now = context.currentTime;
      [0, 0.22, 0.44].forEach((offset, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(index === 1 ? 880 : 660, now + offset);
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(1, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now + offset);
        oscillator.stop(now + offset + 0.2);
      });
    };

    if (context.state === 'suspended') {
      void context.resume().then(start).catch(() => {
        this.soundEnAttente = true;
      });
    } else {
      start();
    }
  }

  private readonly unlock = (): void => {
    const context = this.getAudioContext();
    if (context?.state === 'suspended') {
      void context.resume().then(() => {
        if (this.soundEnAttente) {
          this.soundEnAttente = false;
          this.play();
        }
      }).catch(() => undefined);
    }
  };

  private getAudioContext(): AudioContext | undefined {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      return undefined;
    }
    this.audioContext ??= new AudioContextClass();
    return this.audioContext;
  }
}