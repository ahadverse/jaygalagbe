import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';

function parseBoolean(value?: string): boolean | undefined {
  if (value === undefined) return undefined;
  return value === 'true';
}

@ApiTags('Admin — Users')
@ApiBearerAuth()
@Controller('admin/users')
@Auth(Role.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('role') role?: Role,
    @Query('suspended') suspended?: string,
  ) {
    return this.adminUsersService.findAll({
      search,
      role,
      suspended: parseBoolean(suspended),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Patch(':id/suspend')
  suspend(@Param('id') id: string) {
    return this.adminUsersService.suspend(id);
  }

  @Patch(':id/unsuspend')
  unsuspend(@Param('id') id: string) {
    return this.adminUsersService.unsuspend(id);
  }
}
