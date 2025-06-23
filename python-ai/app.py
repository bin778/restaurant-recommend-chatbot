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

# --- Gemini 2.5 Flash 설정 ---
model = genai.GenerativeModel('gemini-2.5-flash')

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
    url = f"https://openapi.naver.com/v1/search/local.json?query={encText}&display=5" # 최대 5개 결과
    
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
        당신은 사용자의 문장에서 맛집 추천에 필요한 핵심 키워드를 추출하는 전문가입니다.
        다음 사용자 메시지에서 '지역', '음식 종류', '분위기'에 해당하는 키워드를 찾아서 JSON 형식으로 반환해주세요.
        만약 해당하는 키워드가 없으면 값은 ""(빈 문자열)로 설정해주세요.

        사용자 메시지: "{user_message}"

        JSON 형식:
        {{
          "location": "추출된 지역명",
          "food": "추출된 음식 종류",
          "mood": "추출된 분위기 키워드"
        }}
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
                f"- 상호명: {item.get('title', '').replace('<b>', '').replace('</b>', '')}\n  - 주소: {item.get('address', '')}\n  - 카테고리: {item.get('category', '')}"
                for item in search_results["items"]
            ])

            generation_prompt = f"""
            당신은 사용자의 질문과 제공된 검색 결과를 바탕으로 맛집을 추천해주는 친절한 챗봇입니다.
            반드시 아래 '검색된 맛집 정보' 내에서만 답변을 생성해야 하며, 없는 내용을 지어내서는 안 됩니다.
            사용자의 질문에 맞춰 자연스러운 추천 문장을 만들어주세요.

            [사용자 질문]
            "{user_message}"

            [검색된 맛집 정보]
            {context_info}

            [추천 답변]
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