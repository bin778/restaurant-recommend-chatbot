import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { AxiosError } from 'axios';

const DeleteAccountPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!window.confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setLoading(false);
      return;
    }

    try {
      // 회원 탈퇴 API만 호출 (백엔드가 쿠키까지 처리)
      await userService.deleteAccount({ password });

      alert('회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.');

      // 프론트엔드에서는 localStorage만 정리
      localStorage.removeItem('user');

      navigate('/login', { replace: true });
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data || '비밀번호가 올바르지 않거나, 알 수 없는 오류가 발생했습니다.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h1>계정 탈퇴</h1>
        <p>계정을 영구적으로 삭제하시려면, 본인 확인을 위해 비밀번호를 입력해주세요.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              id="password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-danger" disabled={loading}>
            {loading ? '처리 중...' : '계정 영구 삭제'}
          </button>
        </form>
        <div className="link-container">
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            취소하고 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
