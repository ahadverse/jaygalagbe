import { Injectable, Logger } from '@nestjs/common';
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';

export interface PushMessage {
  token: string;
  title: string;
  body: string;
  data: Record<string, string>;
}

export type PushResult = 'sent' | 'skipped' | 'invalid-token' | 'failed';

const DEAD_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

/**
 * Thin FCM wrapper. Credentials come from FIREBASE_SERVICE_ACCOUNT_JSON (the
 * JSON itself) or GOOGLE_APPLICATION_CREDENTIALS (a file path). With neither
 * set it is a logged no-op, so the backend boots and runs without Firebase.
 * Never throws: push is best-effort and must not fail the request behind it.
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private messaging?: Messaging | null;

  async send(message: PushMessage): Promise<PushResult> {
    const messaging = this.getMessaging();
    if (!messaging) {
      return 'skipped';
    }
    try {
      await messaging.send({
        token: message.token,
        notification: { title: message.title, body: message.body },
        data: message.data,
      });
      return 'sent';
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code && DEAD_TOKEN_CODES.has(code)) {
        return 'invalid-token';
      }
      this.logger.warn(`Push send failed: ${(error as Error).message}`);
      return 'failed';
    }
  }

  /** Resolved once; null means "not configured" and is remembered. */
  protected getMessaging(): Messaging | null {
    if (this.messaging !== undefined) {
      return this.messaging;
    }
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!json && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      this.logger.log(
        'FCM not configured (FIREBASE_SERVICE_ACCOUNT_JSON / GOOGLE_APPLICATION_CREDENTIALS) — push notifications are disabled',
      );
      return (this.messaging = null);
    }
    try {
      const app =
        getApps()[0] ??
        initializeApp({
          credential: json
            ? cert(JSON.parse(json) as Record<string, string>)
            : applicationDefault(),
        });
      return (this.messaging = getMessaging(app));
    } catch (error) {
      this.logger.error(
        `FCM initialisation failed, push disabled: ${(error as Error).message}`,
      );
      return (this.messaging = null);
    }
  }
}
