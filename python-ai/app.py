import os
import json
import urllib.request
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
import google.generativeai as genai
import requests
from contextlib import asynccontextmanager

# .env 로드 및 API 설정
load_dotenv()
app = FastAPI()
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')
NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET")
SPRING_BOOT_API_URL = "https://localhost:8443"
filtered_keywords = set()

# Pydantic 모델 정의
class Message(BaseModel):
    sender: str
    text: str

class RecommendRequest(BaseModel):
    messages: List[Message]

class RecommendResponse(BaseModel):
    reply: str

# 서버 시작 시 필터링 키워드 로드
def load_filtered_keywords():
    global filtered_keywords
    try:
        # Spring Boot의 공개 API 엔드포인트에서 키워드 목록을 가져옴
        response = requests.get(f"{SPRING_BOOT_API_URL}/api/public/filtered-keywords", verify=False)
        if response.status_code == 200:
            keywords_list = response.json()
            filtered_keywords = set(keywords_list)
            print(f"✅ 필터링 키워드 로드 완료: {len(filtered_keywords)}개")
    except Exception as e:
        print(f"❌ 필터링 키워드 로드 실패: {e}")

# FastAPI Lifespan 이벤트 핸들러
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작 시 실행될 로직
    load_filtered_keywords()
    yield
    # 서버 종료 시 실행될 로직 (필요 시 추가)
    print("서버가 종료됩니다.")

# FastAPI 앱 인스턴스 생성 시 lifespan 적용
app = FastAPI(lifespan=lifespan)

# 네이버 검색 함수
def search_naver_local(query: str) -> dict:
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

# API 엔드포인트
@app.post("/api/refresh-keywords")
async def refresh_keywords():
    print("🔄 키워드 목록 새로고침 요청 수신. 갱신을 시작합니다.")
    load_filtered_keywords()
    return {"message": "Keywords refreshed successfully."}

@app.post("/api/recommend", response_model=RecommendResponse)
async def recommend_restaurant(request: RecommendRequest):
    conversation_history = request.messages
    latest_user_message = conversation_history[-1].text if conversation_history else ""
    print(f"전달받은 대화기록: {conversation_history}")

    # 사용자 메시지 필터링
    for keyword in filtered_keywords:
        if keyword.lower() in latest_user_message.lower():
            print(f"🚫 부적절 키워드 '{keyword}' 감지. 추천 프로세스를 중단합니다.")
            return RecommendResponse(reply="죄송합니다. 해당 주제에 대해서는 답변해 드릴 수 없습니다. 다른 질문이 있으신가요?")

    try:
        # 1단계 (신규): 의도 및 감정 분석
        intent_analysis_prompt = f"""
        당신은 사용자의 대화 의도를 분석하는 AI입니다.
        아래 [대화 기록]의 마지막 메시지를 보고, 의도를 '맛집 추천' 또는 '일반 대화'로 분류해주세요.
        만약 '맛집 추천' 의도라면, 사용자의 기분(예: 우울함, 신남), 날씨(예: 비 오는 날), 맛 취향(예: 달달한, 매콤한)과 관련된 '감성/상황 키워드'를 함께 추출해주세요.

        [대화 기록]
        {json.dumps([msg.dict() for msg in conversation_history], ensure_ascii=False)}

        [JSON 출력 형식]
        {{"intent": "맛집 추천" or "일반 대화", "sentiment_keywords": "감성/상황 키워드 또는 빈 문자열"}}
        """
        intent_response = model.generate_content(intent_analysis_prompt)
        intent_data = json.loads(intent_response.text.strip().lstrip("```json").rstrip("```"))
        print(f"의도 분석 결과: {intent_data}")
        
        intent = intent_data.get("intent")
        sentiment = intent_data.get("sentiment_keywords", "")

        # 분기 처리: 일반 대화 vs 맛집 추천
        if intent == "일반 대화":
            general_response_prompt = f"""
            당신은 사용자의 말에 친절하게 공감하며 응답하는 챗봇입니다.
            마지막 사용자 메시지에 대해 짧고 자연스러운 답변을 생성해주세요. (예: "천만에요! 도움이 되셨다니 저도 기쁘네요. 😊")

            사용자 메시지: "{latest_user_message}"
            """
            bot_reply = model.generate_content(general_response_prompt).text
            return RecommendResponse(reply=bot_reply)

        # 2단계: 맛집 추천을 위한 키워드 추출
        keyword_extraction_prompt = f"""
        [대화 기록]과 [감성/상황 키워드]를 바탕으로, 네이버 지도 검색에 사용할 검색어와 관련 정보를 JSON으로 추출해줘.

        [지시사항]
        1. 'topics': 사용자가 언급한 음식, 브랜드, 맛(예: 매운, 달달한)을 **모두 리스트 형태**로 추출해줘.
        2. 'locations': 사용자가 마지막에 언급한 지역명 리스트야.
        3. 'is_franchise': 'topics'에 '스타벅스', '프랭크버거', 'BHC'와 같이 명확한 프랜차이즈 이름이 포함되면 true로 설정해줘.
        4. 'exclude_list': 이전 챗봇 답변에서 이미 추천했던 가게 이름들의 리스트야.
        5. '비 오는 날' -> '파전, 칼국수', '우울한 날' -> '달달한 케이크, 매운 떡볶이' 처럼 상황을 검색 가능한 음식 키워드로 변환해서 'topics'에 추가해줘.

        [대화 기록]: {json.dumps([msg.dict() for msg in conversation_history], ensure_ascii=False)}
        [감성/상황 키워드]: "{sentiment}"

        [JSON 출력 형식]
        {{"topics": ["음식/브랜드1", "맛1"], "locations": ["지역명1"], "is_franchise": true/false, "exclude_list": ["추천했던 가게1"]}}
        """
        keyword_response = model.generate_content(keyword_extraction_prompt)
        keywords = json.loads(keyword_response.text.strip().lstrip("```json").rstrip("```"))
        print(f"검색 키워드: {keywords}")

        # 3단계: 외부 데이터 검색
        all_search_items = []
        if keywords.get("locations"):
            for location in keywords["locations"]:
                for topic in keywords.get("topics", ["맛집"]):
                    query_suffix = "" if keywords.get("is_franchise") else " 맛집"
                    search_query = f"{location} {topic}{query_suffix}"
                    search_results = search_naver_local(search_query.strip())
                    if search_results and search_results.get("items"):
                        all_search_items.extend(search_results["items"])
        
        # 4단계: 최종 답변 생성
        exclude_list = keywords.get("exclude_list", [])
        filtered_items = [item for item in all_search_items if item.get('title', '').replace('<b>', '').replace('</b>', '') not in exclude_list]
        unique_items = list({item['link']: item for item in filtered_items}.values())

        if not unique_items:
            bot_reply = "죄송합니다, 원하시는 조건의 맛집 정보를 찾지 못했어요. 키워드를 조금 바꿔서 다시 질문해주시겠어요?"
        else:
            context_info = "\n".join([f"- {item.get('title', '').replace('<b>', '').replace('</b>', '')} (주소: {item.get('address', '')}, 카테고리: {item.get('category', '')})" for item in unique_items[:5]])

            generation_prompt = f"""
            너는 사용자의 감정까지 고려하여 맞춤형으로 추천하는, 다정다감한 맛집 큐레이터야.

            [지시사항]
            1. [사용자 감성]을 반영하여, 따뜻하게 공감하는 첫인사로 답변을 시작해줘.
            2. '검색된 맛집 정보'를 바탕으로, 질문에 가장 적합한 가게를 최대 5곳까지 선정해서 번호를 매겨 설명해줘.
            3. 추천할 가게가 2개 이하이면, 각 가게에 대해 상세하고 매력적으로 설명해주고, 3개 이상이면 핵심 정보만 간결하게 요약해줘.
            4. 가게 이름에 'DT'가 포함되어 있다면 "(드라이브스루 가능)" 이라고 덧붙여줘.
            5. 마지막에는 "이 추천이 마음에 드셨으면 좋겠네요! 기분 좋은 하루 보내세요. 😄" 와 같이 다양하고 긍정적인 마무리 인사를 건네줘.
            6. 절대 마크다운(`**` 등)을 사용하지 마.

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
