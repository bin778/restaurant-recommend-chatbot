import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import authService from '../services/authService';
import type { UserInfo } from '../types';

// TODO: 회원 수정 및 탈퇴를 분리하도록 수정할 것!
const MyPage: React.FC = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [nickname, setNickname] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 초기 데이터 로딩
  useEffect(() => {
    userService
      .getMyInfo()
      .then(response => {
        setUserInfo(response.data);
        setNickname(response.data.nickname); // 닉네임 초기값 설정
        setLoading(false);
      })
      .catch(err => {
        setError('사용자 정보를 불러오는 데 실패했습니다.');
        setLoading(false);
      });
  }, []);

  // 정보 수정 핸들러
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await userService.updateMyInfo({ nickname, newPassword, confirmPassword });
      setSuccess('회원 정보가 성공적으로 수정되었습니다.');
      // 닉네임이 변경되면 로컬 스토리지 정보도 업데이트
      const user = authService.getCurrentUser();
      if (user) {
        user.nickname = nickname;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err: any) {
      setError(err.response?.data || '정보 수정에 실패했습니다.');
    }
  };

  // 계정 탈퇴 핸들러
  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!window.confirm('정말로 계정을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      await userService.deleteMyAccount({ password: deletePassword });
      authService.logout(); // 로그아웃 처리
      navigate('/login', { state: { message: '회원 탈퇴가 완료되었습니다.' } });
    } catch (err: any) {
      setError(err.response?.data || '계정 탈퇴에 실패했습니다.');
    }
  };

  if (loading)
    return (
      <div className="card">
        <h1>로딩 중...</h1>
      </div>
    );
  if (!userInfo)
    return (
      <div className="card">
        <h1>오류</h1>
        <p className="error-msg">{error}</p>
      </div>
    );

  return (
    <div className="card mypage-card">
      <h1>내 정보</h1>
      <p className="email-display">이메일: {userInfo.email}</p>

      {/* 정보 수정 폼 */}
      <form onSubmit={handleUpdate} className="mypage-form">
        <h2>정보 수정</h2>
        <div className="form-group">
          <label htmlFor="nickname">닉네임</label>
          <input id="nickname" type="text" value={nickname} onChange={e => setNickname(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">새 비밀번호 (변경 시 입력)</label>
          <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">새 비밀번호 확인</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          수정하기
        </button>
      </form>

      <hr className="divider" />

      {/* 계정 탈퇴 폼 */}
      <form onSubmit={handleDelete} className="mypage-form">
        <h2>계정 탈퇴</h2>
        <div className="form-group">
          <label htmlFor="deletePassword">현재 비밀번호를 입력하세요</label>
          <input
            id="deletePassword"
            type="password"
            value={deletePassword}
            onChange={e => setDeletePassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-danger">
          계정 탈퇴
        </button>
      </form>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div className="button-group">
        <Link to="/" className="btn btn-secondary">
          홈으로
        </Link>
      </div>
    </div>
  );
};

export default MyPage;
