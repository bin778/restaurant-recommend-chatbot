# 🤖 LLM 맛집 추천 챗봇 (Restaurant-Recommend-Chatbot)

> 자연어 처리(LLM)와 RAG(검색 증강 생성) 기술을 기반으로, 사용자의 의도를 파악하여 실시간 맛집 정보를 추천하는 대화형 웹 서비스입니다.

<br/>

### ✨ 목차 (Table of Contents)

1.  [프로젝트 개요](#-1-프로젝트-개요)
2.  [주요 기능 및 화면](#-2-주요-기능-및-화면)
3.  [시스템 아키텍처](#-3-시스템-아키텍처)
4.  [요구사항 정의서](#-4-요구사항-정의서)
5.  [API 명세](#-5-api-명세)
6.  [기술 스택](#-6-기술-스택)
7.  [고민 및 해결 과정 (Troubleshooting)](#-7-고민-및-해결-과정)
8.  [프로젝트 실행 방법](#-8-프로젝트-실행-방법)

<br/>

---

## 📖 1. 프로젝트 개요

### 1-1. 프로젝트 소개

맛집을 찾을 때 더 이상 단순 키워드 검색에 의존하지 않고, 사람과 대화하듯 편안하게 원하는 맛집을 찾을 수 있는 경험을 제공하고자 했습니다. 이 프로젝트는 **LLM(Gemini 1.5 Flash)**을 활용하여 사용자의 복잡하고 감성적인 요구사항("비 오는 날 어울리는 국물 요리 맛집 알려줘")까지 이해하고, **RAG(검색 증강 생성)** 기술을 통해 네이버 지도 API의 실시간 정보를 바탕으로 최적의 맛집을 추천하는 대화형 챗봇 서비스입니다.

### 1-2. 개발 목표

- **기술적 목표:** 3-Tier 아키텍처(React-Spring-Python)를 구축하고, LLM과 외부 API를 연동하는 RAG 파이프라인을 직접 설계하고 구현합니다. 또한, JWT와 리프레시 토큰을 이용한 안전한 인증 시스템을 설계하고, 반응형 웹 디자인을 적용하여 다양한 기기에서 최적의 사용자 경험을 제공합니다.
- **사용자 목표:** 사용자가 복잡한 검색 없이 자연스러운 대화만으로 원하는 조건의 맛집 정보를 쉽고 빠르게 얻을 수 있도록 합니다.

<br/>

---

## 📋 2. 주요 기능 및 화면

### 일반 사용자

- **회원 관리:** JWT 기반의 안전한 회원가입, 로그인/로그아웃 (비밀번호 정책 및 시도 횟수 제한 적용).
- **내 정보 관리:** 본인 정보 조회, 닉네임/비밀번호 수정, 계정 탈퇴 기능.
- **대화형 챗봇:**
  - 자연어 기반 맛집 추천 요청.
  - RAG 기반의 정확한 정보 제공 (LLM 키워드 추출 → Naver API 검색 → LLM 답변 생성).
  - 대화 로그 저장 및 조회 (구현 예정).

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
| C-05        | 대화 로그   | 이전 대화 내용을 DB에 저장하고 불러오기.                |  **중**  | 구현 예정             |
| **Admin**   |
| A-01        | 사용자 관리 | 관리자가 전체 회원 목록 조회 및 삭제.                   |  **중**  | 구현 예정             |
| A-02        | 사용자 관리 | 관리자가 부적절한 검색어 등록 및 관리.                  |  **하**  | 구현 예정             |

<br/>

---

## 📡 5. API 명세

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

- **Spring Security & JWT `403 Forbidden` 에러:** 맞는 비밀번호로 로그인할 때만 `403` 에러가 발생하는 기이한 현상. `SecurityConfig`와 `UserService` 간의 **Bean 순환 참조(Circular Dependency)**가 근본 원인임을 파악하고, `DaoAuthenticationProvider` Bean의 파라미터로 `UserService`를 주입받도록 구조를 변경하여 해결.
- **리프레시 토큰(Refresh Token) 도입:** `localStorage` 저장 방식의 XSS 취약점을 보완하기 위해, 수명이 긴 리프레시 토큰은 `HttpOnly` 쿠키에, 수명이 짧은 액세스 토큰은 메모리에서 관리하는 방식으로 보안을 강화.
- **AI 모델 구현 방식 결정:** "나만의 모델 구현"이라는 요구사항에 대해, 파인 튜닝 방식의 현실적인 어려움(데이터셋 구축)을 인지하고, **RAG(검색 증강 생성) 파이프라인**을 직접 설계하는 방향으로 결정. 이는 LLM의 환각을 줄이고 최신 정보를 반영하는 현대적인 접근 방식임.

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

프로젝트 루트에 있는 각 `.env` 파일에 필요한 API 키와 DB 접속 정보를 입력

- `backend/src/main/resources/application-local.properties`
- `python-ai/.env`

### 8-3. 서버 실행

```bash
# 1. 백엔드 서버 실행
cd backend
./mvnw spring-boot:run

# 2. (다른 터미널에서) 프론트엔드 서버 실행
cd frontend
npm install
npm run dev

# 3. (다른 터미널에서) Python AI 서버 실행
#    먼저 가상환경을 생성하고 활성화
cd python-ai
python3 -m venv venv
source venv/bin/activate

#    의존성 설치
pip install -r requirements.txt

#    FastAPI 서버를 실행
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# 4. 웹 브라우저에서 프론트엔드 주소(http://localhost:5173)로 접속할 것!!
```
