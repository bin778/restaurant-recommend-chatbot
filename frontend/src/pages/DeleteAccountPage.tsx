import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import userService from '../services/userService';
import authService from '../services/authService';

const DeleteAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!window.confirm('정말로 계정을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      await userService.deleteMyAccount({ password });
      authService.logout();
      navigate('/login', { state: { message: '회원 탈퇴가 완료되었습니다.' } });
    } catch (err: any) {
      setError(err.response?.data || '계정 탈퇴에 실패했습니다. 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="form-card">
      <h1>계정 탈퇴</h1>
      <p className="description">계정을 탈퇴하시려면, 보안을 위해 현재 비밀번호를 입력해주세요.</p>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleDelete}>
        <div className="form-group">
          <label htmlFor="password">현재 비밀번호</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn-danger">
          계정 탈퇴
        </button>
      </form>
      <div className="link-group">
        <Link to="/mypage">마이페이지로 돌아가기</Link>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
