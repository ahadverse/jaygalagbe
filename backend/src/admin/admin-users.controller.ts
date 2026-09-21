import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service.js';
import { AdminBulkService } from './admin-bulk.service.js';
import { ListUsersDto } from './dto/list-users.dto.js';
import { BulkUserActionDto } from './dto/bulk-action.dto.js';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { csvFilename } from '../common/csv.js';

@ApiTags('Admin — Users')
@ApiBearerAuth()
@Controller('admin/users')
@Auth(Role.ADMIN)
export class AdminUsersController {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly bulkService: AdminBulkService,
  ) {}

  @Get()
  findAll(@Query() query: ListUsersDto) {
    return this.adminUsersService.findAll(query);
  }

  /** Same filters as the table, so what you see is what you export. */
  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(@Query() query: ListUsersDto, @Res() res: Response) {
    const csv = await this.adminUsersService.exportCsv(query);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${csvFilename('users')}"`,
    );
    res.send(csv);
  }

  @Post('bulk')
  runBulk(
    @Body() dto: BulkUserActionDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.bulkService.runUserAction(dto, admin);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminUsersService.update(id, dto, admin);
  }

  /** Only ever succeeds on an account with no content behind it. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.adminUsersService.remove(id, admin);
  }

  @Patch(':id/suspend')
  suspend(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.adminUsersService.suspend(id, admin);
  }

  @Patch(':id/unsuspend')
  unsuspend(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.adminUsersService.unsuspend(id, admin);
  }

  @Patch(':id/grant-admin')
  grantAdmin(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.adminUsersService.setAdmin(id, true, admin);
  }

  @Patch(':id/revoke-admin')
  revokeAdmin(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminUsersService.setAdmin(id, false, admin);
  }
}
