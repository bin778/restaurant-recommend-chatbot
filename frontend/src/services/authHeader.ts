// API 요청 시 사용할 인증 헤더를 반환하는 함수
export default function authHeader(): { Authorization: string } | {} {
  const userStr = localStorage.getItem('user');
  let user = null;
  if (userStr) {
    user = JSON.parse(userStr);
  }

  if (user && user.accessToken) {
    return { Authorization: 'Bearer ' + user.accessToken };
  } else {
    return {};
  }
}
