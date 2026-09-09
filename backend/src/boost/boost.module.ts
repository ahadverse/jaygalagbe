import { Module } from '@nestjs/common';
import { BoostController } from './boost.controller.js';
import { BoostService } from './boost.service.js';

@Module({
  controllers: [BoostController],
  providers: [BoostService],
  exports: [BoostService],
})
export class BoostModule {}
