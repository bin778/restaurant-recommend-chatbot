import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import chatService from '../services/chatService';
import '../styles/_ChatLayout.scss';
import type { ChatSessionInfo } from '../types';

const ChatLayoutPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSessionInfo[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchSessions = useCallback(() => {
    chatService
      .getChatSessions()
      .then(res => setSessions(res.data))
      .catch(err => console.error('세션 목록 로딩 실패:', err));
  }, []);

  useEffect(() => {
    fetchSessions();
    setIsSidebarOpen(false); // 페이지 로드 시 사이드바 닫기
  }, [fetchSessions, location.pathname]);

  const handleNewChat = () => {
    navigate('/chat');
  };

  return (
    <div className="chat-layout">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
        </svg>
      </button>
      <aside className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button onClick={handleNewChat} className="new-chat-btn">
          + 새 대화 시작하기
        </button>
        <nav className="session-list">
          {sessions.map(session => (
            <Link
              to={`/chat/${session.sessionId}`}
              key={session.sessionId}
              className={`session-item ${location.pathname.endsWith(String(session.sessionId)) ? 'active' : ''}`}
            >
              {session.title}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="chat-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ChatLayoutPage;
