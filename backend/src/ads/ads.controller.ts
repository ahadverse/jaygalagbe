import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AdsService } from './ads.service.js';
import { CreateAdDto } from './dto/create-ad.dto.js';
import { UpdateAdDto } from './dto/update-ad.dto.js';
import { RejectAdDto } from './dto/reject-ad.dto.js';
import { Sector } from '../generated/prisma/client.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

@ApiTags('Ads')
@ApiBearerAuth()
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ medium: { ttl: 3_600_000, limit: 20 } })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAdDto) {
    return this.adsService.create(user.id, dto);
  }

  @Get()
  findLive(
    @Query('sector', new ParseEnumPipe(Sector, { optional: true }))
    sector?: Sector,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.adsService.findLive(sector, {
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined,
    });
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

  @Patch(':id/approve')
  @Auth(Role.ADMIN)
  approve(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.adsService.approve(id, admin.id);
  }

  @Patch(':id/reject')
  @Auth(Role.ADMIN)
  reject(
    @Param('id') id: string,
    @Body() dto: RejectAdDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adsService.reject(id, dto, admin.id);
  }
}
