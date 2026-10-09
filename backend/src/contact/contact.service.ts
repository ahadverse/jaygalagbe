import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateContactMessageDto } from './dto/create-contact-message.dto.js';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactMessageDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException(
        'Please give an email or phone number so we can reply',
      );
    }
    await this.prisma.contactMessage.create({
      data: {
        name: dto.name.trim(),
        email: dto.email?.trim().toLowerCase(),
        phone: dto.phone?.trim(),
        topic: dto.topic,
        message: dto.message.trim(),
      },
    });
    return { success: true };
  }
}
