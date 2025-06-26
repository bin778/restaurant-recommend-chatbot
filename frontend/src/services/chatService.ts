import api from './api';
import type { ChatSessionInfo, Message } from '../types';

const API_URL = '/api/chat';

const getChatSessions = () => {
  return api.get<ChatSessionInfo[]>(`${API_URL}/sessions`);
};

const getMessages = (sessionId: number) => {
  return api.get<Message[]>(`${API_URL}/${sessionId}/messages`);
};

const sendMessage = (sessionId: number | null, message: string) => {
  return api.post(`${API_URL}`, { sessionId, message });
};

const deleteChatSession = (sessionId: number) => {
  return api.delete(`${API_URL}/sessions/${sessionId}`);
};

const chatService = {
  getChatSessions,
  getMessages,
  sendMessage,
  deleteChatSession,
};

export default chatService;
