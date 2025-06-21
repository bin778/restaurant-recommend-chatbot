# 🤖 LLM 맛집 추천 챗봇 (Restaurant-Recommend-Chatbot)

> 자연어 처리(LLM)를 기반으로 사용자의 의도를 파악하여 맛집을 추천하고, 대화형으로 상세 정보를 제공하는 웹 서비스이다.

<br/>

## 📖 프로젝트 소개

맛집을 찾을 때 더 이상 단순 키워드 검색에 의존하지 않고, 사람과 대화하듯 편안하게 원하는 맛집을 찾을 수 있는 경험을 제공하고자 하였다. 이 프로젝트는 LLM을 활용하여 사용자의 복잡하고 감성적인 요구사항("비 오는 날 어울리는 국물 요리 맛집 알려줘")까지 이해하고, 네이버 지도 데이터를 기반으로 최적의 맛집을 추천하는 대화형 챗봇 서비스이다.

백엔드는 Spring Boot의 안정적인 아키텍처 위에서 REST API를 제공하며, 프론트엔드는 React와 TypeScript를 사용하여 반응성이 뛰어난 모던 웹 UI를 구현하였다. AI 모델과의 통신은 별도의 Python 서버를 통해 이루어지며, 이를 통해 각 기술 스택의 장점을 최대한 활용하고 시스템의 모듈성을 높였다.

<br/>

## 🗓️ 개발 정보

- **개발 기간:** 2025.06.12 ~ 2025.07.08
- **개발 인원:** [@최영빈](https://github.com/bin778) (1인 개발)

<br/>

## 🛠️ 기술 스택

### 🖥️ Frontend

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### ⚙️ Backend

![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![JPA](https://img.shields.io/badge/JPA-6DB33F?style=for-the-badge&logo=hibernate&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### 🧠 AI / Data

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Naver Cloud](https://img.shields.io/badge/Naver_Cloud_Platform-03C75A?style=for-the-badge&logo=naver&logoColor=white)

### 💾 Database

![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

### ☁️ Deployment & Tools

![Amazon EC2](https://img.shields.io/badge/Amazon_EC2-FF9900?style=for-the-badge&logo=amazon-ec2&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![IntelliJ IDEA](https://img.shields.io/badge/IntelliJ_IDEA-000000?style=for-the-badge&logo=intellij-idea&logoColor=white)
![Visual Studio Code](https://img.shields.io/badge/Visual_Studio_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)

<br/>

## 📋 주요 기능

### 일반 사용자

- **회원 관리:** 회원가입, 로그인/로그아웃, 비밀번호 보안 규칙 적용
- **내 정보 관리:** 본인 정보 조회, 닉네임/비밀번호 수정, 계정 탈퇴
- **보안 강화:** 로그인 시도 횟수 제한(Rate Limiting)을 통한 Brute-force 공격 방어.
- **대화형 챗봇 (구현 예정):**
  - 자연어 기반 맛집 추천 요청
  - 핵심 키워드(지역, 음식 종류, 분위기 등) 자동 추출
  - 대화 로그 저장 및 조회

### 관리자 (구현 예정)

- **사용자 관리:** 전체 회원 목록 조회 및 특정 계정 삭제
- **콘텐츠 관리:** 부적절한 검색어(금지어) 등록 및 관리

<br/>

## 📡 API 명세

| Method   | URL                 | 설명               |   인증   |
| :------- | :------------------ | :----------------- | :------: |
| `POST`   | `/api/auth/signup`  | 회원가입           |    ✕     |
| `POST`   | `/api/auth/login`   | 로그인 (JWT 발급)  |    ✕     |
| `POST`   | `/api/auth/refresh` | 액세스 토큰 재발급 | ○ (쿠키) |
| `GET`    | `/api/users/me`     | 내 정보 조회       |    ○     |
| `PUT`    | `/api/users/me`     | 내 정보 수정       |    ○     |
| `DELETE` | `/api/users/me`     | 회원 탈퇴          |    ○     |
| `POST`   | `/api/chat`         | 챗봇 메시지 전송   |    ○     |

<br/>

## 🏗️ 시스템 아키텍처

**[프론트엔드 아키텍처]**

![image](https://github.com/user-attachments/assets/86394f3b-36b5-4734-9a49-d39e1b7894fc)

**[백엔드 아키텍처]**

![image](https://github.com/user-attachments/assets/63679876-2e77-4999-8374-1b410dff5e49)

**[Python LLM 서버 아키텍처]**

![image](https://github.com/user-attachments/assets/9a0adc0b-4db4-44ae-a319-7148e74302b1)

**[전체 시스템 흐름도 아키텍처]**

![image](https://github.com/user-attachments/assets/b955f14a-9e1d-43e3-a733-cc2bebdfbebb)

<br/>

## 💡 고민 및 해결 과정 (Troubleshooting)

- Spring Security & JWT 403 Forbidden 에러

  - 문제: 맞는 비밀번호로 로그인할 때만 403 에러가 발생하고, 틀린 비밀번호는 401로 정상 처리되는 기이한 현상. CSRF, CORS, 필터 순서 등 모든 설정을 점검해도 해결되지 않음.
  - 원인: SecurityConfig가 UserService를, UserService는 PasswordEncoder Bean을 필요로 하는 Bean 순환 참조(Circular Dependency) 구조가 근본적인 원인이었음. 이로 인해 Spring Security의 인증/인가 메커니즘이 불안정하게 동작.
  - 해결: SecurityConfig의 생성자에서 UserService 직접 주입을 제거하고, DaoAuthenticationProvider Bean을 생성하는 메서드의 파라미터로 UserService를 주입받도록 구조를 변경하여 의존성 고리를 끊음으로써 문제를 해결.

- SCSS @use와 @extend의 동작 방식
  - 문제: 최신 SCSS의 @use 규칙 도입 후, 다른 파일에 있는 클래스를 @extend로 상속받으려 할 때 "Target selector was not found" 에러 로 인해 코드가 꼬이는 현상이 발생함.
  - 해결: 스타일 상속이 필요한 부분은 @extend 대신 @mixin과 @include를 사용하여 해결. 이를 통해 모듈화된 스타일 환경에서도 안전하게 코드를 재사용.

<br/>

## 🚀 프로젝트 실행 방법

### 1. 사전 요구사항

- `Java 17.0` 이상
- `Node.js 18.0` 이상
- `MySQL 8.0` 이상
- `IntelliJ IDEA` (또는 선호하는 Java IDE)
- `Visual Studio Code` (또는 선호하는 Frontend IDE)

### 2. 백엔드 서버 실행

```bash
# 1. 데이터베이스 생성 및 설정
#    - MySQL에 'restaurant_chatbot_db' 데이터베이스 생성
#    - backend/src/main/resources/application-local.properties 파일에 DB 계정 정보 입력

# 2. 백엔드 프로젝트 루트로 이동
cd backend

# 3. Maven을 사용하여 프로젝트 빌드 및 실행
./mvnw spring-boot:run
```

- 백엔드 서버는 localhost:8080에서 실행 (HTTPS 설정 시 8443)

### 3. 프론트엔드 서버 실행

```bash
# 1. 프론트엔드 프로젝트 루트로 이동
cd frontend

# 2. 필요한 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

- 프론트엔드 서버는 localhost:5173에서 실행 (웹 브라우저에서 이 주소로 접속)
