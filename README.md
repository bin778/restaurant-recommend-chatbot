# 🤖 LLM 맛집 추천 챗봇 (Restaurant-Recommend-Chatbot)

> 자연어 처리(LLM)를 기반으로 사용자의 의도를 파악하여 맛집을 추천하고, 대화형으로 상세 정보를 제공하는 웹 서비스

<br/>

## 📖 프로젝트 소개

* LLM을 활용하여 사용자의 복잡하고 감성적인 요구사항("비 오는 날 어울리는 국물 요리 맛집 알려줘")까지 이해하고, 네이버 지도 데이터를 기반으로 최적의 맛집을 추천하는 대화형 챗봇 서비스(구현 예정)

<br/>

## 🗓️ 개발 정보

* **개발 기간:** 2025.06.12 ~ 2025.07.08
* **개발 인원:** 최영빈 (1인 개발)

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
-   **회원 관리:** 회원가입, 로그인/로그아웃, 비밀번호 보안 규칙 적용
-   **내 정보 관리:** 본인 정보 조회, 닉네임/비밀번호 수정, 계정 탈퇴
-   **대화형 챗봇:**
    -   자연어 기반 맛집 추천 요청
    -   핵심 키워드(지역, 음식 종류, 분위기 등) 자동 추출
    -   대화 로그 저장 및 조회

### 관리자
-   **사용자 관리:** 전체 회원 목록 조회 및 특정 계정 삭제
-   **콘텐츠 관리:** 부적절한 검색어(금지어) 등록 및 관리

<br/>

## 🚀 프로젝트 실행 방법

### 1. 사전 요구사항
- `Java 17` 이상
- `Node.js 18` 이상
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

### 3. 프론트엔드 서버 실행
```bash
# 1. 프론트엔드 프로젝트 루트로 이동
cd frontend

# 2. 필요한 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev
```
