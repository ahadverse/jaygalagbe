import { describe, expect, it, vi } from 'vitest';
import { deleteUserAndData } from './account-deletion.js';

function mockPrisma() {
  const calls: string[] = [];
  const model = (name: string) =>
    new Proxy(
      {},
      {
        get: (_t, method: string) =>
          vi.fn(async () => {
            calls.push(`${name}.${method}`);
            return method === 'findMany' ? [{ id: 'x' }] : { count: 0 };
          }),
      },
    );
  const tx = new Proxy({} as Record<string, unknown>, {
    get: (_t, name: string) => model(name),
  });
  const prisma = {
    $transaction: vi.fn(async (fn: (t: unknown) => unknown) => fn(tx)),
  };
  return { prisma, calls };
}

describe('deleteUserAndData', () => {
  it('clears dependants before the ads and the user, in one transaction', async () => {
    const { prisma, calls } = mockPrisma();
    await deleteUserAndData(prisma as never, 'u1');

    expect(prisma.$transaction).toHaveBeenCalledOnce();
    const at = (c: string) => calls.indexOf(c);
    expect(at('message.deleteMany')).toBeLessThan(
      at('conversation.deleteMany'),
    );
    expect(at('boost.deleteMany')).toBeLessThan(at('payment.deleteMany'));
    expect(at('payment.deleteMany')).toBeLessThan(at('ad.deleteMany'));
    expect(at('ad.deleteMany')).toBeLessThan(at('user.delete'));
    expect(calls.at(-1)).toBe('user.delete');
  });
});
