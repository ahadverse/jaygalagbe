import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContactMessageStatus } from '../../generated/prisma/client.js';

export class UpdateContactStatusDto {
  @ApiProperty({ enum: ContactMessageStatus })
  @IsEnum(ContactMessageStatus)
  status!: ContactMessageStatus;
}
