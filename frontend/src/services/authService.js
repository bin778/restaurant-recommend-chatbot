import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = '/api/auth/';

const signup = (email, password, nickname) => {
  // try-catch 블록을 호출하는 컴포넌트 쪽으로 이동시켜, axios가 던지는 에러를 직접 처리할 수 있게 한다.
  return axios.post(API_URL + 'signup', {
    email,
    password,
    nickname,
  });
};

const login = async (email, password) => {
  const response = await axios.post(API_URL + 'login', { email, password });
  if (response.data.accessToken) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// ... (logout, getCurrentUser는 기존과 동일)
const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }
  try {
    const user = JSON.parse(userStr);
    const decodedJwt = jwtDecode(user.accessToken);
    if (decodedJwt.exp * 1000 < Date.now()) {
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
