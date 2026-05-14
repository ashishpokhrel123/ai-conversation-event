import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendMessageDto, CreateConversationDto } from './dto/chat.dto';
import { Request } from 'express';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('message')
  async sendMessage(@Req() req: Request & { user: { userId: string } }, @Body() body: SendMessageDto) {
    return this.chatService.handleMessage(req.user.userId, body.conversationId, body.message);
  }

  @Post('conversation')
  async getOrCreateConversation(@Req() req: Request & { user: { userId: string } }, @Body() body: CreateConversationDto) {
    return this.chatService.getOrCreateConversation(req.user.userId, body.eventId);
  }

  @Get(':conversationId')
  async getConversation(@Req() req: Request & { user: { userId: string } }, @Param('conversationId') conversationId: string) {
    return this.chatService.getConversationById(req.user.userId, conversationId);
  }
}
