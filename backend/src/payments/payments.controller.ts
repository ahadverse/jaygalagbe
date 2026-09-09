import { Controller, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':id/checkout')
  @Auth(Role.ADVERTISER)
  checkout(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.initCheckout(id, user.id);
  }
}
