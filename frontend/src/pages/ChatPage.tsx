import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import chatService from '../services/chatService';
import '../styles/_chat.scss';
import type { Message } from '../types';
import BackButton from '../components/BackButton';
// TODO: Chrome이 아닐 경우 Chrome만 가능하다는 메시지 alert 추가
// TODO: 뒤로가기 할 때 바로 root(/)로 넘어오도록 수정

const ChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  // --- 음성 인식 자동 중지를 위한 타임아웃 Ref 추가 ---
  const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // 음성 인식을 시작하는 함수
  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: 'ko-KR' });

    // --- 1. 타이머 설정: 5초 후에 강제로 인식을 중지합니다. (모바일 환경의 무한 대기 방지) ---
    if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
    listeningTimeoutRef.current = setTimeout(() => {
      // 5초가 지나도 listening 상태가 true이면 강제 종료
      if (SpeechRecognition.browserSupportsSpeechRecognition() && listening) {
        SpeechRecognition.stopListening();
      }
    }, 5000); // 5초 (시간은 조절 가능)
  };

  // 음성 인식을 중지하는 함수
  const stopListening = () => {
    // --- 2. 타이머 정리: 수동으로 중지할 때도 설정된 타임아웃을 제거합니다. ---
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
    }
    SpeechRecognition.stopListening();
  };

  // 음성 인식이 종료되면 인식된 텍스트를 입력창에 채워줍니다.
  useEffect(() => {
    if (!listening && transcript) {
      // --- 2. 타이머 정리: 정상적으로 종료될 때도 타임아웃을 제거합니다. ---
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      setInputValue(prev => (prev ? prev + ' ' + transcript : transcript));
      resetTranscript();
    }
  }, [listening, transcript, resetTranscript]);

  // 컴포넌트가 언마운트될 때 실행중인 타이머 정리
  useEffect(() => {
    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  // ... loadChat, handleSendMessage 로직은 기존과 동일합니다 ...
  const loadChat = useCallback(async () => {
    const welcomeMessage: Message = {
      id: Date.now(),
      sender: 'bot',
      text: '안녕하세요! 맛집 추천 챗봇입니다. 무엇을 도와드릴까요?',
    };
    if (sessionId) {
      setIsLoading(true);
      try {
        const res = await chatService.getMessages(Number(sessionId));
        setMessages(res.data.map((msg, i) => ({ ...msg, id: msg.id || i })));
      } catch (error) {
        console.error('대화 기록 로딩 실패:', error);
        setMessages([{ ...welcomeMessage, text: '대화 기록을 불러오는 데 실패했습니다.' }]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setMessages([welcomeMessage]);
    }
  }, [sessionId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

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
      const response = await chatService.sendMessage(currentSessionId, userMessageText);
      const newSessionId = response.data.sessionId;
      const botMessage: Message = {
        id: response.data.logId || Date.now() + 1,
        text: response.data.reply,
        sender: 'bot',
      };

      setMessages(prev => [...prev, botMessage]);

      if (!currentSessionId && newSessionId) {
        navigate(`/chat/${newSessionId}`, { replace: true });
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
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

  const handleMicClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 권장합니다.</span>;
  }

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
            <div className="message-bubble bot-message loading-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </main>
      <footer className="chat-input-form">
        <form onSubmit={handleSendMessage}>
          <button type="button" onClick={handleMicClick} className={`mic-btn ${listening ? 'listening' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
            </svg>
          </button>
          <div className="input-wrapper">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={listening ? '듣고 있어요...' : '메시지를 입력하세요...'}
              disabled={isLoading}
            />
          </div>
          <button type="submit" disabled={isLoading || !inputValue} className="send-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2 .01 7z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;
