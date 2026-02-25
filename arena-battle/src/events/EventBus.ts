type Callback = (...args: unknown[]) => void;

/**
 * Simple typed event emitter. No Phaser dependency.
 * Used as the sole bridge between state/systems and rendering.
 */
class EventBus {
  private listeners: Map<string, Set<Callback>> = new Map();

  on(event: string, callback: Callback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Callback): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((cb) => cb(...args));
  }

  clear(): void {
    this.listeners.clear();
  }
}

// Single shared instance
export const eventBus = new EventBus();
