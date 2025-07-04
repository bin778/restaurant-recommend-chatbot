import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService.ts';
import BackButton from '../components/BackButton.tsx';
import type { User } from '../types';
import { AxiosError } from 'axios';

interface LoginPageProps {
  setCurrentUser: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setCurrentUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await authService.login({ email, password });
      setCurrentUser(user);
      navigate('/');
    } catch (err) {
      setLoading(false);

      // 에러 로깅 방식 변경
      if (err instanceof AxiosError && err.response) {
        // 서버가 보낸 에러 메시지를 상태에 저장하고, 콘솔에는 필요한 정보만 출력합니다.
        const errorMessage = err.response.data || '로그인에 실패했습니다. 아이디나 비밀번호를 확인해주세요.';
        setError(errorMessage);
        console.error(`Login API Error: ${err.response.status} - ${errorMessage}`);
      } else {
        // 네트워크 에러 등 그 외의 경우
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        console.error('Network or other error:', err);
      }
    }
  };

  return (
    <div className="form-card">
      <BackButton />
      <h1>로그인</h1>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <input
            type="email"
            id="login-email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            id="login-password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-auth" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <div className="link-group">
        <span>계정이 없으신가요? </span>
        <Link to="/signup">회원가입</Link>
      </div>
    </div>
  );
};

export default LoginPage;
