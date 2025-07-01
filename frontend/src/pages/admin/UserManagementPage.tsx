import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import authService from '../../services/authService';
import type { AdminUserInfo } from '../../types';
import '../../styles/_admin.scss';
import { AxiosError } from 'axios';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentAdmin = authService.getCurrentUser();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminService.getAllUsers();
        setUsers(response.data);
      } catch (err) {
        setError('회원 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm(`사용자 ID: ${userId}를 정말 삭제하시겠습니까?`)) {
      try {
        await adminService.deleteUser(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
        alert('사용자가 성공적으로 삭제되었습니다.');
      } catch (err) {
        if (err instanceof AxiosError && err.response) {
          alert(`삭제 실패: ${err.response.data}`);
        } else {
          alert('사용자 삭제 중 알 수 없는 오류가 발생했습니다.');
        }
      }
    }
  };

  if (loading)
    return (
      <div className="card admin-card">
        <h1>로딩 중...</h1>
      </div>
    );
  if (error)
    return (
      <div className="card admin-card">
        <h1>오류</h1>
        <p className="error-msg">{error}</p>
      </div>
    );

  return (
    <div className="card admin-card">
      <h1>회원 목록 관리</h1>
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이메일</th>
              <th>닉네임</th>
              <th>역할</th>
              <th>가입일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.nickname}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>{user.role.replace('ROLE_', '')}</span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.id === currentAdmin?.id}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="link-group">
        <Link to="/admin">관리자 홈으로</Link>
      </div>
    </div>
  );
};

export default UserManagementPage;
