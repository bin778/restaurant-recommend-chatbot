import React from 'react';
import { Link } from 'react-router-dom';

const AdminPage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>관리자 페이지</h1>
      <p>이 페이지는 관리자(ROLE_ADMIN)만 접근할 수 있습니다.</p>
      <nav>
        <ul>
          <li>회원 목록 관리 (구현 예정)</li>
          <li>부적절 키워드 관리 (구현 예정)</li>
        </ul>
      </nav>
      <br />
      <Link to="/">홈으로 돌아가기</Link>
    </div>
  );
};

export default AdminPage;
