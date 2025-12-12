import { createExpressApp } from './interfaces/http/express-app';

export function createApp() {
  const app = createExpressApp();
  return { app };
}

