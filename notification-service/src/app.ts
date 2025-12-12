import { Container } from './di/container';
import { createExpressApp } from './interfaces/http/express-app';

export function createApp() {
  const container = Container.getInstance();
  const app = createExpressApp(container);

  return { app, container };
}

