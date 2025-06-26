import api from './api';
import type { UserInfo, UpdateProfileData, DeleteAccountData } from '../types';

const API_URL = '/api/users/';

const getMyInfo = () => {
  return api.get<UserInfo>(API_URL + 'me');
};

const updateMyInfo = (data: UpdateProfileData) => {
  return api.put(API_URL + 'me', data);
};

const deleteMyAccount = (data: DeleteAccountData) => {
  return api.delete(API_URL + 'me', { data });
};

const userService = {
  getMyInfo,
  updateMyInfo,
  deleteMyAccount,
};

export default userService;
