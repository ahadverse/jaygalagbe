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
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsString,
} from 'class-validator';
import { AdminContactsService } from './admin-contacts.service.js';
import { ListContactsDto } from './dto/list-contacts.dto.js';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto.js';
import { Auth } from '../auth/auth.decorator.js';
import { Role } from '../auth/role.enum.js';
import { csvFilename } from '../common/csv.js';

class BulkContactDto {
  @IsIn(['RESOLVED', 'OPENED', 'NEW', 'DELETE'])
  action!: 'RESOLVED' | 'OPENED' | 'NEW' | 'DELETE';

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  ids!: string[];
}

@ApiTags('Admin — Contacts')
@ApiBearerAuth()
@Controller('admin/contacts')
@Auth(Role.ADMIN)
export class AdminContactsController {
  constructor(private readonly contactsService: AdminContactsService) {}

  @Get()
  findAll(@Query() query: ListContactsDto) {
    return this.contactsService.findAll(query);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(@Query() query: ListContactsDto, @Res() res: Response) {
    const csv = await this.contactsService.exportCsv(query);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${csvFilename('contacts')}"`,
    );
    res.send(csv);
  }

  @Post('bulk')
  bulk(@Body() dto: BulkContactDto) {
    return this.contactsService.bulk(dto.action, dto.ids);
  }

  @Patch(':id/status')
  setStatus(@Param('id') id: string, @Body() dto: UpdateContactStatusDto) {
    return this.contactsService.setStatus(id, dto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}
