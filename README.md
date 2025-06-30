# 🤖 LLM 맛집 추천 챗봇 (Restaurant-Recommend-Chatbot)

> 자연어 처리(LLM)와 RAG(검색 증강 생성) 기술을 기반으로, 사용자의 의도를 파악하여 실시간 맛집 정보를 추천하는 대화형 웹 서비스입니다.

<br/>

### ✨ 목차 (Table of Contents)

- [1. 프로젝트 개요](#-1-프로젝트-개요)
- [2. 주요 기능 및 화면](#-2-주요-기능-및-화면)
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

맛집을 찾을 때 더 이상 단순 키워드 검색에 의존하지 않고, 사람과 대화하듯 편안하게 원하는 맛집을 찾을 수 있는 경험을 제공하고자 했습니다. 이 프로젝트는 **LLM(Gemini 2.5 Flash)** 을 활용하여 사용자의 복잡하고 감성적인 요구사항("비 오는 날 어울리는 국물 요리 맛집 알려줘")까지 이해하고, **RAG(검색 증강 생성)** 기술을 통해 네이버 지도 API의 실시간 정보를 바탕으로 최적의 맛집을 추천하는 대화형 챗봇 서비스입니다.

### 1-2. 개발 목표

-   **기술적 목표:** 3-Tier 아키텍처(React-Spring-Python)를 구축하고, LLM과 외부 API를 연동하는 RAG 파이프라인을 직접 설계하고 구현합니다. 또한, JWT와 리프레시 토큰을 이용한 안전한 인증 시스템을 설계하고, 반응형 웹 디자인을 적용하여 다양한 기기에서 최적의 사용자 경험을 제공합니다.
-   **사용자 목표:** 사용자가 복잡한 검색 없이 자연스러운 대화만으로 원하는 조건의 맛집 정보를 쉽고 빠르게 얻을 수 있도록 합니다.

<br/>

---

## 📋 2. 주요 기능 및 화면

### 일반 사용자

-   **회원 관리:** JWT 기반의 안전한 회원가입, 로그인/로그아웃 (비밀번호 정책 및 시도 횟수 제한 적용).
-   **내 정보 관리:** 본인 정보 조회, 닉네임/비밀번호 수정, 계정 탈퇴 기능.
-   **대화형 챗봇:**
    -   자연어 기반 맛집 추천 요청.
    -   RAG 기반의 정확한 정보 제공 (LLM 키워드 추출 → Naver API 검색 → LLM 답변 생성).
    -   음성 인식(STT)을 통한 메시지 입력 기능 (Chrome 브라우저 최적화).
    -   대화 로그 조회, 삭제 및 신규 대화 시작.

### 관리자

-   **관리자 식별:** 로그인 시 `ROLE_ADMIN` 권한을 식별하여 관리자 전용 UI 노출.
-   **회원 관리:** 전체 회원 목록 조회 및 관리 기능 (구현 예정).
-   **콘텐츠 관리:** 부적절 키워드 필터링 등 콘텐츠 관리 기능 (구현 예정).

#### ✨ 화면 구성 (Screenshots)

<!-- TODO: 여기에 로그인, 메인, 마이페이지, 챗봇 등 주요 화면 스크린샷이나 GIF를 추가. -->

<br/>

---

## 🏗️ 3. 시스템 아키텍처

**[프론트엔드 아키텍처]**

![image](https://github.com/user-attachments/assets/86394f3b-36b5-4734-9a49-d39e1b7894fc)

**[백엔드 아키텍처]**

![image](https://github.com/user-attachments/assets/63679876-2e77-4999-8374-1b410dff5e49)

**[Python LLM 서버 아키텍처]**

![image](https://github.com/user-attachments/assets/9a0adc0b-4db4-44ae-a319-7148e74302b1)

**[전체 시스템 흐름도 아키텍처]**

![image](https://github.com/user-attachments/assets/b955f14a-9e1d-43e3-a733-cc2bebdfbebb)

<br/>

---

## 📝 4. 요구사항 정의서

| ID          | 기능 분류   | 기능 설명                                               | 우선순위 | 비고                  |
| :---------- | :---------- | :------------------------------------------------------ | :------: | :-------------------- |
| **User**    |
| U-01        | 회원가입    | 이메일, 비밀번호, 닉네임으로 회원가입.                  |  **상**  | 비밀번호 정책 적용    |
| U-02        | 로그인      | 이메일과 비밀번호로 로그인하여 JWT 발급.                |  **상**  | 로그인 실패 횟수 제한 |
| U-03        | 정보 수정   | 닉네임, 비밀번호 변경 가능.                             |  **중**  |                       |
| U-04        | 계정 탈퇴   | 비밀번호 확인 후 계정 삭제.                             |  **중**  |                       |
| **Chatbot** |
| C-01        | 메시지 전송 | 사용자가 입력한 메시지를 서버로 전송.                   |  **상**  |                       |
| C-02        | 키워드 추출 | LLM을 사용하여 사용자 메시지에서 핵심 키워드 추출.      |  **상**  | 지역, 음식, 분위기    |
| C-03        | 정보 검색   | 추출된 키워드로 네이버 지도 API에서 맛집 정보 검색.     |  **상**  | RAG - Retrieval       |
| C-04        | 답변 생성   | 검색된 정보를 바탕으로 LLM이 자연스러운 추천 문장 생성. |  **상**  | RAG - Generation      |
| C-05        | 대화 로그   | 이전 대화 내용을 DB에 저장하고 불러오기.                |  **중**  |                       |
| C-06        | 음성 인식   | 사용자가 음성으로 대답할 때도 인식하기.                 |  **중**  | 현재 Chrome만 지원        |
| **Admin**   |
| A-01        | 사용자 관리 | 관리자가 전체 회원 목록 조회 및 삭제.                   |  **중**  | 구현 예정             |
| A-02        | 사용자 관리 | 관리자가 부적절한 검색어 등록 및 관리.                  |  **하**  | 구현 예정             |

<br/>

---

## 📡 5. API 명세

| Method | URL                   | 설명               | 인증     |
| :----- | :-------------------- | :----------------- | :------: |
| `POST` | `/api/auth/signup`    | 회원가입           |   ✕      |
| `POST` | `/api/auth/login`     | 로그인 (JWT 발급)  |   ✕      |
| `POST` | `/api/auth/logout`    | 로그아웃 (쿠키 삭제) |   ✕      |
| `POST` | `/api/auth/refresh`   | 액세스 토큰 재발급 | ○ (쿠키) |
| `GET`  | `/api/users/me`       | 내 정보 조회       |   ○      |
| `PUT`  | `/api/users/me`       | 내 정보 수정       |   ○      |
| `POST` | `/api/users/delete`   | 회원 탈퇴          |   ○      |
| `POST` | `/api/chat`           | 챗봇 메시지 전송   |   ○      |
| `GET`  | `/api/chat/sessions`  | 채팅 세션 목록 조회|   ○      |
| `GET`  | `/api/chat/{id}/messages` | 특정 세션 대화 조회|   ○      |
| `DELETE`| `/api/chat/sessions/{id}` | 채팅 세션 삭제     |   ○      |

<br/>

---

## 🛠️ 6. 기술 스택

### 🖥️ Frontend

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### ⚙️ Backend

![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=spring&logoColor=white) ![JPA](https://img.shields.io/badge/JPA-6DB33F?style=for-the-badge&logo=hibernate&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### 🧠 AI / Data

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B7?style=for-the-badge&logo=google-gemini&logoColor=white)
![Naver Cloud](https://img.shields.io/badge/Naver_Cloud_Platform-03C75A?style=for-the-badge&logo=naver&logoColor=white)

### 💾 Database

![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

### ☁️ Deployment & Tools

![Amazon EC2](https://img.shields.io/badge/Amazon_EC2-FF9900?style=for-the-badge&logo=amazon-ec2&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

<br/>

---

## 💡 7. 고민 및 해결 과정 (Troubleshooting)

이 프로젝트를 진행하며 마주했던 주요 기술적 고민과 해결 과정을 기록

#### 1. Spring Security 순환 참조로 인한 `403 Forbidden` 에러

-   **문제 현상**: 유효한 계정으로 로그인할 때만 원인 불명의 `403 Forbidden` 에러가 발생하고, 존재하지 않는 계정으로는 정상적인 `401` 에러가 발생하는 기이한 현상.
-   **원인 분석**: `SecurityConfig`가 `UserService`를 주입받고, 동시에 `UserService`가 `PasswordEncoder` (실제로는 `SecurityConfig`에 정의된 Bean)를 주입받으면서 Bean 순환 참조(Circular Dependency)가 발생. 이로 인해 Spring Security 필터 체인이 완전히 구성되지 못한 상태에서 인증을 시도하여 문제가 발생했음.
-   **해결 과정**: `SecurityConfig`에서 `AuthenticationManager`를 구성할 때, `UserService`를 직접 주입받는 대신 `DaoAuthenticationProvider`를 사용하여 `PasswordEncoder`와 `UserDetailsService` 구현체를 명시적으로 설정. 이를 통해 Bean 생성 순서의 의존성을 분리하여 순환 참조 문제를 해결.

#### 2. 리프레시 토큰 도입 및 인증 방식 강화

-   **고민 내용**: `localStorage`에 JWT(액세스 토큰)를 저장하는 방식은 XSS(Cross-Site Scripting) 공격에 취약할 수 있다는 보안적 우려.
-   **원인 분석**: 자바스크립트로 `localStorage`에 쉽게 접근할 수 있다는 점이 탈취의 위험을 높임.
-   **해결 과정**: 보안 강화를 위해 리프레시 토큰(Refresh Token)을 도입.
    -   **리프레시 토큰**: 수명이 길고, 보안에 민감하므로 `HttpOnly` 속성을 적용한 쿠키에 저장하여 자바스크립트 접근을 원천 차단.
    -   **액세스 토큰**: 수명이 짧고, API 요청 시마다 헤더에 실려야 하므로 `localStorage` 또는 메모리에 저장하여 사용.
    -   이 구조를 통해 액세스 토큰이 탈취되더라도 짧은 시간 안에 만료되며, 리프레시 토큰은 안전하게 보호되는 이중 보안 체계를 구축.

#### 3. AI 모델 구현 방식 결정 (Fine-tuning vs. RAG)

-   **고민 내용**: "맛집 추천"이라는 특정 도메인에 맞는 답변을 생성하기 위해 파인 튜닝(Fine-tuning) 방식과 RAG(검색 증강 생성) 방식 중 어떤 것이 더 적합할지 고민.
-   **원인 분석**:
    -   **파인 튜닝**: 높은 품질의 답변을 기대할 수 있으나, 양질의 데이터셋을 대량으로 구축하는 데 많은 시간과 비용이 소요되며, 새로운 정보(새로운 맛집 등)를 반영하기 어려움.
    -   **RAG**: 외부 데이터베이스(Vector DB)에서 실시간으로 관련 정보를 검색하여 LLM에 전달하므로, 최신 정보를 반영하기 용이하고 환각(Hallucination) 현상을 크게 줄일 수 있음.
-   **해결 과정**: 유지보수성과 확장성을 고려하여 **RAG 파이프라인**을 직접 설계하는 방향으로 결정. 사용자의 질문과 관련된 맛집 정보를 DB에서 검색한 후, 이를 컨텍스트로 삼아 LLM에게 답변 생성을 요청하는 방식으로 구현.

#### 4. 로컬 개발 환경의 CORS 및 HTTPS 문제

-   **문제 현상**: `localhost`에서는 정상 작동하던 프로젝트가 다른 IP로 접속 시 `CORS` 에러 및 마이크 접근 차단 문제 발생.
-   **원인 분석**:
    1.  **CORS**: 백엔드의 허용 출처(`allowedOrigins`) 목록에 `localhost`만 등록되어 있고, 내부 IP는 등록되지 않음.
    2.  **마이크 차단**: 최신 브라우저는 보안 정책상 `http://` 환경에서 마이크 등 민감한 기능 사용을 차단함.
-   **해결 과정**: `mkcert`, `openssl`을 이용해 로컬 환경용 SSL 인증서를 생성하고, 프론트엔드(Vite)와 백엔드(Spring Boot) 서버 모두에 HTTPS를 적용하여 해결. 이 과정에서 각 서버 설정 파일(`vite.config.ts`, `application.properties`)에 인증서 경로와 관련 옵션을 정확히 지정하는 것이 중요했음.

#### 5. 로그인 실패 시 토큰 재발급 무한 루프

-   **문제 현상**: 비밀번호가 틀려 `401` 에러가 발생하자, 토큰 재발급(`refresh`) 요청이 무한 반복되며 서버에 부하를 주는 치명적인 버그 발생.
-   **원인 분석**: Axios 인터셉터가 로그인 실패로 인한 `401`과 토큰 만료로 인한 `401`을 구분하지 못하고, 모든 `401` 에러에 대해 재발급을 시도함.
-   **해결 과정**: 응답 인터셉터(`api.ts`) 로직에 로그인, 회원가입, 회원 탈퇴 등 토큰 재발급이 불필요한 경로(`publicUrls`)를 명시. 해당 경로에서 401 에러 발생 시 재발급 로직을 실행하지 않도록 예외 처리하여 무한 루프의 고리를 끊음.

#### 6. 타 기기에서 발생하는 `ERR_CERT_AUTHORITY_INVALID` 에러

-   **문제 현상**: 맥북에서는 정상 접속되나, 타 기기(아이폰, 윈도우 PC)에서 로컬 서버 접속 시 SSL 인증서 기관이 유효하지 않다는 에러와 함께 API 통신이 차단됨.
-   **원인 분석**: `mkcert -install`로 생성된 루트 인증 기관(CA)은 명령어를 실행한 로컬 머신(맥북)에만 자동으로 신뢰하도록 등록됨. 다른 기기들은 이 사설 인증 기관을 알지 못하므로, 해당 기관이 발급한 SSL 인증서를 신뢰할 수 없는 것으로 판단하여 연결을 거부함.
-   **해결 과정**: `mkcert -CAROOT` 명령으로 `rootCA.pem` 파일의 위치를 찾아, 해당 파일을 각 클라이언트 기기(아이폰, 윈도우)로 전송. 이후 각 OS의 설정에 따라 "신뢰할 수 있는 루트 인증 기관"으로 직접 설치 및 등록하여 해결.

<br/>

---

## 🚀 8. 프로젝트 실행 방법

### 8-1. 사전 요구사항

- `Java 17.0` 이상
- `Spring Boot 3.5` 이상
- `Node.js 18.0` 이상
- `MySQL 8.0` 이상
- `Python 3.11` 이상

### 8-2. 환경 변수 설정

프로젝트 루트에 있는 각 `.env` 파일에 필요한 API 키와 DB 정보를 입력

- `backend/src/main/resources/application-local.properties`
- `python-ai/.env`
- `restaurant_chatbot_db` 쿼리문 생성 요령

```
-- =================================================================
-- 1. 데이터베이스 생성 및 선택
-- =================================================================
-- 만약 'restaurant_chatbot_db' 데이터베이스가 존재하지 않으면 생성합니다.
-- 문자 인코딩은 한글 및 이모지 지원을 위해 'utf8mb4'로 설정합니다.
CREATE DATABASE IF NOT EXISTS restaurant_chatbot_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 생성한 데이터베이스를 사용합니다.
USE restaurant_chatbot_db;


-- =================================================================
-- 2. 'user' 테이블 생성 (사용자 정보)
-- =================================================================
CREATE TABLE IF NOT EXISTS user (
    `id`         BIGINT       NOT NULL AUTO_INCREMENT, -- 사용자 고유 ID
    `email`      VARCHAR(255) NOT NULL UNIQUE,       -- 이메일 (로그인 ID로 사용, 중복 불가)
    `password`   VARCHAR(255) NOT NULL,              -- 해싱된 비밀번호
    `nickname`   VARCHAR(255) NOT NULL UNIQUE,       -- 닉네임 (중복 불가)
    `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 가입일
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =================================================================
-- 3. 'chat_session' 테이블 생성 (채팅 대화방 정보)
-- =================================================================
CREATE TABLE IF NOT EXISTS chat_session (
    `id`         BIGINT       NOT NULL AUTO_INCREMENT, -- 채팅 세션 고유 ID
    `user_id`    BIGINT       NOT NULL,                 -- 이 세션을 소유한 사용자의 ID
    `title`      VARCHAR(255) NOT NULL,              -- 채팅방 제목 (예: "가산디지털단지 맛집")
    `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일
    PRIMARY KEY (`id`),
    -- 'user' 테이블의 id를 참조하는 외래키. 사용자가 삭제되면 관련 채팅 세션도 함께 삭제됩니다.
    FOREIGN KEY (`user_id`) REFERENCES user(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =================================================================
-- 4. 'chat_log' 테이블 생성 (개별 메시지 기록)
-- =================================================================
CREATE TABLE IF NOT EXISTS chat_log (
    `id`         BIGINT   NOT NULL AUTO_INCREMENT, -- 메시지 고유 ID
    `session_id` BIGINT   NOT NULL,                 -- 이 메시지가 속한 채팅 세션의 ID
    `sender`     VARCHAR(50) NOT NULL,              -- 발신자 ('user' 또는 'bot')
    `message`    TEXT     NOT NULL,                 -- 메시지 내용
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 메시지 생성 시간
    PRIMARY KEY (`id`),
    -- 'chat_session' 테이블의 id를 참조하는 외래키. 채팅 세션이 삭제되면 관련 메시지도 모두 삭제됩니다.
    FOREIGN KEY (`session_id`) REFERENCES chat_session(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 8-3. 서버 실행 방법

```bash
# 최초 1회 설정 (SSL 인증서 생성)
# 프로젝트를 처음 설정하거나 인증서가 없는 경우에만 이 단계를 진행

# 1. 프론트엔드 인증서 생성
# frontend 폴더로 이동
cd frontend

# 로컬 환경용 SSL 인증서 생성 (mkcert 필요)
# brew install mkcert && mkcert -install
mkcert localhost 127.0.0.1 ::1 <컴퓨터-내부-IP>

2. 백엔드 인증서 생성
# backend 폴더로 이동
cd backend

# 백엔드용 SSL 인증서 생성
mkcert localhost <컴퓨터-내부-IP>

# .pem 파일을 .p12 파일로 변환
openssl pkcs12 -export \
-in src/main/resources/localhost+1.pem \
-inkey src/main/resources/localhost+1-key.pem \
-out src/main/resources/localhost+1.p12 \
-name "<인증서-별명>" \
-passout pass:changeit

# (참고: 파일명과 별명은 생성된 실제 값에 맞게 조정하세요.)

# 1. 백엔드 서버 실행
cd backend
# Spring Boot 서버 실행 (포트: 8443)
./mvnw spring-boot:run

# 2. (다른 터미널에서) 프론트엔드 서버 실행
# frontend 폴더로 이동
cd frontend

# 의존성 설치 (최초 1회)
npm install

# Vite 개발 서버 실행 (포트: 5173)
npm run dev

# 3. (다른 터미널에서) Python AI 서버 실행
# python-ai 폴더로 이동
cd python-ai

# 가상환경 생성 및 활성화 (최초 1회)
python3 -m venv venv
source venv/bin/activate

# 의존성 설치 (최초 1회 또는 변경 시)
pip install -r requirements.txt

# FastAPI 서버 실행 (포트: 8000)
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# 4. https://<컴퓨터-내부-IP>:5173 주소로 접속
# 주의: http://localhost:5173 로 접속하면 마이크 권한 문제 및 CORS 에러 발생!
```
