import { IsString } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  adId!: string;
}
