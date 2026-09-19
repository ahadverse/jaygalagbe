import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':id/checkout')
  @UseGuards(JwtAuthGuard)
  checkout(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.initCheckout(id, user.id);
  }

  /**
   * Gateway callback. Unauthenticated by nature — every field is untrusted
   * until the signature and the gateway's own validation API agree.
   */
  @Post('ipn')
  @HttpCode(HttpStatus.OK)
  handleIpn(@Body() body: Record<string, string>) {
    return this.paymentsService.handleIpn(body);
  }
}
