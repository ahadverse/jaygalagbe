import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller.js';
import { MessagingService } from './messaging.service.js';
import { MessagingGateway } from './messaging.gateway.js';

@Module({
  controllers: [MessagingController],
  providers: [MessagingService, MessagingGateway],
  exports: [MessagingService],
})
export class MessagingModule {}
