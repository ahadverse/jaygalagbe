import 'dotenv/config';
import { createApp } from './app.factory.js';

async function bootstrap() {
  const app = await createApp();

  // Bound to every interface, not just loopback: a managed host routes to the
  // container's address, and a server listening only on localhost looks dead
  // to it. The platform hands the port over in PORT.
  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
}
await bootstrap();
