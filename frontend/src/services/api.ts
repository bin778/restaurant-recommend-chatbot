import axios from 'axios';
import authService from './authService.ts';

const api = axios.create();

// 요청 인터셉터: 모든 API 요청 헤더에 액세스 토큰을 추가합니다.
api.interceptors.request.use(
  config => {
    const user = authService.getCurrentUser();
    if (user && user.accessToken) {
      config.headers['Authorization'] = 'Bearer ' + user.accessToken;
    }
    return config;
  },
  error => Promise.reject(error),
);

// 응답 인터셉터: 401(Unauthorized) 에러 발생 시 토큰 재발급을 시도합니다.
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newUserData = await authService.refresh();
        // 새 액세스 토큰으로 헤더를 교체하고 원래 요청을 다시 시도합니다.
        originalRequest.headers['Authorization'] = 'Bearer ' + newUserData.accessToken;
        return api(originalRequest);
      } catch (refreshError) {
        authService.logout();
        window.location.href = '/login'; // 리프레시 실패 시 로그인 페이지로
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
