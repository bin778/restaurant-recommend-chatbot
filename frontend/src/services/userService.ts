import api from './api';
import type { UpdateProfileData, DeleteAccountData } from '../types';

const API_URL = '/api/users/';

const getMyInfo = () => {
  return api.get(API_URL + 'me');
};

// 회원 정보 수정 요청
const updateMyInfo = (data: UpdateProfileData) => {
  return api.put(API_URL + 'me', data);
};

// 회원 탈퇴 요청
const deleteMyAccount = (data: DeleteAccountData) => {
  return api.delete(API_URL + 'me', { data });
};

const userService = {
  getMyInfo,
  updateMyInfo,
  deleteMyAccount,
};

export default userService;
