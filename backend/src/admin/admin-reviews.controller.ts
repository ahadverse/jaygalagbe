import {
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminReviewsService } from './admin-reviews.service.js';
import { ListReviewsDto } from './dto/list-reviews.dto.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { csvFilename } from '../common/csv.js';

@ApiTags('Admin — Reviews')
@ApiBearerAuth()
@Controller('admin/reviews')
@Auth(Role.ADMIN)
export class AdminReviewsController {
  constructor(private readonly adminReviewsService: AdminReviewsService) {}

  @Get()
  findAll(@Query() query: ListReviewsDto) {
    return this.adminReviewsService.findAll(query);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(@Query() query: ListReviewsDto, @Res() res: Response) {
    const csv = await this.adminReviewsService.exportCsv(query);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${csvFilename('reviews')}"`,
    );
    res.send(csv);
  }

  @Patch(':id/hide')
  hide(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.adminReviewsService.setHidden(id, true, admin);
  }

  @Patch(':id/unhide')
  unhide(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.adminReviewsService.setHidden(id, false, admin);
  }

  /** Permanent — the record is copied into the audit entry first. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.adminReviewsService.remove(id, admin);
  }
}
