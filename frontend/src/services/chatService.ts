import api from './api';
import authHeader from './authHeader';

const API_URL = '/api/chat';

const sendMessage = (message: string) => {
  return api.post(API_URL, { message }, { headers: authHeader() });
};

const chatService = {
  sendMessage,
};

export default chatService;
