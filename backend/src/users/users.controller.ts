import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { RegisterFcmTokenDto } from './dto/register-fcm-token.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAccount(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.deleteAccount(user.id);
  }

  @Post('me/advertiser-upgrade')
  upgradeToAdvertiser(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.upgradeToAdvertiser(user.id);
  }

  @Post('me/fcm-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  registerFcmToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterFcmTokenDto,
  ) {
    return this.usersService.registerFcmToken(user.id, dto);
  }

  @Delete('me/fcm-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  clearFcmToken(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.clearFcmToken(user.id);
  }
}
