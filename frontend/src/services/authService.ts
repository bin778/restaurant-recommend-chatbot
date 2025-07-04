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
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// 새 액세스 토큰을 요청하는 함수
const refresh = async (): Promise<User> => {
  const response = await api.post<User>(API_URL + '/refresh');
  if (response.data.accessToken) {
    // [수정] 재발급 시에도 기존 사용자 정보와 합쳐서 완전한 User 객체를 저장
    const user = getCurrentUser();
    const refreshedUser = { ...user, ...response.data };
    localStorage.setItem('user', JSON.stringify(refreshedUser));
  }
  return response.data;
};

// 로그아웃
const logout = async (): Promise<void> => {
  try {
    await api.post(API_URL + '/logout');
  } catch (error) {
    console.error('서버 로그아웃 중 오류 발생:', error);
  } finally {
    localStorage.removeItem('user');
  }
};

// 현재 사용자 정보 가져오기
const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr) as User; // User 타입으로 명시적 캐스팅
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
