import axios from 'axios';
import authService from './authService';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: baseURL,
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

// 응답 인터셉터: 401 또는 403 에러 발생 시 토큰 재발급 로직
api.interceptors.response.use(
  res => {
    return res;
  },
  async err => {
    const originalConfig = err.config;

    // 로그인, 회원가입 등 재발급이 필요 없는 요청은 바로 에러를 반환
    const publicUrls = ['/auth/login', '/auth/signup', '/users/delete'];
    if (publicUrls.some(url => originalConfig.url.includes(url))) {
      return Promise.reject(err);
    }

    // 401 에러뿐만 아니라, 403 에러가 발생했을 때도 토큰 재발급을 시도
    if (err.response && (err.response.status === 401 || err.response.status === 403) && !originalConfig._retry) {
      originalConfig._retry = true; // 무한 재시도 방지

      try {
        console.log('액세스 토큰 만료! 재발급을 시도합니다...');
        await authService.refresh();
        // 토큰 재발급 성공 시, 실패했던 원래 요청을 새로운 토큰으로 다시 시도
        return api(originalConfig);
      } catch (_error) {
        // 재발급 실패 시 (리프레시 토큰도 만료된 경우)
        console.log('리프레시 토큰도 만료되었습니다. 로그아웃합니다.');
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(_error);
      }
    }

    return Promise.reject(err);
  },
);

export default api;
