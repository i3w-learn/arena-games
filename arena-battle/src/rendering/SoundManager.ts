// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — jsfxr has no type declarations
import { sfxr } from 'jsfxr';
import type { SoundParams } from '../types';
import { eventBus } from '../events/EventBus';
import { GameEventType } from '../events/GameEvents';

export class SoundManager {
  private params: SoundParams | null = null;

  loadParams(params: SoundParams): void {
    this.params = params;
  }

  /** Play a jsfxr sound effect */
  play(soundKey: keyof SoundParams): void {
    if (!this.params) return;
    const paramArray = this.params[soundKey];
    if (!paramArray) return;
    try {
      const audio = (sfxr as Record<string, (p: number[]) => HTMLAudioElement>).toAudio(paramArray);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {
      // jsfxr may throw on certain parameter arrays; don't block game flow
    }
  }

  /** Subscribe to game events — only button tap, victory, and defeat */
  subscribe(): void {
    eventBus.on(GameEventType.VICTORY, () => this.play('victory'));
    eventBus.on(GameEventType.DEFEAT, () => this.play('defeat'));
  }

  /** Unlock audio context from a user interaction (no-op now, kept for API compat) */
  unlock(): void {
    // No Web Audio context needed — jsfxr creates its own audio elements
  }
}

/** Singleton so all scenes share the same instance */
export const soundManager = new SoundManager();
