import api from './api';
import type { Message } from '../types';

const API_URL = '/api/chat';

const sendMessage = (messages: Message[]) => {
  return api.post(API_URL, { messages });
};

const chatService = {
  sendMessage,
};

export default chatService;
