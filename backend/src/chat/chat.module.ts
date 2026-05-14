import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { GeminiAdapter } from './ai/gemini.adapter';
import { AI_ADAPTER } from './ai/ai.adapter.interface';

@Module({
  imports: [PrismaModule, AuditModule],
  providers: [
    ChatService,
    {
      provide: AI_ADAPTER,
      useClass: GeminiAdapter,
    },
  ],
  controllers: [ChatController]
})
export class ChatModule {}
