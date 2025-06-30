import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import authService from '../services/authService';
import { AxiosError } from 'axios';

const UpdateProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setNickname(currentUser.nickname);
    }
  }, []);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await userService.updateProfile({ nickname, newPassword, confirmPassword });
      setSuccess('회원 정보가 성공적으로 수정되었습니다. 2초 후 마이페이지로 이동합니다.');

      // 닉네임 변경 시 localStorage의 정보도 업데이트
      const user = authService.getCurrentUser();
      if (user && user.nickname !== nickname) {
        user.nickname = nickname;
        localStorage.setItem('user', JSON.stringify(user));
      }

      setTimeout(() => navigate('/mypage'), 2000);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data || '정보 수정에 실패했습니다.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h1>정보 수정</h1>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label htmlFor="nickname">닉네임</label>
            <input id="nickname" type="text" value={nickname} onChange={e => setNickname(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">새 비밀번호 (변경 시 입력)</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
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

          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}

          <button type="submit" className="btn btn-primary">
            수정하기
          </button>
        </form>
        <div className="link-group">
          <Link to="/mypage">마이페이지로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfilePage;
