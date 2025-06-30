import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/_BackButton.scss';

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button className="back-button" onClick={() => navigate(-1)} aria-label="Go back">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
};

export default BackButton;
