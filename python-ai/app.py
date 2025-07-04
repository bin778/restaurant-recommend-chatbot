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
        # --- [핵심 수정] 1단계: Few-shot 예시를 포함하여 지능을 고도화한 통합 프롬프트 ---
        combined_analysis_prompt = f"""
        당신은 사용자의 메시지를 분석하여, 그 의도에 따라 다음 세 가지 작업 중 하나를 수행하는 멀티태스킹 AI입니다.

        [작업 흐름]
        1. 마지막 사용자 메시지의 의도를 '맛집 추천' 또는 '일반 대화'로 분류합니다.
        2. 의도가 '일반 대화'이면, 'reply' 필드에 직접 답변을 생성하고 나머지 필드는 null로 설정합니다.
        3. 의도가 '맛집 추천'이면, 'reply' 필드는 null로 두고, 네이버 지역 검색에 필요한 'search_keywords'와 사용자의 'sentiment_keywords'를 추출합니다.

        [추출 지시사항]
        - sentiment_keywords: 사용자의 기분(예: 우울함), 날씨(예: 비 오는 날), 맛 취향(예: 매콤한) 등 감성/상황 키워드를 추출합니다.
        - topics: 사용자가 언급한 음식, 브랜드, 맛을 모두 리스트 형태로 추출합니다. '비 오는 날' -> '파전, 칼국수' 처럼 상황을 검색 가능한 음식 키워드로 변환하여 topics에 추가합니다.
        - locations: 사용자가 마지막에 언급한 지역명 리스트를 추출합니다.
        - exclude_list: 이전 챗봇 답변에서 이미 추천했던 가게 이름들의 리스트입니다.

        ---
        [Few-shot 예시]

        # 예시 1: 간단한 맛집 질문
        - 대화 기록: [{{"sender": "user", "text": "우장산역 근처에 먹을 만한 맛집 있어?"}}]
        - 출력:
        {{
            "intent": "맛집 추천",
            "reply": null,
            "sentiment_keywords": null,
            "search_keywords": {{
                "topics": ["맛집"],
                "locations": ["우장산역"],
                "exclude_list": []
            }}
        }}

        # 예시 2: 감성 키워드가 포함된 질문
        - 대화 기록: [{{"sender": "user", "text": "오늘 너무 우울해서 그런데, 강남에서 달달한 디저트 맛있는 곳 좀 알려줘"}}]
        - 출력:
        {{
            "intent": "맛집 추천",
            "reply": null,
            "sentiment_keywords": "우울한, 달달한",
            "search_keywords": {{
                "topics": ["달달한 디저트", "케이크", "카페"],
                "locations": ["강남"],
                "exclude_list": []
            }}
        }}

        # 예시 3: 일반 대화
        - 대화 기록: [{{"sender": "user", "text": "고마워!"}}]
        - 출력:
        {{
            "intent": "일반 대화",
            "reply": "천만에요! 또 궁금한 점이 있으시면 언제든지 물어보세요.",
            "sentiment_keywords": null,
            "search_keywords": null
        }}
        ---

        [실제 분석 대상]

        [대화 기록]
        {json.dumps([msg.dict() for msg in conversation_history], ensure_ascii=False)}

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

        # --- 맛집 추천 로직 시작 ---
        sentiment = analysis_data.get("sentiment_keywords")
        keywords = analysis_data.get("search_keywords")

        if not keywords or not keywords.get("locations"):
            # [수정] 위치 정보가 없을 때, 현재 위치를 사용하도록 유도하거나 다시 질문
            if request.current_location:
                print(f"사용자가 위치를 언급하지 않았습니다. 전달받은 현재 위치 '{request.current_location}'를 사용합니다.")
                keywords = keywords or {}
                keywords["locations"] = [request.current_location]
            else:
                return RecommendResponse(reply="어디 근처의 맛집을 찾아드릴까요? 지역을 말씀해주시면 더 정확하게 추천해 드릴 수 있어요.")

        # --- 외부 데이터 검색 ---
        all_search_items = []
        for location in keywords.get("locations", []):
            for topic in keywords.get("topics", ["맛집"]):
                search_query = f"{location} {topic}"
                search_results = search_naver_local(search_query.strip())
                if search_results and search_results.get("items"):
                    all_search_items.extend(search_results["items"])
        
        # --- 최종 답변 생성 ---
        exclude_list = keywords.get("exclude_list", [])
        filtered_items = [item for item in all_search_items if item.get('title', '').replace('<b>', '').replace('</b>', '') not in exclude_list]
        unique_items = list({item['link']: item for item in filtered_items}.values())

        if not unique_items:
            bot_reply = "죄송합니다, 원하시는 조건의 맛집 정보를 찾지 못했어요. 키워드를 조금 바꿔서 다시 질문해주시겠어요?"
        else:
            context_info = "\n".join([f"- {item.get('title', '').replace('<b>', '').replace('</b>', '')} (주소: {item.get('address', '')}, 카테고리: {item.get('category', '')})" for item in unique_items[:5]])

            # --- LLM 호출 (2회) ---
            generation_prompt = f"""
            너는 사용자의 감정까지 고려하여 맞춤형으로 추천하는, 다정다감한 맛집 큐레이터야.
            [지시사항]
            1. [사용자 감성]을 반영하여, 따뜻하게 공감하는 첫인사로 답변을 시작해줘.
            2. '검색된 맛집 정보'를 바탕으로, 질문에 가장 적합한 가게를 최대 5곳까지 선정해서 번호를 매겨 설명해줘.
            3. 가게 이름에 'DT'가 포함되어 있다면 "(드라이브스루 가능)" 이라고 덧붙여줘.
            4. 마지막에는 "이 추천이 마음에 드셨으면 좋겠네요! 기분 좋은 하루 보내세요. 😄" 와 같이 다양하고 긍정적인 마무리 인사를 건네줘.
            5. 절대 마크다운(`**` 등)을 사용하지 마.
            [사용자 감성]: "{sentiment}"
            [사용자 질문]: "{latest_user_message}"
            [검색된 맛집 정보]: {context_info}
            [너의 답변]:
            """
            final_response = model.generate_content(generation_prompt)
            bot_reply = final_response.text

        print(f"최종 생성된 답변: {bot_reply}")
        return RecommendResponse(reply=bot_reply)

    except Exception as e:
        print(f"오류 발생: {e}")
        raise HTTPException(status_code=500, detail="챗봇 응답 생성 중 내부 서버 오류가 발생했습니다.")
