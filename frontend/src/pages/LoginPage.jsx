import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const LoginPage = ({ setCurrentUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    try {
      const userData = await authService.login(email, password);
      setCurrentUser(userData); // App의 상태 업데이트
      navigate('/'); // 로그인 성공 시 홈으로 이동
    } catch (err) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="container">
      <div className="form-card">
        <h1>로그인</h1>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">
            로그인
          </button>
        </form>
        <div className="link-group">
          <span>계정이 없으신가요? </span>
          <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
