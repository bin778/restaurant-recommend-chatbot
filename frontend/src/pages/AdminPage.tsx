import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
import type { AdminUserInfo } from '../types';
import '../styles/_admin.scss';

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminService.getAllUsers();
        setUsers(response.data);
      } catch (err) {
        setError('회원 목록을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = (userId: number) => {
    if (window.confirm(`사용자 ID: ${userId}를 정말 삭제하시겠습니까?`)) {
      // 삭제 로직 구현 예정
      alert('삭제 기능은 구현 예정입니다.');
    }
  };

  if (loading)
    return (
      <div className="admin-container">
        <h2>로딩 중...</h2>
      </div>
    );
  if (error)
    return (
      <div className="admin-container">
        <p className="error-msg">{error}</p>
      </div>
    );

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>관리자 페이지</h1>
        <Link to="/">홈으로 돌아가기</Link>
      </header>

      <div className="admin-content">
        <h2>회원 목록 관리</h2>
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
                    <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
