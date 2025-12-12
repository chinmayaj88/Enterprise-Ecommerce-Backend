export interface IEventConsumer {
  start(): Promise<void>;
  stop(): Promise<void>;
  subscribe(eventType: string, handler: (event: any) => Promise<void>): void;
  isRunning(): boolean;
}

