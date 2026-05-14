import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class CreateConversationDto {
  @IsString()
  @IsOptional()
  eventId?: string;
}
