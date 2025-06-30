// 로그인 성공 시 백엔드로부터 받는 사용자 정보 타입
export interface User {
  accessToken: string;
  grantType: string;
  nickname: string;
  role: string;
}

// 회원가입 요청 시 보내는 데이터 타입
export interface SignupData {
  email: string;
  password: string;
  nickname: string;
}

// 로그인 요청 시 보내는 데이터 타입
export interface LoginData {
  email: string;
  password: string;
}

// 내 정보 조회 응답 타입
export interface UserInfo {
  email: string;
  nickname: string;
}

// 정보 수정 요청 데이터 타입
export interface UpdateProfileData {
  nickname: string;
  newPassword?: string;
  confirmPassword?: string;
}

// 계정 삭제 요청 데이터 타입
export interface DeleteAccountData {
  password: string;
}

// 채팅 메시지 타입
export interface Message {
  id?: number;
  sender: 'user' | 'bot';
  text: string;
}

// 채팅 세션 목록 조회 시 사용하는 타입
export interface ChatSessionInfo {
  sessionId: number;
  title: string;
  createdAt: string;
}

// 관리자 페이지의 회원 목록에서 사용할 타입
export interface AdminUserInfo {
  id: number;
  email: string;
  nickname: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  createdAt: string;
}
