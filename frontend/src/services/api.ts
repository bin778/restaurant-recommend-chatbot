import axios from 'axios';
import authService from './authService';

const api = axios.create({
  baseURL: 'https://192.168.0.104:8443', // 백엔드 HTTPS 주소
});

// 요청 인터셉터: 모든 요청 헤더에 액세스 토큰을 추가
api.interceptors.request.use(
  config => {
    const user = authService.getCurrentUser();
    if (user && user.accessToken) {
      config.headers['Authorization'] = 'Bearer ' + user.accessToken;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터: 401 에러 발생 시 토큰 재발급 로직
api.interceptors.response.use(
  res => {
    return res;
  },
  async err => {
    const originalConfig = err.config;

    // 로그인, 회원가입, 그리고 "회원 탈퇴" 요청 실패 시에는 재발급을 시도 X
    const publicUrls = ['/auth/login', '/auth/signup', '/users/delete'];
    if (publicUrls.some(url => originalConfig.url.includes(url))) {
      return Promise.reject(err);
    }

    // 401 에러이고, 아직 재시도하지 않은 요청일 경우
    if (err.response?.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;

      try {
        await authService.refresh();
        return api(originalConfig);
      } catch (_error) {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(_error);
      }
    }

    return Promise.reject(err);
  },
);

export default api;
