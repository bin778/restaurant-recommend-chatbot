import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await authService.signup(email, password, nickname);
      setMessage('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
      setTimeout(() => navigate('/login'), 2000); // 2초 후 로그인 페이지로 이동
    } catch (err) {
      setError('회원가입에 실패했습니다. 이미 사용 중인 이메일일 수 있습니다.');
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="container">
      <div className="form-card">
        <h1>회원가입</h1>
        {error && <p className="error-msg">{error}</p>}
        {message && <p className="success-msg">{message}</p>}
        <form onSubmit={handleSignup}>
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
          <div className="form-group">
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">
            회원가입
          </button>
        </form>
        <div className="link-group">
          <span>이미 계정이 있으신가요? </span>
          <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
