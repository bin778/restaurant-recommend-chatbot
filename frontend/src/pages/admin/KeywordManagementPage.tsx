import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import type { BannedKeyword } from '../../types';
import '../../styles/_admin.scss';
import { AxiosError } from 'axios';

const KeywordManagementPage: React.FC = () => {
  const [keywords, setKeywords] = useState<BannedKeyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const response = await adminService.getKeywords();
        setKeywords(response.data);
      } catch (err) {
        setError('키워드 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchKeywords();
  }, []);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKeyword = newKeyword.trim();
    if (!trimmedKeyword) return;
    try {
      const response = await adminService.addKeyword(trimmedKeyword);
      setKeywords(prev => [...prev, response.data]);
      setNewKeyword('');
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        alert(`키워드 추가 실패: ${err.response.data}`);
      } else {
        alert('키워드 추가에 실패했습니다.');
      }
    }
  };

  const handleDeleteKeyword = async (id: number) => {
    if (window.confirm(`키워드 ID: ${id}를 정말 삭제하시겠습니까?`)) {
      try {
        await adminService.deleteKeyword(id);
        setKeywords(prev => prev.filter(k => k.id !== id));
      } catch (err) {
        alert('키워드 삭제에 실패했습니다.');
      }
    }
  };

  if (loading)
    return (
      <div className="card admin-card">
        <h1>로딩 중...</h1>
      </div>
    );
  if (error)
    return (
      <div className="card admin-card">
        <h1>오류</h1>
        <p className="error-msg">{error}</p>
      </div>
    );

  return (
    <div className="card admin-card">
      <h1>부적절 키워드 관리</h1>
      <form onSubmit={handleAddKeyword} className="keyword-form">
        <input
          type="text"
          value={newKeyword}
          onChange={e => setNewKeyword(e.target.value)}
          placeholder="필터링할 키워드 입력..."
        />
        <button type="submit" className="btn-primary">
          추가
        </button>
      </form>
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>키워드</th>
              <th>등록한 관리자</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map(kw => (
              <tr key={kw.id}>
                <td>{kw.id}</td>
                <td>{kw.keyword}</td>
                <td>{kw.adminNickname}</td>
                <td>{new Date(kw.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDeleteKeyword(kw.id)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="link-group">
        <Link to="/admin">관리자 홈으로</Link>
      </div>
    </div>
  );
};

export default KeywordManagementPage;
