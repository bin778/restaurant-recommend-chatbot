// 로그인 성공 시 백엔드로부터 받는 사용자 정보 타입
export interface User {
  accessToken: string;
  grantType: string;
  nickname: string;
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
