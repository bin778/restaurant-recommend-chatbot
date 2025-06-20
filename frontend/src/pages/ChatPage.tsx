import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService.ts';
import BackButton from '../components/BackButton.tsx';
import '../styles/_chat.scss';

// 메시지 객체의 타입을 정의
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  // 컴포넌트가 처음 로드될 때 웰컴 메시지를 추가
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: '안녕하세요~ 원하는 맛집을 찾고 싶으신건가요? 제가 도와드릴게요!',
        sender: 'bot',
      },
    ]);
  }, []);

  // 새 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMessage.text);
      const botMessage: Message = {
        id: Date.now() + 1,
        text: response.data.reply,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: '죄송합니다, 답변을 생성하는 중에 오류가 발생했습니다.',
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-page-container">
      <div className="chat-window">
        <header className="chat-header">
          <BackButton />
          <h1>맛집 추천 챗봇 🤖</h1>
        </header>
        <main className="message-list" ref={messageListRef}>
          {messages.map(msg => (
            <div key={msg.id} className={`message-bubble ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message-bubble bot-message loading-indicator">
              <span></span>
              <span></span>
              <span></span>
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
    </div>
  );
};

export default ChatPage;
