import axios from 'axios';
import authService from './authService';

// TODO: 타 기기에서 접속 안되는 문제 해결하기
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

    // 1. 로그인, 회원가입 요청 실패 시에는 재발급 시도 안 함 (무한 루프 방지)
    if (originalConfig.url.includes('/auth/login') || originalConfig.url.includes('/auth/signup')) {
      return Promise.reject(err);
    }

    // 2. 401 에러이고, 아직 재시도하지 않은 요청일 경우
    if (err.response?.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;

      try {
        // 3. 토큰 재발급 시도
        await authService.refresh();
        // 4. 재발급 성공 시, 실패했던 원래 요청을 다시 시도
        return api(originalConfig);
      } catch (_error) {
        // 5. 재발급 실패 시, 로그아웃 처리
        authService.logout();
        window.location.href = '/login'; // 로그인 페이지로 이동
        return Promise.reject(_error);
      }
    }

    return Promise.reject(err);
  },
);

export default api;
