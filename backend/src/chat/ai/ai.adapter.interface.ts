export interface ChatMessageData {
  role: 'user' | 'ai';
  content: string;
}

export const AI_ADAPTER = 'AI_ADAPTER';

export interface IAiAdapter {
  /**
   * Generates a response from the AI model.
   * @param systemPrompt The overarching instructions for the AI.
   * @param history The previous messages in the conversation.
   * @param newMessage The latest user message to respond to.
   * @returns A promise that resolves to the AI's string response.
   */
  generateResponse(
    systemPrompt: string,
    history: ChatMessageData[],
    newMessage: string,
  ): Promise<string>;
}
