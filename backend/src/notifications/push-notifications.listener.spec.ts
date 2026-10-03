import { describe, expect, it, vi } from 'vitest';
import { PushNotificationsListener } from './push-notifications.listener.js';
import { PushService } from './push.service.js';

function setup(token: string | null, sendResult: string | Error) {
  const prisma = {
    user: {
      findUnique: vi.fn(async () => ({ fcmToken: token })),
      updateMany: vi.fn(async () => ({ count: 1 })),
    },
  };
  const send = vi.fn(async (_message: unknown) => {
    if (sendResult instanceof Error) throw sendResult;
    return sendResult;
  });
  const gateway = { isUserConnectedToConversation: vi.fn(async () => false) };
  const listener = new PushNotificationsListener(
    prisma as never,
    { send } as never,
    gateway as never,
  );
  return { listener, prisma, send, gateway };
}

const approved = { userId: 'u1', adId: 'a1', adTitle: 'Plot' };

describe('PushNotificationsListener', () => {
  it('sends title, body and data to the stored token', async () => {
    const { listener, send } = setup('tok', 'sent');
    await listener.handleAdApproved(approved);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'tok',
        data: { type: 'ad.approved', adId: 'a1' },
      }),
    );
  });

  it('does nothing without a token', async () => {
    const { listener, send } = setup(null, 'sent');
    await listener.handleAdApproved(approved);
    expect(send).not.toHaveBeenCalled();
  });

  it('clears a dead token', async () => {
    const { listener, prisma } = setup('tok', 'invalid-token');
    await listener.handleAdApproved(approved);
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'u1', fcmToken: 'tok' },
      data: { fcmToken: null },
    });
  });

  it('never throws when the sender blows up', async () => {
    const { listener } = setup('tok', new Error('boom'));
    await expect(listener.handleAdApproved(approved)).resolves.toBeUndefined();
  });

  it('skips message pushes while the recipient is viewing the chat', async () => {
    const { listener, send, gateway } = setup('tok', 'sent');
    gateway.isUserConnectedToConversation.mockResolvedValue(true);
    await listener.handleMessageReceived({
      userId: 'u1',
      conversationId: 'c1',
      senderId: 's',
      senderName: 'S',
      body: 'hi',
    });
    expect(send).not.toHaveBeenCalled();
  });
});

describe('PushService', () => {
  it('is a no-op when unconfigured', async () => {
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const result = await new PushService().send({
      token: 't',
      title: 'a',
      body: 'b',
      data: {},
    });
    expect(result).toBe('skipped');
  });
});
