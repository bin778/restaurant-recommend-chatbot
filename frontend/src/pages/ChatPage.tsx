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

  useEffect(() => {
    const loadChat = async () => {
      setIsLoading(true);
      const welcomeMessage: Message = {
        id: 1,
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

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 프론트엔드에서는 전체 대화기록이 아닌, 현재 세션 ID와 새 메시지만 보냅니다.
      const response = await chatService.sendMessage(currentSessionId, userMessageText);
      const botMessage: Message = { id: Date.now() + 1, text: response.data.reply, sender: 'bot' };

      setMessages(prev => [...prev, botMessage]);

      if (!currentSessionId) {
        const newSessionId = response.data.sessionId;
        navigate(`/chat/${newSessionId}`, { replace: true });
      }
    } catch (error) {
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
      <main className="message-list" ref={messageListRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`message-bubble-wrapper ${msg.sender}`}>
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
