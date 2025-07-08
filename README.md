# 🤖 LLM 맛집 추천 챗봇 (Restaurant-Recommend-Chatbot)

> 자연어 처리(LLM)와 RAG(검색 증강 생성) 기술을 기반으로, 사용자의 의도를 파악하여 실시간 맛집 정보를 추천하는 대화형 챗봇 서비스입니다.

<br/>

### ✨ 목차 (Table of Contents)

- [1. 프로젝트 개요](#-1-프로젝트-개요)
- [2. 주요 기능 및 화면](#-2-주요-기능-및-시연-영상)
- [3. 시스템 아키텍처](#%EF%B8%8F-3-시스템-아키텍처)
- [4. 요구사항 정의서](#-4-요구사항-정의서)
- [5. API 명세](#-5-api-명세)
- [6. 기술 스택](#%EF%B8%8F-6-기술-스택)
- [7. 고민 및 해결 과정 (Troubleshooting)](#-7-고민-및-해결-과정-troubleshooting)
- [8. 프로젝트 실행 방법](#-8-프로젝트-실행-방법)

<br/>

---

## 📖 1. 프로젝트 개요

### 1-1. 프로젝트 소개

맛집을 찾을 때 더 이상 단순 키워드 검색에 의존하지 않고, 사람과 대화하듯 편안하게 원하는 맛집을 찾을 수 있는 경험을 제공하고자 했습니다. 이 프로젝트는 **LLM(Gemini)** 을 활용하여 사용자의 복잡하고 감성적인 요구사항("비 오는 날 어울리는 국물 요리 맛집 알려줘")까지 이해하고, **RAG(검색 증강 생성)** 기술을 통해 네이버 지도 API의 실시간 정보를 바탕으로 최적의 맛집을 추천하는 대화형 챗봇 서비스입니다.

### 1-2. 개발 목표

- **기술적 목표:** 3-Tier 아키텍처(React-Spring-Python)를 구축하고, LLM과 외부 API를 연동하는 RAG 파이프라인을 직접 설계하고 구현합니다. 또한, JWT와 리프레시 토큰을 이용한 안전한 인증 시스템을 설계하고, 반응형 웹 디자인을 적용하여 다양한 기기에서 최적의 사용자 경험을 제공합니다.
- **사용자 목표:** 사용자가 복잡한 검색 없이 자연스러운 대화만으로 원하는 조건의 맛집 정보를 쉽고 빠르게 얻을 수 있도록 합니다.

### 1-3. 프로젝트 배포

- [res-chatbot.com](res-chatbot.com)

<br/>

---

## 📋 2. 주요 기능 및 시연 영상

### 일반 사용자

- **회원 관리:** JWT 기반의 안전한 회원가입, 로그인/로그아웃 (비밀번호 정책 및 시도 횟수 제한 적용).
- **내 정보 관리:** 본인 정보 조회, 닉네임/비밀번호 수정, 계정 탈퇴 기능.
- **대화형 챗봇:**
  - 자연어 기반 맛집 추천 요청.
  - RAG 기반의 정확한 정보 제공 (LLM 키워드 추출 → Naver API 검색 → LLM 답변 생성).
  - 음성 인식(STT)을 통한 메시지 입력 기능 (Chrome 브라우저 최적화).
  - 대화 로그 조회, 삭제 및 신규 대화 시작.

### 관리자

- **관리자 식별:** 로그인 시 `ROLE_ADMIN` 권한을 식별하여 관리자 전용 UI 노출.
- **회원 관리:** 전체 회원 목록 조회 및 특정 회원 삭제 기능.
- **콘텐츠 관리:** 부적절 키워드 등록/삭제 및 실시간 챗봇 필터링 적용.

### 시연 영상

https://github.com/user-attachments/assets/49c6f086-8a87-43ee-b41a-4a680648c286

<br/>

---

## 🏗️ 3. 시스템 아키텍처

**[프론트엔드 아키텍처]**

![프론트엔드 아키텍처](https://github.com/user-attachments/assets/86394f3b-36b5-4734-9a49-d39e1b7894fc)

**[백엔드 아키텍처]**

![백엔드 아키텍처](https://github.com/user-attachments/assets/63679876-2e77-4999-8374-1b410dff5e49)

**[Python LLM 서버 아키텍처]**

![Python LLM 서버 아키텍처](https://github.com/user-attachments/assets/9a0adc0b-4db4-44ae-a319-7148e74302b1)

**[전체 시스템 흐름도 아키텍처]**

![전체 시스템 흐름도 아키텍처](https://github.com/user-attachments/assets/b955f14a-9e1d-43e3-a733-cc2bebdfbebb)

<br/>

---

## 📝 4. 요구사항 정의서

| ID          | 기능 분류   | 기능 설명                                               | 우선순위 | 비고                   |
| :---------- | :---------- | :------------------------------------------------------ | :------: | :--------------------- |
| **User**    |
| U-01        | 회원가입    | 이메일, 비밀번호, 닉네임으로 회원가입.                  |  **상**  | 비밀번호 정책 적용     |
| U-02        | 로그인      | 이메일과 비밀번호로 로그인하여 JWT 발급.                |  **상**  | 로그인 실패 횟수 제한  |
| U-03        | 정보 수정   | 닉네임, 비밀번호 변경 가능.                             |  **상**  | 구현 완료              |
| U-04        | 계정 탈퇴   | 비밀번호 확인 후 계정 삭제.                             |  **상**  | 구현 완료              |
| **Chatbot** |
| C-01        | 메시지 전송 | 사용자가 입력한 메시지를 서버로 전송.                   |  **상**  | 구현 완료              |
| C-02        | 키워드 추출 | LLM을 사용하여 사용자 메시지에서 핵심 키워드 추출.      |  **상**  | 지역, 음식, 분위기     |
| C-03        | 정보 검색   | 추출된 키워드로 네이버 지도 API에서 맛집 정보 검색.     |  **상**  | RAG - Retrieval        |
| C-04        | 답변 생성   | 검색된 정보를 바탕으로 LLM이 자연스러운 추천 문장 생성. |  **상**  | RAG - Generation       |
| C-05        | 대화 로그   | 이전 대화 내용을 DB에 저장하고 불러오기.                |  **상**  | 구현 완료              |
| C-06        | 음성 인식   | 사용자가 음성으로 메시지 입력.                          |  **중**  | Chrome 브라우저 최적화 |
| **Admin**   |
| A-01        | 사용자 관리 | 관리자가 전체 회원 목록 조회 및 삭제.                   |  **상**  | 구현 완료              |
| A-02        | 키워드 관리 | 관리자가 부적절 키워드 등록/삭제 및 실시간 필터링.      |  **상**  | 구현 완료              |

<br/>

---

## 📡 5. API 명세

| Method   | URL                             | 설명                      |   인증    |
| :------- | :------------------------------ | :------------------------ | :-------: |
| `POST`   | `/api/auth/signup`              | 회원가입                  |     ✕     |
| `POST`   | `/api/auth/login`               | 로그인 (JWT 발급)         |     ✕     |
| `POST`   | `/api/auth/logout`              | 로그아웃 (쿠키 삭제)      |     ✕     |
| `POST`   | `/api/auth/refresh`             | 액세스 토큰 재발급        | ○ (쿠키)  |
| `GET`    | `/api/users/me`                 | 내 정보 조회              |     ○     |
| `PUT`    | `/api/users/me`                 | 내 정보 수정              |     ○     |
| `POST`   | `/api/users/delete`             | 회원 탈퇴                 |     ○     |
| `POST`   | `/api/chat`                     | 챗봇 메시지 전송          |     ○     |
| `GET`    | `/api/chat/sessions`            | 채팅 세션 목록 조회       |     ○     |
| `GET`    | `/api/chat/{id}/messages`       | 특정 세션 대화 조회       |     ○     |
| `DELETE` | `/api/chat/sessions/{id}`       | 채팅 세션 삭제            |     ○     |
| `GET`    | `/api/admin/users`              | (관리자) 모든 유저 조회   | ○ (Admin) |
| `DELETE` | `/api/admin/users/{id}`         | (관리자) 특정 유저 삭제   | ○ (Admin) |
| `GET`    | `/api/admin/keywords`           | (관리자) 금지어 목록 조회 | ○ (Admin) |
| `POST`   | `/api/admin/keywords`           | (관리자) 금지어 추가      | ○ (Admin) |
| `DELETE` | `/api/admin/keywords/{id}`      | (관리자) 금지어 삭제      | ○ (Admin) |
| `GET`    | `/api/public/filtered-keywords` | (Public) 금지어 목록 조회 |     ✕     |

<br/>

---

## 🛠️ 6. 기술 스택

### 🖥️ Frontend

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### ⚙️ Backend

![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white) ![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=openjdk&logoColor=white) ![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=spring&logoColor=white) ![JPA](https://img.shields.io/badge/JPA-6DB33F?style=for-the-badge&logo=hibernate&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### 🧠 AI / Data

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white) ![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B7?style=for-the-badge&logo=google-gemini&logoColor=white) ![Naver Cloud](https://img.shields.io/badge/Naver_Cloud_Platform-03C75A?style=for-the-badge&logo=naver&logoColor=white)

### 💾 Database

![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

### ☁️ Deployment & Tools

![Amazon EC2](https://img.shields.io/badge/Amazon_EC2-FF9900?style=for-the-badge&logo=amazon-ec2&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

<br/>

---

## 💡 7. 고민 및 해결 과정 (Troubleshooting)

이 프로젝트를 진행하며 마주했던 주요 기술적 고민과 해결 과정을 기록합니다.

#### 7-1. Spring Security 순환 참조로 인한 `403 Forbidden` 에러

- **문제 현상**: 유효한 계정으로 로그인할 때만 원인 불명의 `403 Forbidden` 에러가 발생.
- **원인 분석**: `SecurityConfig`와 `UserService` 간의 **Bean 순환 참조(Circular Dependency)** 발생.
- **해결 과정**: `DaoAuthenticationProvider`를 사용하여 Bean 생성 순서의 의존성을 분리하여 순환 참조 문제를 해결.

#### 7-2. 리프레시 토큰 도입 및 인증 방식 강화

- **고민 내용**: `localStorage`에 JWT를 저장하는 방식의 XSS(Cross-Site Scripting) 공격 취약점 보완.
- **해결 과정**: 수명이 긴 리프레시 토큰은 `HttpOnly` 쿠키에, 수명이 짧은 액세스 토큰은 `localStorage`에 저장하는 이중 토큰 방식으로 보안을 강화.

#### 7-3. AI 모델 구현 방식 결정 (Fine-tuning vs. RAG)

- **고민 내용**: 도메인 특화 답변 생성을 위해 파인 튜닝과 RAG 방식 중 고민.
- **해결 과정**: 데이터셋 구축의 어려움과 최신 정보 반영의 이점을 고려하여 **RAG(검색 증강 생성) 파이프라인**을 직접 설계하는 방향으로 결정.

#### 7-4. 로컬 개발 환경의 CORS 및 HTTPS 문제

- **문제 현상**: `localhost`에서는 정상 작동하던 프로젝트가 다른 기기(IP)로 접속 시 `CORS` 에러 및 마이크 접근 차단 문제 발생.
- **해결 과정**: `mkcert`, `openssl`을 이용해 로컬 환경용 SSL 인증서를 생성하고, 프론트엔드(Vite)와 백엔드(Spring Boot) 서버 모두에 HTTPS를 적용하여 해결.

#### 7-5. 인증 실패 시 토큰 재발급 무한 루프

- **문제 현상**: 비밀번호가 틀려 `401` 에러가 발생하자, 토큰 재발급(`refresh`) 요청이 무한 반복되며 서버에 부하를 주는 버그 발생.
- **해결 과정**: Axios 인터셉터 로직에 로그인, 회원 탈퇴 등 토큰 재발급이 불필요한 경로를 명시하고, 해당 경로에서 401 에러 발생 시 재발급을 시도하지 않도록 예외 처리하여 해결.

#### 7-6. 타 기기에서 발생하는 `ERR_CERT_AUTHORITY_INVALID` 에러

- **문제 현상**: 로컬 서버 접속 시 SSL 인증서 기관이 유효하지 않다는 에러와 함께 API 통신이 차단됨.
- **원인 분석**: `mkcert`로 생성된 루트 인증 기관(CA)은 명령어를 실행한 로컬 머신에만 자동으로 신뢰하도록 등록됨.
- **해결 과정**: `rootCA.pem` 파일을 각 클라이언트 기기(아이폰, 윈도우)로 전송 후, OS 설정에 따라 "신뢰할 수 있는 루트 인증 기관"으로 직접 설치 및 등록하여 해결.

#### 7-7. 배포용 빌드 시 음성 인식 기능 오작동

-   **문제 현상**: 로컬 개발 환경(`npm run dev`)에서는 정상 작동하던 음성 인식 기능이, 프로덕션 빌드 후(`npm run build`) 배포된 서버나 로컬 미리보기(`npm run preview`)에서는 마이크 버튼이 반응하지 않는 현상.
-   **원인 분석**: Vite의 프로덕션 빌드 과정에서 코드 최적화(압축, 트리 쉐이킹)가 일어나면서, `react-speech-recognition` 라이브러리의 내부 코드가 오작동을 일으키는 호환성 문제.
-   **해결 과정**: 외부 라이브러리에 대한 의존성을 제거하고, 브라우저의 네이티브 Web Speech API를 직접 사용하는 커스텀 React Hook(`useSimpleSpeech.ts`)을 구현하여 문제를 해결. 이 방식은 빌드 과정의 최적화에 영향을 받지 않아 안정적으로 작동함을 확인.

---

## 🚀 8. 프로젝트 실행 방법

### 8-1. 사전 요구사항

-   `Java 17` 이상
-   `Node.js 18.0` 이상
-   `MySQL 8.0` 이상
-   `Python 3.11` 이상

### 8-2. 데이터베이스 및 환경 변수 설정

1.  **데이터베이스 생성**: MySQL에 접속하여 아래 쿼리를 실행합니다.

    ```sql
    CREATE DATABASE IF NOT EXISTS restaurant_chatbot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    USE restaurant_chatbot_db;

    CREATE TABLE IF NOT EXISTS users (
        `user_id`    BIGINT       NOT NULL AUTO_INCREMENT,
        `email`      VARCHAR(255) NOT NULL UNIQUE,
        `password`   VARCHAR(255) NOT NULL,
        `nickname`   VARCHAR(50)  NOT NULL UNIQUE,
        `role`       VARCHAR(50)  NOT NULL,
        `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`user_id`)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS chat_session (
        `session_id` BIGINT       NOT NULL AUTO_INCREMENT,
        `user_id`    BIGINT       NOT NULL,
        `title`      VARCHAR(255) NOT NULL,
        `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`session_id`),
        FOREIGN KEY (`user_id`) REFERENCES users(`user_id`) ON DELETE CASCADE
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS chat_log (
        `log_id`     BIGINT    NOT NULL AUTO_INCREMENT,
        `session_id` BIGINT    NOT NULL,
        `sender`     VARCHAR(50) NOT NULL,
        `message`    TEXT      NOT NULL,
        `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`log_id`),
        FOREIGN KEY (`session_id`) REFERENCES chat_session(`session_id`) ON DELETE CASCADE
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS banned_keyword (
        `keyword_id` BIGINT       NOT NULL AUTO_INCREMENT,
        `keyword`    VARCHAR(100) NOT NULL UNIQUE,
        `admin_id`   BIGINT       NOT NULL,
        `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`keyword_id`),
        FOREIGN KEY (`admin_id`) REFERENCES users(`user_id`) ON DELETE CASCADE
    ) ENGINE=InnoDB;
    ```

2.  **환경 변수 설정**: 로컬 개발 시에는 각 프로젝트의 설정 파일에, 프로덕션 배포 시에는 서버 내 파일에 본인의 API 키와 DB 정보를 입력합니다.
    * **Backend**: `backend/src/main/resources/application-local.properties` (로컬용) 또는 `application-production.properties` (배포용)
    * **Python AI**: `python-ai/.env`
    * **Frontend**: `frontend/.env.local`

### 8-3. 로컬 서버 실행 방법 (개발용)

로컬 PC에서 개발 및 테스트 시 사용하는 방법입니다.

1.  **Backend 서버 실행**: `backend` 폴더에서 `./mvnw spring-boot:run`
2.  **Frontend 서버 실행**: `frontend` 폴더에서 `npm install` 후 `npm run dev`
3.  **Python AI 서버 실행**: `python-ai` 폴더에서 가상환경 실행 후 `uvicorn app:app --reload`
4.  **브라우저 접속**: 터미널에 나타나는 `https://localhost:5173` (또는 로컬 IP) 주소로 접속합니다.

### 8-4. 프로덕션 배포 방법 (AWS Ubuntu + Nginx)

AWS EC2(Ubuntu) 환경에 실제 서비스를 배포하는 절차 요약입니다.

1.  **서버 초기 설정**: `git`, `nginx`, `openjdk-17-jdk`, `nodejs`, `npm`, `mysql-server` 등 필수 패키지를 설치합니다.
2.  **DB 설정**: `mysql_secure_installation`으로 보안 설정을 하고, 애플리케이션 전용 DB 사용자를 생성하여 최소한의 권한(`SELECT`, `INSERT`, `UPDATE`, `DELETE`)만 부여합니다.
3.  **프로젝트 빌드**:
    * Backend: `cd backend && ./mvnw clean package -DskipTests` 명령어로 `.jar` 파일을 생성합니다.
    * Frontend: `cd frontend && npm run build` 명령어로 `dist` 폴더를 생성합니다.
4.  **Nginx 설정**: Nginx를 리버스 프록시로 설정합니다.
    * 사용자의 모든 요청은 `443(HTTPS)` 포트로 받습니다.
    * `location /` 요청은 프론트엔드(`dist` 폴더)를 보여줍니다.
    * `location /api/` 요청은 내부적으로 스프링 부트 서버(`http://localhost:8443`)로 전달합니다.
5.  **백엔드 서비스 실행 (`systemd`)**:
    * `springboot.service`, `fastapi.service` 파일을 생성하여 백엔드 애플리케이션들이 터미널 종료와 관계없이 계속 실행되도록 등록합니다.
    * `sudo systemctl enable`, `sudo systemctl start` 명령어로 서비스를 활성화합니다.
6.  **HTTPS 인증서 발급**:
    * 개인 도메인을 구매하여 EC2의 IP 주소에 연결합니다. (DNS A 레코드 설정)
    * `sudo certbot --nginx -d your-domain.com` 명령어로 Let's Encrypt 인증서를 발급받고 Nginx에 자동으로 적용합니다.
7.  **최종 접속**: `https://your-domain.com`으로 접속하여 서비스를 확인합니다.
