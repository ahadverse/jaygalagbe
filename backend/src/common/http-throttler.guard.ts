import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import {
  THROTTLER_OPTIONS,
  THROTTLE_METADATA,
  type ThrottlerLimit,
  type ThrottlerModuleOptions,
} from './throttler.js';

interface Window {
  hits: number;
  resetAt: number;
}

/** Sweep expired windows at most this often, so the map cannot grow forever. */
const SWEEP_INTERVAL_MS = 60_000;

/**
 * Applies every named throttler to a request, keyed by throttler, route and
 * caller IP. A `@Throttle` override replaces the limits of the throttlers it
 * names; the others keep their defaults.
 *
 * Skips non-HTTP traffic: it writes response headers, which a socket handler
 * does not have, and WebSocket traffic is bounded by the gateway itself.
 */
@Injectable()
export class HttpThrottlerGuard implements CanActivate {
  private readonly windows = new Map<string, Window>();
  private lastSweep = Date.now();

  constructor(
    @Inject(THROTTLER_OPTIONS) private readonly options: ThrottlerModuleOptions,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') {
      return true;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const overrides =
      this.reflector.getAllAndOverride<Record<string, ThrottlerLimit>>(
        THROTTLE_METADATA,
        [context.getHandler(), context.getClass()],
      ) ?? {};

    const now = Date.now();
    this.sweep(now);

    const route = `${context.getClass().name}.${context.getHandler().name}`;
    const caller = request.ip ?? 'unknown';

    for (const throttler of this.options.throttlers) {
      const { ttl, limit } = overrides[throttler.name] ?? throttler;
      const key = `${throttler.name}:${route}:${caller}`;

      let window = this.windows.get(key);
      if (!window || window.resetAt <= now) {
        window = { hits: 0, resetAt: now + ttl };
        this.windows.set(key, window);
      }
      window.hits += 1;

      if (window.hits > limit) {
        response.setHeader(
          'Retry-After',
          Math.max(1, Math.ceil((window.resetAt - now) / 1000)),
        );
        throw new HttpException(
          'ThrottlerException: Too Many Requests',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }
    return true;
  }

  private sweep(now: number): void {
    if (now - this.lastSweep < SWEEP_INTERVAL_MS) {
      return;
    }
    this.lastSweep = now;
    for (const [key, window] of this.windows) {
      if (window.resetAt <= now) {
        this.windows.delete(key);
      }
    }
  }
}
