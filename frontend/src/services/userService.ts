import api from './api';
import type { UserInfo, UpdateProfileData, DeleteAccountData } from '../types';

const API_URL = '/api/users';

// 내 정보 조회
const getMyInfo = () => {
  return api.get<UserInfo>(`${API_URL}/me`);
};

// 프로필 수정
const updateProfile = (data: UpdateProfileData) => {
  return api.put(`${API_URL}/me`, data);
};

// 회원 탈퇴
const deleteAccount = (data: DeleteAccountData) => {
  return api.post(`${API_URL}/delete`, data);
};

const userService = {
  getMyInfo,
  updateProfile,
  deleteAccount,
};

export default userService;
