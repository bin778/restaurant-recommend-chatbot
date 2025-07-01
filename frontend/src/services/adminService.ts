import api from './api';
import type { AdminUserInfo, BannedKeyword } from '../types';

const API_URL = '/api/admin';

// 사용자 목록 관리
const getAllUsers = () => {
  return api.get<AdminUserInfo[]>(`${API_URL}/users`);
};

const deleteUser = (userId: number) => {
  return api.delete(`${API_URL}/users/${userId}`);
};

// 키워드 목록 관리
const getKeywords = () => {
  return api.get<BannedKeyword[]>(`${API_URL}/keywords`);
};

const addKeyword = (keyword: string) => {
  return api.post<BannedKeyword>(`${API_URL}/keywords`, { keyword });
};

const deleteKeyword = (id: number) => {
  return api.delete(`${API_URL}/keywords/${id}`);
};

const adminService = {
  getAllUsers,
  deleteUser,
  getKeywords,
  addKeyword,
  deleteKeyword,
};

export default adminService;
