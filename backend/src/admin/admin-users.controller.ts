import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service.js';
import { ListUsersDto } from './dto/list-users.dto.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';

@ApiTags('Admin — Users')
@ApiBearerAuth()
@Controller('admin/users')
@Auth(Role.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  findAll(@Query() query: ListUsersDto) {
    return this.adminUsersService.findAll(query);
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
