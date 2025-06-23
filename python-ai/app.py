import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
# import google.generativeai as genai # 추후 Gemini 연동 시 사용

# .env 파일에서 환경변수 로드
load_dotenv()

# FastAPI 애플리케이션 생성
app = FastAPI()

# --- 환경변수 로드 (Gemini API Key) ---
# GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
# if not GOOGLE_API_KEY:
#     raise ValueError("GOOGLE_API_KEY 환경변수가 설정되지 않았습니다.")
# genai.configure(api_key=GOOGLE_API_KEY)


# --- Pydantic 모델 정의 (요청/응답 데이터 형식 검증) ---

# Spring Boot로부터 받을 요청 본문(body)의 형식을 정의
class RecommendRequest(BaseModel):
    message: str

# Spring Boot로 보낼 응답 본문(body)의 형식을 정의
class RecommendResponse(BaseModel):
    reply: str


# --- API 엔드포인트 생성 ---

@app.post("/api/recommend", response_model=RecommendResponse)
async def recommend_restaurant(request: RecommendRequest):
    """
    Spring Boot로부터 사용자 메시지를 받아,
    LLM을 통해 맛집 추천 응답을 생성하고 반환합니다.
    """
    user_message = request.message
    print(f"백엔드로부터 받은 메시지: {user_message}")

    try:
        # TODO: 2단계 - 1차 프롬프트 (키워드 추출)
        # TODO: 3단계 - 네이버 지도 API 검색
        # TODO: 4단계 - 2차 프롬프트 (답변 생성)
        # TODO: 5단계 - 최종 응답 반환

        # 현재 단계에서는 테스트를 위해 간단한 에코(echo) 응답을 반환합니다.
        bot_reply = f"Python 서버: '{user_message}' 메시지를 잘 받았습니다! 이제 LLM 로직을 구현할 차례입니다."
        
        return RecommendResponse(reply=bot_reply)

    except Exception as e:
        print(f"오류 발생: {e}")
        # 실제 오류 상황에서는 더 구체적인 에러 처리가 필요합니다.
        raise HTTPException(status_code=500, detail="챗봇 응답 생성 중 오류가 발생했습니다.")

# --- FastAPI 서버 실행 (로컬 테스트용) ---
# 터미널에서 아래 명령어로 서버를 실행합니다.
# uvicorn app:app --host 0.0.0.0 --port 8000 --reload
