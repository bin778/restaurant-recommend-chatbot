import api from './api';
import authHeader from './authHeader';
import type { UpdateProfileData, DeleteAccountData } from '../types';

const API_URL = '/api/users/';

// 서버에 내 정보 요청
const getMyInfo = () => {
  // authHeader()를 사용하여 요청 헤더에 JWT 추가
  return api.get(API_URL + 'me', { headers: authHeader() });
};

// 회원 정보 수정 요청
const updateMyInfo = (data: UpdateProfileData) => {
  return api.put(API_URL + 'me', data, { headers: authHeader() });
};

// 회원 탈퇴 요청
const deleteMyAccount = (data: DeleteAccountData) => {
  return api.delete(API_URL + 'me', { headers: authHeader(), data });
};

const userService = {
  getMyInfo,
  updateMyInfo,
  deleteMyAccount,
};

export default userService;
