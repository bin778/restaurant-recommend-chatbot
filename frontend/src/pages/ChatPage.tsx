import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';
import BackButton from '../components/BackButton';
import '../styles/_chat.scss';
import type { Message } from '../types';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: '안녕하세요~ 원하는 맛집을 찾고 싶으신건가요? 제가 도와드릴게요!',
        sender: 'bot',
      },
    ]);
  }, []);

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

    // 새로운 메시지를 포함한 전체 대화 기록을 상태에 업데이트
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // chatService에 단일 메시지가 아닌, 업데이트된 전체 메시지 배열(newMessages)을 전달
      const response = await chatService.sendMessage(newMessages);
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
