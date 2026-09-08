import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateAdDto } from './create-ad.dto.js';

export class UpdateAdDto extends PartialType(
  OmitType(CreateAdDto, ['sector'] as const),
) {}
