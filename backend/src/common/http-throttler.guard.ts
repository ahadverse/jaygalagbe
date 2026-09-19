import { Injectable, type ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * The throttler writes `X-RateLimit-*` onto the response, which only exists
 * over HTTP — running it on a socket handler throws. WebSocket traffic is
 * bounded by the gateway handlers and the connection itself instead.
 */
@Injectable()
export class HttpThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return true;
    }
    return super.canActivate(context);
  }
}
