import os
import json
import urllib.request
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import google.generativeai as genai
import requests
from contextlib import asynccontextmanager
import urllib3

# SSL 경고 비활성화 (로컬 개발 환경용)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# .env 로드 및 API 설정
load_dotenv()
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')
NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET")
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

# --- 네이버 검색 함수 (변경 없음) ---
def search_naver_local(query: str) -> dict:
    print(f"네이버 검색 쿼리: '{query}'")
    encText = urllib.parse.quote(query)
    url = f"https://openapi.naver.com/v1/search/local.json?query={encText}&display=5"
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
@app.post("/api/refresh-keywords")
async def refresh_keywords():
    load_filtered_keywords()
    return {"message": "Keywords refreshed successfully."}

@app.post("/api/recommend", response_model=RecommendResponse)
async def recommend_restaurant(request: RecommendRequest):
    conversation_history = request.messages
    latest_user_message = conversation_history[-1].text if conversation_history else ""
    print(f"전달받은 대화기록: {conversation_history}")

    # --- 사용자 메시지 필터링 ---
    for keyword in filtered_keywords:
        if keyword.lower() in latest_user_message.lower():
            print(f"🚫 부적절 키워드 '{keyword}' 감지.")
            return RecommendResponse(reply="죄송합니다. 해당 주제에 대해서는 답변해 드릴 수 없습니다.")

    try:
        # --- [핵심 수정] 1단계: '상세 정보 질문' 의도를 추가하여 지능을 고도화한 통합 프롬프트 ---
        combined_analysis_prompt = f"""
        당신은 사용자의 메시지를 분석하여, 그 의도에 따라 다음 네 가지 작업 중 하나를 수행하는 멀티태스킹 AI입니다.

        [작업 흐름]
        1. 마지막 사용자 메시지의 의도를 '맛집 추천', '상세 정보 질문', '일반 대화' 중 하나로 분류합니다.
        2. 의도가 '일반 대화'이면, 'reply' 필드에 직접 답변을 생성하고 나머지 필드는 null로 설정합니다.
        3. 의도가 '맛집 추천'이면, 네이버 지역 검색에 필요한 'search_keywords'와 사용자의 'sentiment_keywords'를 추출합니다.
        4. 의도가 '상세 정보 질문'이면, 대화의 맥락에서 사용자가 궁금해하는 'target_restaurant'와 'requested_details'(예: 메뉴, 영업시간)를 추출합니다.

        [추출 지시사항]
        - sentiment_keywords: 사용자의 기분, 날씨, 맛 취향 등 감성/상황 키워드.
        - topics: 사용자가 언급한 음식, 브랜드, 맛 리스트. 상황을 검색 가능한 음식 키워드로 변환하여 추가.
        - locations: 사용자가 마지막에 언급한 지역명 리스트.
        - exclude_list: 이전 챗봇 답변에서 이미 추천했던 가게 이름들의 리스트.
        - target_restaurant: 사용자가 상세 정보를 물어보는 특정 가게 이름.
        - requested_details: 사용자가 요청한 구체적인 정보 (예: "대표 메뉴", "영업시간", "주차 정보").

        ---
        [Few-shot 예시]
        # 예시 1: 일반적인 맛집 추천
        - 대화 기록: [{{"sender": "user", "text": "우장산역 근처에 먹을 만한 맛집 있어?"}}]
        - 출력: {{"intent": "맛집 추천", "reply": null, "sentiment_keywords": null, "search_keywords": {{"topics": ["맛집"], "locations": ["우장산역"], "exclude_list": []}}, "detail_query": null}}

        # 예시 2: 상세 정보 질문 (후속 질문)
        - 대화 기록: [{{"sender": "bot", "text": "1. 유라멘\n이곳은..."}}, {{"sender": "user", "text": "여기 대표 메뉴랑 영업시간은 어떻게 돼?"}}]
        - 출력: {{"intent": "상세 정보 질문", "reply": null, "sentiment_keywords": null, "search_keywords": null, "detail_query": {{"target_restaurant": "유라멘", "requested_details": ["대표 메뉴", "영업시간"]}}}}
        
        # 예시 3: 일반 대화
        - 대화 기록: [{{"sender": "user", "text": "고마워!"}}]
        - 출력: {{"intent": "일반 대화", "reply": "천만에요! 또 궁금한 점이 있으시면 언제든지 물어보세요.", "sentiment_keywords": null, "search_keywords": null, "detail_query": null}}
        ---

        [실제 분석 대상]
        [대화 기록]: {json.dumps([msg.dict() for msg in conversation_history], ensure_ascii=False)}
        [JSON 출력 형식]
        """
        
        # --- LLM 호출 (1회) ---
        analysis_response = model.generate_content(combined_analysis_prompt)
        analysis_data = json.loads(analysis_response.text.strip().lstrip("```json").rstrip("```"))
        print(f"통합 분석 결과: {analysis_data}")
        
        intent = analysis_data.get("intent")

        # --- 분기 처리 ---
        if intent == "일반 대화":
            return RecommendResponse(reply=analysis_data.get("reply", "네, 말씀하세요."))

        all_search_items = []
        sentiment = analysis_data.get("sentiment_keywords")
        target_restaurant_name = None

        # --- [신규] 상세 정보 질문 처리 로직 ---
        if intent == "상세 정보 질문":
            detail_query = analysis_data.get("detail_query")
            if detail_query and detail_query.get("target_restaurant"):
                target_restaurant_name = detail_query["target_restaurant"]
                # 상세 정보 검색 시, 가게 이름으로만 검색하여 가장 정확한 장소 정보를 찾습니다.
                search_results = search_naver_local(target_restaurant_name)
                if search_results and search_results.get("items"):
                    all_search_items.extend(search_results["items"])
        
        # --- 기존 맛집 추천 로직 ---
        elif intent == "맛집 추천":
            keywords = analysis_data.get("search_keywords")
            if not keywords or not keywords.get("locations"):
                if request.current_location:
                    keywords = keywords or {}
                    keywords["locations"] = [request.current_location]
                else:
                    return RecommendResponse(reply="어디 근처의 맛집을 찾아드릴까요? 지역을 말씀해주시면 더 정확하게 추천해 드릴 수 있어요.")
            
            for location in keywords.get("locations", []):
                for topic in keywords.get("topics", ["맛집"]):
                    search_query = f"{location} {topic}"
                    search_results = search_naver_local(search_query)
                    if search_results and search_results.get("items"):
                        all_search_items.extend(search_results["items"])
        
        # --- 최종 답변 생성 ---
        unique_items = list({item['link']: item for item in all_search_items}.values())

        if not unique_items:
            # 상세 정보 질문에 대한 답변이 없을 경우
            if intent == "상세 정보 질문":
                bot_reply = f"죄송합니다, '{target_restaurant_name}'의 상세 정보를 찾지 못했어요. 가게 이름에 오타가 없는지 확인해주시겠어요?"
            else:
                bot_reply = "죄송합니다, 원하시는 조건의 맛집 정보를 찾지 못했어요. 키워드를 조금 바꿔서 다시 질문해주시겠어요?"
        else:
            # 네이버 검색 결과의 description 필드까지 포함하여 더 풍부한 컨텍스트를 만듭니다.
            context_info = "\n".join([f"- 상호명: {item.get('title', '').replace('<b>', '').replace('</b>', '')}, 주소: {item.get('address', '')}, 카테고리: {item.get('category', '')}, 설명: {item.get('description', '').replace('<b>', '').replace('</b>', '')}" for item in unique_items[:5]])

            # --- LLM 호출 (2회) ---
            generation_prompt = f"""
            너는 사용자의 질문에 대해, 검색된 정보를 바탕으로 친절하고 명확하게 설명하는 맛집 큐레이터야.

            [지시사항]
            1. 만약 [사용자 질문]이 '상세 정보'에 대한 것이라면, [검색된 맛집 정보]의 '설명(description)' 필드를 중심으로 사용자가 궁금해하는 정보(메뉴, 영업시간 등)를 찾아 답변해줘.
            2. 만약 요청한 정보가 '설명' 필드에 없다면, "아쉽게도 제가 가진 정보에는 영업시간이 나와있지 않네요. 방문 전에 직접 확인해보시는 것을 추천드려요." 와 같이 솔직하게 답변해줘.
            3. 만약 [사용자 질문]이 일반적인 '맛집 추천'이라면, [사용자 감성]을 반영하여 맞춤형으로 가게를 추천해줘.
            4. 절대 마크다운(`**` 등)을 사용하지 마.

            [사용자 감성]: "{sentiment}"
            [사용자 질문]: "{latest_user_message}"
            [검색된 맛집 정보]:
            {context_info}

            [너의 답변]:
            """
            final_response = model.generate_content(generation_prompt)
            bot_reply = final_response.text

        print(f"최종 생성된 답변: {bot_reply}")
        return RecommendResponse(reply=bot_reply)

    except Exception as e:
        print(f"오류 발생: {e}")
        raise HTTPException(status_code=500, detail="챗봇 응답 생성 중 내부 서버 오류가 발생했습니다.")