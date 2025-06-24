# python-ai/app.py

import os
import json
import urllib.request
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, NotFound

# .env 파일에서 환경변수 로드
load_dotenv()

# FastAPI 애플리케이션 생성
app = FastAPI()

# --- Gemini API 설정 ---
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY 환경변수가 설정되지 않았습니다.")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash-latest')

# --- Naver API 설정 ---
NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET")
if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
    raise ValueError("네이버 API 키가 설정되지 않았습니다.")


# --- Pydantic 모델 정의 ---
class RecommendRequest(BaseModel):
    message: str

class RecommendResponse(BaseModel):
    reply: str


# --- 헬퍼 함수: 네이버 지역 검색 API 호출 ---
def search_naver_local(query: str) -> dict:
    """네이버 지역 검색 API를 호출하고 결과를 JSON으로 반환합니다."""
    encText = urllib.parse.quote(query)
    url = f"https://openapi.naver.com/v1/search/local.json?query={encText}&display=5"
    
    request = urllib.request.Request(url)
    request.add_header("X-Naver-Client-Id", NAVER_CLIENT_ID)
    request.add_header("X-Naver-Client-Secret", NAVER_CLIENT_SECRET)
    
    try:
        response = urllib.request.urlopen(request)
        rescode = response.getcode()
        if rescode == 200:
            response_body = response.read()
            return json.loads(response_body.decode('utf-8'))
        else:
            print(f"네이버 API 에러 코드: {rescode}")
            return None
    except Exception as e:
        print(f"네이버 API 호출 중 오류 발생: {e}")
        return None

# --- API 엔드포인트 ---
@app.post("/api/recommend", response_model=RecommendResponse)
async def recommend_restaurant(request: RecommendRequest):
    user_message = request.message
    print(f"백엔드로부터 받은 메시지: {user_message}")

    try:
        # --- 1단계: 키워드 추출 ---
        keyword_extraction_prompt = f"""
        사용자 메시지에서 맛집 추천에 필요한 '지역', '음식 종류', '분위기' 키워드를 JSON으로 추출해줘.
        사용자 메시지: "{user_message}"
        JSON 형식: {{"location": "지역명", "food": "음식 종류", "mood": "분위기"}}
        """
        response = model.generate_content(keyword_extraction_prompt)
        response_text = response.text.strip().replace('```json', '').replace('```', '')
        keywords = json.loads(response_text)
        print(f"추출된 키워드: {keywords}")

        # --- 2단계: 외부 데이터 검색 (RAG - Retrieval) ---
        search_query = f"{keywords.get('location', '')} {keywords.get('food', '')} 맛집"
        print(f"네이버 검색 쿼리: {search_query}")
        
        search_results = search_naver_local(search_query)

        # --- 3단계: 최종 답변 생성 (RAG - Generation) ---
        if not search_results or not search_results.get("items"):
            bot_reply = "죄송합니다, 관련 맛집 정보를 찾을 수 없었어요. 다른 키워드로 다시 질문해주시겠어요?"
        else:
            context_info = "\n".join([
                (f"- 상호명: {item.get('title', '').replace('<b>', '').replace('</b>', '')}, "
                 f"주소: {item.get('address', '')}, "
                 f"카테고리: {item.get('category', '')}")
                for item in search_results["items"]
            ])

            # --- 답변 가독성 개선을 위한 프롬프트 고도화 ---
            generation_prompt = f"""
            너는 사용자의 질문과 제공된 검색 결과를 바탕으로 맛집을 추천해주는 친절한 챗봇이야.

            **[지시사항]**
            1. 사용자의 질문 의도를 파악해서 첫 문장을 시작해줘. (예: "광명사거리역 근처 떡볶이 맛집을 찾으시는군요!")
            2. '검색된 맛집 정보'를 바탕으로, 추천할 만한 가게들을 1~2개 정도 구체적으로 설명해줘.
            3. 각 가게를 소개할 때는, **줄 바꿈(\\n)을 사용해서 문단을 명확하게 나누어줘.** 가독성이 매우 중요해.
            4. 가게 이름은 그냥 텍스트로 말해줘. **절대 `**` 같은 마크다운 문법을 사용하지 마.**
            5. 각 가게의 특징(카테고리)과 위치(주소)를 명확히 언급해줘.
            6. 절대 '검색된 맛집 정보'에 없는 내용은 지어내서 말하면 안돼.
            7. 마지막에는 "이 정보가 맛집을 고르시는 데 도움이 되기를 바랍니다!" 와 같이 친근한 마무리 인사를 덧붙여줘.

            **[사용자 질문]**
            "{user_message}"

            **[검색된 맛집 정보]**
            {context_info}

            **[추천 답변]**
            """
            
            final_response = model.generate_content(generation_prompt)
            bot_reply = final_response.text

        print(f"최종 생성된 답변: {bot_reply}")
        return RecommendResponse(reply=bot_reply)

    except (ResourceExhausted, NotFound) as e:
        print(f"Gemini API 오류: {e}")
        raise HTTPException(status_code=503, detail="AI 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
    except Exception as e:
        print(f"오류 발생: {e}")
        raise HTTPException(status_code=500, detail="챗봇 응답 생성 중 내부 서버 오류가 발생했습니다.")
