import axios from 'axios';
import authHeader from './authHeader';
import type { User } from '../types';

const API_URL = '/api/users/';

// 서버에 내 정보 요청
const getMyInfo = () => {
  // authHeader()를 사용하여 요청 헤더에 JWT 추가
  return axios.get(API_URL + 'me', { headers: authHeader() });
};

const userService = {
  getMyInfo,
};

export default userService;
