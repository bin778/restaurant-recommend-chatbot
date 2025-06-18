import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import type { User, SignupData, LoginData } from '../types'; // 정의한 타입 임포트

const API_URL = '/api/auth/';

// 회원가입 요청
const signup = (data: SignupData): Promise<void> => {
  return axios.post(API_URL + 'signup', data);
};

// 로그인 요청
const login = async (data: LoginData): Promise<User> => {
  const response = await axios.post<User>(API_URL + 'login', data);
  if (response.data.accessToken) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// 로그아웃
const logout = (): void => {
  localStorage.removeItem('user');
};

// 현재 로그인된 사용자 정보 가져오기
const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }

  try {
    const user: User = JSON.parse(userStr);
    const decodedJwt = jwtDecode(user.accessToken);

    if (decodedJwt.exp && decodedJwt.exp * 1000 < Date.now()) {
      logout();
      return null;
    }
    return user;
  } catch (error) {
    logout();
    return null;
  }
};

const authService = {
  signup,
  login,
  logout,
  getCurrentUser,
};

export default authService;
