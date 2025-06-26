import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import chatService from '../services/chatService';
import '../styles/_chat.scss';
import type { Message } from '../types';
import BackButton from '../components/BackButton';

const ChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadChat = async () => {
      setIsLoading(true);
      const welcomeMessage: Message = {
        id: Date.now(),
        sender: 'bot',
        text: '안녕하세요~ 원하는 맛집을 찾고 싶으신건가요? 제가 도와드릴게요!',
      };

      if (sessionId) {
        try {
          const res = await chatService.getMessages(Number(sessionId));
          const initialMessages = res.data.map((msg, i) => ({ ...msg, id: i }));
          setMessages(initialMessages);
        } catch (error) {
          console.error('메시지 로딩 실패:', error);
          setMessages([{ ...welcomeMessage, text: '대화 기록을 불러오는 데 실패했습니다.' }]);
        }
      } else {
        setMessages([welcomeMessage]);
      }
      setIsLoading(false);
    };
    loadChat();
  }, [sessionId]);

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
    const userMessage: Message = { id: Date.now(), text: userMessageText, sender: 'user' };

    // 화면에 사용자 메시지를 즉시 추가 (사용자 경험 향상)
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // --- 이 부분이 핵심적인 수정 사항입니다 ---
      // chatService에 (sessionId, 메시지 텍스트) 두 개의 인수를 올바르게 전달합니다.
      const response = await chatService.sendMessage(currentSessionId, userMessageText);

      const newSessionId = response.data.sessionId;
      const botMessage: Message = { id: Date.now() + 1, text: response.data.reply, sender: 'bot' };

      // 서버 응답을 메시지 목록에 추가합니다.
      setMessages(prev => [...prev, botMessage]);

      // 새 대화였다면, 응답으로 받은 새 세션 ID로 URL을 변경합니다.
      if (!currentSessionId && newSessionId) {
        navigate(`/chat/${newSessionId}`, { replace: true });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: '죄송합니다, 답변 생성 중 오류가 발생했습니다.',
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-window">
      <header className="chat-header">
        <BackButton />
        <h1>맛집 추천 챗봇 🤖</h1>
      </header>
      <main className="message-list" ref={messageListRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`message-bubble-wrapper ${msg.sender}`}>
            <div className={`message-bubble ${msg.sender}-message`}>
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
            {/* 전송 아이콘 SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;
