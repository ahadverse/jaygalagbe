import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MessagingService } from './messaging.service.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  start(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateConversationDto,
  ) {
    return this.messagingService.startConversation(user.id, dto);
  }

  @Get()
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.messagingService.findMine(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.messagingService.findOne(id, user.id);
  }

  @Get(':id/messages')
  listMessages(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.messagingService.listMessages(id, user.id);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagingService.sendMessage(id, user.id, dto);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.messagingService.markRead(id, user.id);
  }
}
