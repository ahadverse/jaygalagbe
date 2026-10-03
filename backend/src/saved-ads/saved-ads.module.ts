import { Module } from '@nestjs/common';
import { SavedAdsController } from './saved-ads.controller.js';
import { SavedAdsService } from './saved-ads.service.js';

@Module({
  controllers: [SavedAdsController],
  providers: [SavedAdsService],
})
export class SavedAdsModule {}
