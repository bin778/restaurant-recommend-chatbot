import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx'; // .tsx 확장자로 변경
import './styles/main.scss';

// getElementById가 null을 반환할 수 있으므로, root가 존재함을 확인
const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
} else {
  console.error('Root element not found');
}
