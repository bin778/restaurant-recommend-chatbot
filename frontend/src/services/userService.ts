import api from './api';
import type { ChatSessionInfo, Message } from '../types';

const API_URL = '/api/chat';

// 사용자의 모든 채팅 세션 목록 조회
const getChatSessions = () => {
  return api.get<ChatSessionInfo[]>(`${API_URL}/sessions`);
};

// 특정 세션의 모든 메시지 조회
const getMessages = (sessionId: number) => {
  return api.get<Message[]>(`${API_URL}/${sessionId}/messages`);
};

// 새 메시지 전송 (및 새 세션 생성)
const sendMessage = (sessionId: number | null, message: string) => {
  // 백엔드의 UserChatRequest DTO 형식에 맞춰 데이터를 보냅니다.
  return api.post(`${API_URL}`, { sessionId, message });
};

const chatService = {
  getChatSessions,
  getMessages,
  sendMessage,
};

export default chatService;
