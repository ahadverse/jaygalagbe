import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from './app.factory.js';

type Handler = (req: IncomingMessage, res: ServerResponse) => void;

/**
 * Vercel keeps a function instance warm between requests, so the Nest app is
 * built once per instance and the in-flight promise is shared — concurrent
 * cold requests wait on one boot instead of each starting their own.
 */
let handler: Promise<Handler> | undefined;

export function getHandler(): Promise<Handler> {
  handler ??= (async () => {
    const app = await createApp();
    await app.init();
    return app.getHttpAdapter().getInstance() as Handler;
  })().catch((error: unknown) => {
    // A failed boot must not poison the instance: let the next request retry.
    handler = undefined;
    throw error;
  });
  return handler;
}
