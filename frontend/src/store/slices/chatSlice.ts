import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface ChatState {
  messages: Message[];
  conversationId: string | null;
  isTyping: boolean;
}

const initialState: ChatState = {
  messages: [],
  conversationId: null,
  isTyping: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setConversationId: (state, action: PayloadAction<string | null>) => {
      state.conversationId = action.payload;
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.conversationId = null;
    }
  },
});

export const { setMessages, addMessage, setConversationId, setTyping, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
