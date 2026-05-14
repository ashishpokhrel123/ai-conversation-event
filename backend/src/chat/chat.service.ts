import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ConfigService } from '@nestjs/config';
import { AI_ADAPTER } from './ai/ai.adapter.interface';
import type { IAiAdapter } from './ai/ai.adapter.interface';

import { EVENT_ARCHITECT_SYSTEM_PROMPT } from './prompts/event-architect.prompt';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private configService: ConfigService,
    @Inject(AI_ADAPTER) private aiAdapter: IAiAdapter,
  ) { }

  async handleMessage(userId: string, conversationId: string, message: string) {
    const conversation = await this.getConversationWithHistory(conversationId, userId);

    const currentEventState = conversation.event ? JSON.stringify(conversation.event) : "No event created yet.";
    const dynamicSystemPrompt = `${EVENT_ARCHITECT_SYSTEM_PROMPT}\n\nCURRENT EVENT STATE: ${currentEventState}`;

    const formattedHistory = conversation.messages.map(m => ({
      role: m.role as 'user' | 'ai',
      content: m.content
    }));

    const resultText = await this.aiAdapter.generateResponse(
      dynamicSystemPrompt,
      formattedHistory,
      message
    );

    const parsedResponse = this.parseGeminiResponse(resultText);

    await this.saveMessages(conversationId, message, parsedResponse.response);

    const eventId = await this.syncEventState(
      userId,
      conversationId,
      conversation.event,
      parsedResponse,
      message
    );

    this.logger.debug(`Sync complete. Event ID: ${eventId}, Updates: ${JSON.stringify(parsedResponse.updates)}`);

    await this.updateConversationActivity(conversationId, userId, parsedResponse);

    return {
      message: parsedResponse.response,
      updates: parsedResponse.updates,
      eventId,
    };
  }

  // --- Helper Methods ---

  private async getConversationWithHistory(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { timestamp: 'asc' }, take: 20 },
        event: true
      },
    });

    if (!conversation) throw new Error('Conversation not found');
    if (conversation.userId !== userId) throw new Error('Forbidden: You do not own this conversation');
    return conversation;
  }

  private parseGeminiResponse(responseText: string) {
    try {
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const decoded = JSON.parse(jsonStr);

      return {
        response: decoded.response || "I've processed your request.",
        updates: decoded.updates || {},
        intent: decoded.intent || 'CHAT'
      };
    } catch (e) {
      this.logger.error('Failed to parse Gemini JSON mode response', e);
      // Fallback: If it's not valid JSON, try to extract the response via regex
      const responseMatch = responseText.match(/"response":\s*"([^"]*)"/);
      return {
        response: responseMatch ? responseMatch[1] : responseText,
        updates: {},
        intent: 'CHAT'
      };
    }
  }

  private async saveMessages(conversationId: string, userMsg: string, aiMsg: string) {
    await this.prisma.message.createMany({
      data: [
        { conversationId, role: 'user', content: userMsg },
        { conversationId, role: 'ai', content: aiMsg },
      ],
    });
  }

  private async syncEventState(userId: string, conversationId: string, currentEvent: any | null, parsedResponse: any, message: string) {
    const updates = parsedResponse.updates || {};
    if (Object.keys(updates).length === 0) return currentEvent?.id || null;

    const isCreateIntent = !currentEvent && (
      parsedResponse.intent === 'CREATE_EVENT' ||
      updates.eventName ||
      message.toLowerCase().includes('create') ||
      message.toLowerCase().includes('event')
    );

    if (isCreateIntent) {
      return this.createNewEvent(userId, conversationId, updates);
    } else if (currentEvent) {
      await this.updateExistingEvent(currentEvent, updates);
      return currentEvent.id;
    }
    return currentEvent?.id || null;
  }

  private async createNewEvent(userId: string, conversationId: string, updates: any) {
    const newEvent = await this.prisma.event.create({
      data: {
        userId,
        name: updates.eventName || 'Untitled Event',
        description: updates.description || '',
        subheading: updates.subheading || '',
        location: updates.location || null,
        timezone: updates.timezone || 'UTC',
        startDateTime: updates.startDateTime ? new Date(updates.startDateTime) : null,
        endDateTime: updates.endDateTime ? new Date(updates.endDateTime) : null,
        vanishDate: updates.vanishDate ? new Date(updates.vanishDate) : null,
        bannerImageUrl: updates.bannerImageUrl || '',
        status: 'DRAFT',
        roles: updates.roles || {},
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { eventId: newEvent.id },
    });

    this.logger.log(`Created new draft event: ${newEvent.id} for user: ${userId}`);
    return newEvent.id;
  }

  private async updateExistingEvent(currentEvent: any, updates: any) {
    const updateData: Record<string, any> = {};

    // Data-driven mapping avoids massive if-blocks
    const stringFields: Record<string, string> = {
      eventName: 'name',
      description: 'description',
      subheading: 'subheading',
      location: 'location',
      timezone: 'timezone',
      status: 'status',
      bannerImageUrl: 'bannerImageUrl',
      roles: 'roles',
    };

    for (const [updatesKey, prismaKey] of Object.entries(stringFields)) {
      if (updates[updatesKey] !== undefined) {
        updateData[prismaKey] = updates[updatesKey];
      }
    }

    const dateFields = ['startDateTime', 'endDateTime', 'vanishDate'];
    for (const field of dateFields) {
      if (updates[field]) {
        updateData[field] = new Date(updates[field]);
      }
    }

    // --- Validation Logic ---
    const proposedStart = updateData.startDateTime || currentEvent.startDateTime;
    const proposedEnd = updateData.endDateTime || currentEvent.endDateTime;

    if (proposedStart && proposedEnd) {
      if (proposedEnd <= proposedStart) {
        this.logger.warn(`Validation failed: AI proposed an end date before the start date. Discarding invalid date updates.`);
        delete updateData.startDateTime;
        delete updateData.endDateTime;
      }
    }

    if (Object.keys(updateData).length > 0) {
      this.logger.log(`Prisma update for event ${currentEvent.id}: ${JSON.stringify(updateData)}`);
      await this.prisma.event.update({ where: { id: currentEvent.id }, data: updateData });
      this.logger.log(`Updated event: ${currentEvent.id} with fields: ${Object.keys(updateData).join(', ')}`);
    } else {
      this.logger.warn(`No valid updates mapped for event ${currentEvent.id}`);
    }
  }

  private async updateConversationActivity(conversationId: string, userId: string, parsedResponse: any) {
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    await this.audit.log(userId, 'CHAT_MESSAGE', 'Conversation', conversationId, {
      intent: parsedResponse.intent,
      hasUpdates: Object.keys(parsedResponse.updates || {}).length > 0,
    });
  }

  // --- Public Getters ---

  async getOrCreateConversation(userId: string, eventId?: string) {
    let conversation;
    if (eventId) {
      conversation = await this.prisma.conversation.findFirst({
        where: { userId, eventId },
        include: { messages: { orderBy: { timestamp: 'asc' } }, event: true },
      });
    }

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { userId, eventId },
        include: { messages: true, event: true },
      });
    }
    return conversation;
  }

  async getConversationById(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { timestamp: 'asc' } },
        event: true,
      },
    });

    if (!conversation) throw new Error('Conversation not found');
    if (conversation.userId !== userId) throw new Error('You do not own this conversation');

    return conversation;
  }
}
