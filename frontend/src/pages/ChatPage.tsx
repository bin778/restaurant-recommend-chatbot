import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import chatService from '../services/chatService';
import '../styles/_chat.scss';
import type { Message } from '../types';

const ChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  // sessionId가 변경될 때마다 해당 세션의 메시지를 불러옵니다.
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      if (sessionId) {
        try {
          const res = await chatService.getMessages(Number(sessionId));
          setMessages(res.data);
        } catch (error) {
          console.error('메시지 로딩 실패:', error);
          setMessages([{ sender: 'bot', text: '대화 기록을 불러오는 데 실패했습니다.' }]);
        }
      } else {
        // 새 대화(/chat) 경로일 경우
        setMessages([{ sender: 'bot', text: '안녕하세요~ 원하는 맛집을 찾고 싶으신건가요? 제가 도와드릴게요!' }]);
      }
      setIsLoading(false);
    };
    loadMessages();
  }, [sessionId]);

  // 메시지 목록이 업데이트될 때마다 맨 아래로 스크롤합니다.
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userMessageText = inputValue.trim();
    if (!userMessageText || isLoading) return;

    const currentSessionId = sessionId ? Number(sessionId) : null;
    const userMessage: Message = { text: userMessageText, sender: 'user' };

    // 사용자 메시지를 화면에 즉시 추가
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 이제 백엔드 DTO와 일치하는 올바른 형식으로 API를 호출합니다.
      const response = await chatService.sendMessage(currentSessionId, userMessageText);
      const botMessage: Message = { text: response.data.reply, sender: 'bot' };

      // 서버 응답을 메시지 목록에 추가합니다.
      setMessages(prev => [...prev, botMessage]);

      // 새 대화였다면, 응답으로 받은 새 세션 ID로 URL을 변경합니다.
      if (!currentSessionId) {
        const newSessionId = response.data.sessionId;
        navigate(`/chat/${newSessionId}`, { replace: true });
      }
    } catch (error) {
      const errorMessage: Message = { text: '죄송합니다, 답변 생성 중 오류가 발생했습니다.', sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // ChatLayoutPage가 전체 틀을 담당하므로, ChatPage는 채팅창 내용만 렌더링합니다.
  return (
    <div className="chat-window">
      <header className="chat-header">
        <h1>맛집 추천 챗봇 🤖</h1>
      </header>
      <main className="message-list" ref={messageListRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message-bubble-wrapper ${msg.sender}`}>
            <div className="message-bubble">
              <div className="message-text">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-bubble-wrapper bot">
            <div className="message-bubble loading-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </main>
      <footer className="chat-input-form">
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            전송
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;
