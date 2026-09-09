import { Injectable, Logger } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirebaseCredentials } from './fcm.config.js';

export interface PushNotification {
  title: string;
  body: string;
}

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  async sendToToken(token: string, notification: PushNotification) {
    try {
      await this.getMessaging().send({ token, notification });
    } catch (error) {
      this.logger.warn(`Failed to send FCM push: ${(error as Error).message}`);
    }
  }

  private getMessaging() {
    if (getApps().length === 0) {
      const { projectId, clientEmail, privateKey } = getFirebaseCredentials();
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    }
    return getMessaging();
  }
}
