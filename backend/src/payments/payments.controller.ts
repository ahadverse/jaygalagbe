import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':id/checkout')
  @Auth(Role.ADVERTISER)
  checkout(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.initCheckout(id, user.id);
  }

  @Post('ipn')
  @HttpCode(HttpStatus.OK)
  handleIpn(@Body() body: Record<string, string>) {
    return this.paymentsService.handleIpn(body);
  }
}
