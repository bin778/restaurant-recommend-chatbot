import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

// TODO: 비밀번호를 특수문자도 허용하도록 수정할 것
const SignupPage: React.FC = () => {
  // 각 state가 문자열(string) 타입임을 명시
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();

  // 이벤트 객체(e)의 타입을 명시
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.');
      return;
    }

    try {
      // authService에 정의된 타입에 맞게 객체로 전달
      await authService.signup({ email, password, nickname });
      setMessage('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      // 에러 객체는 타입이 다양할 수 있어 any로 처리
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('회원가입 중 오류가 발생했습니다.');
      }
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="form-card">
      <h1>회원가입</h1>
      {error && <p className="error-msg">{error}</p>}
      {message && <p className="success-msg">{message}</p>}
      <form onSubmit={handleSignup}>
        <div className="form-group">
          <input
            type="email"
            id="signup-email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            id="signup-password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            id="signup-nickname"
            placeholder="닉네임"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-auth">
          회원가입
        </button>
      </form>
      <div className="link-group">
        <span>이미 계정이 있으신가요? </span>
        <Link to="/login">로그인</Link>
      </div>
    </div>
  );
};

export default SignupPage;
