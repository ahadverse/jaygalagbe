import { IsString } from 'class-validator';
import { CreateMessageDto } from './create-message.dto.js';

export class SendMessageWsDto extends CreateMessageDto {
  @IsString()
  conversationId!: string;
}
