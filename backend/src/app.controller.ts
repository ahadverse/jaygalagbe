import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * The deploy platform's health check. It answers 200 even when the database
   * is unreachable, and says so in the body: a failing check would take the
   * instance out of rotation, which does not bring Postgres back and only
   * removes the endpoint that reports the problem.
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness and database reachability' })
  getHealth() {
    return this.appService.getHealth();
  }
}
