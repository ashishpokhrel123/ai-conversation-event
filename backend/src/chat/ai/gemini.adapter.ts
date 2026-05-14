import { ChatMessageData, IAiAdapter } from '../ai/ai.adapter.interface';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiAdapter implements IAiAdapter {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: GenerativeModel;
  private readonly logger = new Logger(GeminiAdapter.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set. GeminiAdapter may fail.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use the requested gemini-3.1-flash-lite model
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });
  }

  async generateResponse(
    systemPrompt: string,
    history: ChatMessageData[],
    newMessage: string,
  ): Promise<string> {
    let formattedHistory = history.map((m) => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // CRITICAL: Gemini requires the first message in a chat session to be from the 'user' role.
    const firstUserIndex = formattedHistory.findIndex((m) => m.role === 'user');
    if (firstUserIndex !== -1) {
      formattedHistory = formattedHistory.slice(firstUserIndex);
    } else {
      formattedHistory = [];
    }

    // Initialize model with system instruction for better adherence
    const modelWithSystem = this.genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: systemPrompt
    });

    const chat = modelWithSystem.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.1,
        responseMimeType: "application/json", // Force valid JSON output
      },
    });

    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  }
}
