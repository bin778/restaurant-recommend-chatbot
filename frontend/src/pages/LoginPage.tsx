import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService.ts';
import BackButton from '../components/BackButton.tsx';
import type { User } from '../types';

// 컴포넌트가 받을 props의 타입을 정의
interface LoginPageProps {
  setCurrentUser: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setCurrentUser }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const userData = await authService.login({ email, password });
      setCurrentUser(userData);
      navigate('/');
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('로그인 중 오류가 발생했습니다.');
      }
      console.error('Login error:', err);
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
        <button type="submit" className="btn-auth">
          로그인
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
