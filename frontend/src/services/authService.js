import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// 백엔드 API 서버의 기본 경로
const API_URL = '/api/auth/';

// 회원가입 요청
const signup = (email, password, nickname) => {
  return axios.post(API_URL + 'signup', {
    email,
    password,
    nickname,
  });
};

// 로그인 요청
const login = async (email, password) => {
  const response = await axios.post(API_URL + 'login', { email, password });
  if (response.data.accessToken) {
    // 백엔드에서 받은 사용자 정보를 'user'라는 키로 localStorage에 저장
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// 로그아웃
const logout = () => {
  localStorage.removeItem('user');
};

// 현재 로그인된 사용자 정보 가져오기 (토큰 유효성 검사 포함)
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }

  try {
    const user = JSON.parse(userStr);
    const decodedJwt = jwtDecode(user.accessToken);

    // 토큰이 만료되었으면 사용자 정보 삭제 후 null 반환
    if (decodedJwt.exp * 1000 < Date.now()) {
      logout();
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error parsing user data from localStorage', error);
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
