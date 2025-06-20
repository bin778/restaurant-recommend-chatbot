import axios from 'axios';
import authHeader from './authHeader';

const API_URL = '/api/chat';

const sendMessage = (message: string) => {
  return axios.post(API_URL, { message }, { headers: authHeader() });
};

const chatService = {
  sendMessage,
};

export default chatService;
