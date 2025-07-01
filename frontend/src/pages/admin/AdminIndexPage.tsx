import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/_admin.scss';

const AdminIndexPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="card admin-index-card">
      <h1>관리자 페이지</h1>
      <p>원하는 관리 메뉴를 선택해주세요.</p>
      <div className="button-group">
        <button className="btn btn-primary" onClick={() => navigate('/admin/users')}>
          회원 목록 관리
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/admin/keywords')}>
          부적절 키워드 관리
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          사용자 홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default AdminIndexPage;
