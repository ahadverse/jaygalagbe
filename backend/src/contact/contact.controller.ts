import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '../common/throttler.js';
import { ContactService } from './contact.service.js';
import { CreateContactMessageDto } from './dto/create-contact-message.dto.js';

/** Public, so it gets a tight budget against form spam. */
const CONTACT_THROTTLE = {
  short: { ttl: 60_000, limit: 3 },
  medium: { ttl: 3_600_000, limit: 10 },
};

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @Throttle(CONTACT_THROTTLE)
  create(@Body() dto: CreateContactMessageDto) {
    return this.contactService.create(dto);
  }
}
