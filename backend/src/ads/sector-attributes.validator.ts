import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Sector } from '../generated/prisma/client.js';
import { LandAttributesDto } from './dto/land-attributes.dto.js';
import { HouseRentAttributesDto } from './dto/house-rent-attributes.dto.js';

export function validateSectorAttributes(
  sector: Sector,
  attributes: Record<string, unknown> | undefined,
) {
  const instance =
    sector === Sector.LAND
      ? plainToInstance(LandAttributesDto, attributes ?? {})
      : plainToInstance(HouseRentAttributesDto, attributes ?? {});
  const errors = validateSync(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    const messages = errors.flatMap((error) =>
      Object.values(error.constraints ?? {}),
    );
    throw new BadRequestException(messages);
  }

  return instance as unknown as Record<string, unknown>;
}
