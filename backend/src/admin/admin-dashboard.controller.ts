import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';

@ApiTags('Admin — Dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
@Auth(Role.ADMIN)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  getOverview() {
    return this.adminDashboardService.getOverview();
  }
}
