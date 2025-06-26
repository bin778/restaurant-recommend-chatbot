import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/_BackButton.scss'; // 뒤로가기 버튼 전용 스타일 임포트

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <button onClick={goBack} className="back-button">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor" />
      </svg>
    </button>
  );
};

export default BackButton;
