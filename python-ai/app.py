from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import requests
from contextlib import asynccontextmanager
import urllib3
from rag_pipeline import process_recommendation_request

# SSL 경고 비활성화
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# .env 로드 및 API 설정
SPRING_BOOT_API_URL = "https://localhost:8443"
filtered_keywords = set()

# --- Pydantic 모델 정의 ---
class Message(BaseModel):
    sender: str
    text: str

class RecommendRequest(BaseModel):
    messages: List[Message]
    current_location: Optional[str] = None

class RecommendResponse(BaseModel):
    reply: str

# --- 서버 시작 시 필터링 키워드 로드 ---
def load_filtered_keywords():
    global filtered_keywords
    try:
        response = requests.get(f"{SPRING_BOOT_API_URL}/api/public/filtered-keywords", verify=False)
        if response.status_code == 200:
            keywords_list = response.json()
            filtered_keywords = set(keywords_list)
            print(f"✅ 필터링 키워드 로드 완료: {len(filtered_keywords)}개")
    except Exception as e:
        print(f"❌ 필터링 키워드 로드 실패: {e}")

# --- FastAPI Lifespan 이벤트 핸들러 ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    load_filtered_keywords()
    yield
    print("서버가 종료됩니다.")

app = FastAPI(lifespan=lifespan)

# --- API 엔드포인트 ---
@app.post("/api/refresh-keywords")
async def refresh_keywords():
    load_filtered_keywords()
    return {"message": "Keywords refreshed successfully."}

@app.post("/api/recommend", response_model=RecommendResponse)
async def recommend_restaurant(request: RecommendRequest):
    try:
        reply_text = await process_recommendation_request(
            conversation_history=request.messages,
            filtered_keywords=filtered_keywords,
            current_location=request.current_location
        )
        return RecommendResponse(reply=reply_text)
    except Exception as e:
        print(f"오류 발생: {e}")
        raise HTTPException(status_code=500, detail="챗봇 응답 생성 중 내부 서버 오류가 발생했습니다.")