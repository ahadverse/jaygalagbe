import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service.js';
import { UpsertReviewDto } from './dto/upsert-review.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('advertisers/:advertiserId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findByAdvertiser(@Param('advertiserId') advertiserId: string) {
    return this.reviewsService.findByAdvertiser(advertiserId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  upsert(
    @Param('advertiserId') advertiserId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertReviewDto,
  ) {
    return this.reviewsService.upsert(user.id, advertiserId, dto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('advertiserId') advertiserId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reviewsService.remove(user.id, advertiserId);
  }
}
