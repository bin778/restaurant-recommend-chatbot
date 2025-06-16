import React from 'react';
import HomePage from './pages/HomePage';

function App() {
  // 지금은 상태가 없으므로, 하드코딩된 값으로 테스트
  const isLoggedIn = false;
  const user = { nickname: 'test' };

  return <HomePage user={isLoggedIn ? user : null} />;
}

export default App;
