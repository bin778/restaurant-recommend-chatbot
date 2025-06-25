import os
import json
import urllib.request
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from dotenv import load_dotenv
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, NotFound

# .env 로드 및 API 설정
load_dotenv()
app = FastAPI()

# --- API 키 설정 ---
# Gemini API
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY 환경변수가 설정되지 않았습니다.")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# Naver API
NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET")
if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
    raise ValueError("네이버 API 키가 설정되지 않았습니다.")

# --- Pydantic 모델 정의 (백엔드와 약속된 데이터 형식) ---
class Message(BaseModel):
    sender: str
    text: str

class RecommendRequest(BaseModel):
    messages: List[Message] # 이제 단일 메시지가 아닌, 메시지 목록을 받습니다.

class RecommendResponse(BaseModel):
    reply: str

# --- 헬퍼 함수: 네이버 지역 검색 API 호출 ---
def search_naver_local(query: str) -> dict:
    """네이버 지역 검색 API를 호출하고 결과를 JSON으로 반환합니다."""
    print(f"네이버 검색 쿼리: '{query}'")
    encText = urllib.parse.quote(query)
    url = f"https://openapi.naver.com/v1/search/local.json?query={encText}&display=10"
    
    request = urllib.request.Request(url)
    request.add_header("X-Naver-Client-Id", NAVER_CLIENT_ID)
    request.add_header("X-Naver-Client-Secret", NAVER_CLIENT_SECRET)
    
    try:
        response = urllib.request.urlopen(request)
        if response.getcode() == 200:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"네이버 API 호출 중 오류 발생: {e}")
    return None

# --- API 엔드포인트 ---
@app.post("/api/recommend", response_model=RecommendResponse)
async def recommend_restaurant(request: RecommendRequest):
    conversation_history = request.messages
    latest_user_message = conversation_history[-1].text if conversation_history else ""
    print(f"전달받은 대화기록: {conversation_history}")

    try:
        # --- 1단계: 대화 맥락 기반 키워드 추출 ---
        keyword_extraction_prompt = f"""
        당신은 대화의 맥락을 완벽하게 이해하여 검색에 필요한 정보를 추출하는 AI 전문가입니다.
        아래 [대화 기록]을 참고하여, **가장 마지막에 사용자가 한 말**에서 검색 키워드를 추출해주세요.

        [지시사항]
        1. 'locations': 사용자가 마지막에 언급한 지역명들을 리스트 형태로 추출합니다. 만약 사용자가 명시적으로 다른 지역을 언급하지 않았다면, 이전 대화에서 언급된 지역을 가져와야 합니다.
        2. 'food_or_brand': 마지막 질문의 핵심 주제입니다. 만약 "다른 곳은 없어?" 처럼 주제가 생략되었다면, 이전 대화의 주제(예: "스타벅스")를 그대로 가져와야 합니다.
        3. 'is_franchise': 'food_or_brand'가 '스타벅스', '프랭크버거'와 같이 명확한 프랜차이즈 이름이면 true, 그렇지 않으면 false로 설정해주세요.

        [대화 기록]
        {json.dumps([msg.dict() for msg in conversation_history], ensure_ascii=False)}

        [JSON 출력 형식]
        {{
          "locations": ["추출된 지역명1"],
          "food_or_brand": "음식/브랜드",
          "is_franchise": true
        }}
        """
        response = model.generate_content(keyword_extraction_prompt)
        # LLM 응답에서 JSON 부분만 깔끔하게 추출
        cleaned_response_text = response.text.strip().lstrip("```json").rstrip("```")
        keywords = json.loads(cleaned_response_text)
        print(f"추출된 키워드: {keywords}")

        # --- 2단계: 동적 검색 쿼리 생성 및 실행 ---
        all_search_items = []
        if keywords.get("locations"):
            for location in keywords["locations"]:
                # 프랜차이즈 여부에 따라 검색어 동적 생성
                query_suffix = "" if keywords.get("is_franchise") else " 맛집"
                search_query = f"{location} {keywords.get('food_or_brand', '')}{query_suffix}"
                
                search_results = search_naver_local(search_query.strip())
                if search_results and search_results.get("items"):
                    all_search_items.extend(search_results["items"])
        
        # --- 3단계: 최종 답변 생성 ---
        if not all_search_items:
            bot_reply = "죄송합니다, 관련 정보를 찾을 수 없었어요. 조금 더 자세히 질문해주시겠어요?"
        else:
            # 중복된 링크를 기준으로 검색 결과 제거
            unique_items = list({item['link']: item for item in all_search_items}.values())
            # LLM에게 전달할 참고 정보 생성
            context_info = "\n".join([f"- 상호명: {item.get('title', '').replace('<b>', '').replace('</b>', '')}, 주소: {item.get('address', '')}" for item in unique_items[:5]])

            generation_prompt = f"""
            당신은 [대화 기록]과 [검색된 정보]를 종합하여, 친구처럼 자연스럽게 답변하는 맛집 추천 전문가입니다.

            [지시사항]
            1. 사용자의 마지막 질문 의도에 맞춰 답변을 시작해주세요.
            2. 검색된 가게들을 번호를 매긴 목록으로 최대 5개까지 알려주세요.
            3. 가게 이름에 'DT'가 포함되어 있다면 "(드라이브스루 가능)" 이라고 덧붙여주세요.

            [대화 기록]
            {json.dumps([msg.dict() for msg in conversation_history], ensure_ascii=False)}

            [검색된 정보]
            {context_info}

            [너의 답변]
            """
            final_response = model.generate_content(generation_prompt)
            bot_reply = final_response.text

        print(f"최종 생성된 답변: {bot_reply}")
        return RecommendResponse(reply=bot_reply)

    except Exception as e:
        print(f"오류 발생: {e}")
        raise HTTPException(status_code=500, detail="챗봇 응답 생성 중 내부 서버 오류가 발생했습니다.")
