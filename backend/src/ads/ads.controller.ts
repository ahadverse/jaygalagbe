import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdsService } from './ads.service.js';
import { CreateAdDto } from './dto/create-ad.dto.js';
import { UpdateAdDto } from './dto/update-ad.dto.js';
import { Sector } from '../generated/prisma/client.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Post()
  @Auth(Role.ADVERTISER)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAdDto) {
    return this.adsService.create(user.id, dto);
  }

  @Get()
  findLive(@Query('sector') sector?: Sector) {
    return this.adsService.findLive(sector);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.adsService.findMine(user.id);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.adsService.findOneVisible(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAdDto,
  ) {
    return this.adsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adsService.softDelete(id, user);
  }

  @Patch(':id/mark-sold')
  @UseGuards(JwtAuthGuard)
  markSold(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adsService.markSold(id, user.id);
  }

  @Patch(':id/resubmit')
  @UseGuards(JwtAuthGuard)
  resubmit(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adsService.resubmit(id, user.id);
  }
}
