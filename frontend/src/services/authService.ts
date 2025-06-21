import axios from 'axios';
import type { User, SignupData, LoginData } from '../types';

let currentUser: User | null = null;
const API_URL = '/api/auth/';

// 회원가입 요청
const signup = (data: SignupData): Promise<void> => {
  return axios.post(API_URL + 'signup', data);
};

// 로그인 요청
const login = async (data: LoginData): Promise<User> => {
  const response = await axios.post<User>(API_URL + 'login', data);
  if (response.data.accessToken) {
    currentUser = response.data; // 메모리에 사용자 정보 저장
  }
  return response.data;
};

// 새 액세스 토큰을 요청하는 함수 추가
const refresh = async (): Promise<User> => {
  const response = await axios.post<User>(API_URL + 'refresh');
  if (response.data.accessToken) {
    currentUser = response.data;
  }
  return response.data;
};

const logout = (): void => {
  currentUser = null;
  // TODO: 추후 /api/auth/logout 엔드포인트를 호출하여 쿠키를 제거하는 로직 추가
};

const getCurrentUser = (): User | null => {
  return currentUser;
};

const authService = {
  signup,
  login,
  refresh, // export 추가
  logout,
  getCurrentUser,
};

export default authService;
