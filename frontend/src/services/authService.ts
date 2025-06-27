import api from './api';
import type { User, SignupData, LoginData } from '../types';

const API_URL = '/api/auth';

// 회원가입 요청
const signup = (data: SignupData): Promise<void> => {
  return api.post(API_URL + '/signup', data);
};

// 로그인 요청
const login = async (data: LoginData): Promise<User> => {
  const response = await api.post<User>(API_URL + '/login', data);
  if (response.data.accessToken) {
    // 1. 사용자 정보를 localStorage에 저장합니다.
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// 새 액세스 토큰을 요청하는 함수
const refresh = async (): Promise<User> => {
  const response = await api.post<User>(API_URL + '/refresh');
  if (response.data.accessToken) {
    // 1. 갱신된 사용자 정보도 localStorage에 저장합니다.
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// 로그아웃
const logout = (): void => {
  // 2. localStorage에서 사용자 정보를 제거합니다.
  localStorage.removeItem('user');
  // TODO: 추후 /api/auth/logout 엔드포인트를 호출하여 서버 측 쿠키도 제거
};

// 현재 사용자 정보 가져오기
const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

const authService = {
  signup,
  login,
  refresh,
  logout,
  getCurrentUser,
};

export default authService;
