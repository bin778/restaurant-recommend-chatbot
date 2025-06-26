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
    setIsSidebarOpen(false);
  }, [fetchSessions, location.pathname]);

  const handleNewChat = () => {
    navigate('/chat');
  };

  // --- 대화 삭제 핸들러 추가 ---
  const handleDeleteSession = async (sessionIdToDelete: number, e: React.MouseEvent) => {
    e.preventDefault(); // 부모인 Link 태그의 페이지 이동을 막습니다.
    e.stopPropagation(); // 이벤트 버블링을 막습니다.

    if (window.confirm('이 대화를 정말 삭제하시겠습니까?')) {
      try {
        await chatService.deleteChatSession(sessionIdToDelete);
        // 삭제 성공 시, 세션 목록을 상태에서 직접 제거하여 즉시 UI에 반영
        setSessions(prevSessions => prevSessions.filter(s => s.sessionId !== sessionIdToDelete));

        // 만약 현재 보고 있는 페이지가 삭제된 세션이라면, 새 대화 페이지로 이동
        if (location.pathname.includes(String(sessionIdToDelete))) {
          navigate('/chat', { replace: true });
        }
      } catch (err) {
        console.error('대화 삭제 실패:', err);
        alert('대화 삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="chat-layout">
      {isSidebarOpen && <div className="sidebar-overlay open" onClick={() => setIsSidebarOpen(false)}></div>}

      <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
        </svg>
      </button>

      <aside className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button onClick={handleNewChat} className="new-chat-btn">
          <span>+</span>
          <span>새 대화 시작하기</span>
        </button>
        <nav className="session-list">
          {sessions.map(session => (
            <Link
              to={`/chat/${session.sessionId}`}
              key={session.sessionId}
              className={`session-item ${location.pathname.endsWith(String(session.sessionId)) ? 'active' : ''}`}
            >
              <span>{session.title}</span>
              <button className="delete-session-btn" onClick={e => handleDeleteSession(session.sessionId, e)}>
                {/* 휴지통 아이콘 SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                  ></path>
                </svg>
              </button>
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
