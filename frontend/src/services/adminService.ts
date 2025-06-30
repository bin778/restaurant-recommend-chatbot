import api from './api';
import type { AdminUserInfo } from '../types';

const API_URL = '/api/admin';

// 전체 사용자 목록 가져오기
const getAllUsers = () => {
  return api.get<AdminUserInfo[]>(`${API_URL}/users`);
};

// TODO: 특정 사용자 삭제 (구현 예정)
const deleteUser = (userId: number) => {
  return api.delete(`${API_URL}/users/${userId}`);
};

const adminService = {
  getAllUsers,
  deleteUser,
};

export default adminService;
