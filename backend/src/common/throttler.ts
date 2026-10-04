import { DynamicModule, Global, Module, SetMetadata } from '@nestjs/common';

/**
 * A small in-process rate limiter with the same shape as `@nestjs/throttler`.
 *
 * That package is CommonJS and `require()`s `@nestjs/common`, which has been
 * ESM-only since Nest 12. Node 24 tolerates that; hosts whose module loader
 * does not (Vercel's) fail at boot with ERR_REQUIRE_ESM. Counts live in
 * memory, so on serverless hosting they are per instance.
 */
export interface ThrottlerLimit {
  /** Window length in milliseconds. */
  ttl: number;
  /** Requests allowed per window. */
  limit: number;
}

export interface NamedThrottler extends ThrottlerLimit {
  name: string;
}

export interface ThrottlerModuleOptions {
  throttlers: NamedThrottler[];
}

export const THROTTLER_OPTIONS = Symbol('THROTTLER_OPTIONS');
export const THROTTLE_METADATA = 'throttle:overrides';

/** Overrides the limits of the named throttlers for a route or controller. */
export const Throttle = (overrides: Record<string, ThrottlerLimit>) =>
  SetMetadata(THROTTLE_METADATA, overrides);

@Global()
@Module({})
export class ThrottlerModule {
  static forRoot(options: ThrottlerModuleOptions): DynamicModule {
    return {
      module: ThrottlerModule,
      providers: [{ provide: THROTTLER_OPTIONS, useValue: options }],
      exports: [THROTTLER_OPTIONS],
    };
  }
}
