import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';
import type { UserInfo } from '../types';
import '../styles/_mypage.scss';

interface MyPageProps {
  onLogout: () => void;
}

const MyPage: React.FC<MyPageProps> = () => {
  const currentUser = authService.getCurrentUser();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userService
      .getMyInfo()
      .then(response => {
        setUserInfo(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('사용자 정보를 불러오는 데 실패했습니다.');
        setLoading(false);
        console.error(err);
      });
  }, []);

  if (loading)
    return (
      <div className="card mypage-card">
        <h1>로딩 중...</h1>
      </div>
    );
  if (error)
    return (
      <div className="card mypage-card">
        <h1>오류</h1>
        <p>{error}</p>
      </div>
    );

  return (
    <div className="card mypage-card">
      <h1>마이페이지</h1>
      {userInfo && (
        <div className="info-grid">
          <div className="info-row">
            <span className="info-label">이메일</span>
            <span className="info-value">{userInfo.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">닉네임</span>
            <span className="info-value">{userInfo.nickname}</span>
          </div>
        </div>
      )}

      <div className="button-group">
        <Link to="/update-profile" className="btn btn-primary">
          정보 수정
        </Link>

        {/* 관리자일 경우에만 관리자 페이지 이동 버튼 표시 */}
        {currentUser && currentUser.role === 'ROLE_ADMIN' && (
          <Link to="/admin" className="btn btn-secondary">
            관리자 페이지
          </Link>
        )}

        {/* Link 대신 button과 onLogout 함수를 사용 */}
        <Link to="/delete-account" className="btn btn-danger">
          계정 탈퇴
        </Link>
        <Link to="/" className="btn btn-secondary">
          홈으로
        </Link>
      </div>
    </div>
  );
};

export default MyPage;
