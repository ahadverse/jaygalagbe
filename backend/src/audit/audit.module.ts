import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service.js';

/**
 * Global so any module that performs an admin-initiated state change can record
 * it without threading the dependency through its own imports.
 */
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
