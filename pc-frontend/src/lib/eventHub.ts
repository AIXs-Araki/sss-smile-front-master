type EventType = 'TokenExpired';

class EventHub {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private listeners: Map<EventType, Set<Function>> = new Map();

  subscribe<T>(event: EventType, listener: (data?: T) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  publish<T>(event: EventType, data?: T) {
    this.listeners.get(event)?.forEach(listener => listener(data));
  }
}

export const eventHub = new EventHub();