import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
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
   * Gateway IPN. Unauthenticated by nature — the body only names the invoice,
   * and the outcome is re-read from the gateway before anything is settled.
   */
  @Post('ipn')
  @HttpCode(HttpStatus.OK)
  handleIpn(@Body() body: Record<string, unknown>) {
    return this.paymentsService.handleIpn(body);
  }

  /**
   * Where PayStation returns the buyer's browser after checkout, so it ends on
   * a redirect back into the app rather than on a JSON body.
   */
  @Get('callback')
  @Redirect()
  @ApiExcludeEndpoint()
  async handleCallback(@Query() query: Record<string, string>) {
    return {
      url: await this.paymentsService.handleGatewayReturn(query),
      statusCode: HttpStatus.FOUND,
    };
  }
}
