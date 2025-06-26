import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import chatService from '../services/chatService';
import '../styles/_ChatLayout.scss'; // SCSS 파일 임포트
import type { ChatSessionInfo } from '../types';

const ChatLayoutPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSessionInfo[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchSessions = useCallback(() => {
    chatService
      .getChatSessions()
      .then(res => {
        setSessions(res.data);
      })
      .catch(err => {
        console.error('세션 목록을 불러오는데 실패했습니다.', err);
      });
  }, []);

  // 페이지가 로드되거나, 채팅방 URL이 바뀔 때마다 세션 목록을 다시 불러옵니다.
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions, location.pathname]);

  const handleNewChat = () => {
    navigate('/chat');
  };

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <button onClick={handleNewChat} className="new-chat-btn">
          + 새 대화 시작하기
        </button>
        <nav className="session-list">
          {sessions.map(session => (
            // a 태그 대신 react-router-dom의 Link 컴포넌트를 사용합니다.
            <Link
              to={`/chat/${session.sessionId}`}
              key={session.sessionId}
              className={`session-item ${location.pathname.includes(String(session.sessionId)) ? 'active' : ''}`}
            >
              {session.title}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="chat-content">
        {/* 자식 라우트(ChatPage)가 여기에 렌더링됩니다. */}
        <Outlet />
      </main>
    </div>
  );
};

export default ChatLayoutPage;
