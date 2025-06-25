import os
import json
import urllib.request
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from dotenv import load_dotenv
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, NotFound # NotFound 임포트 추가

# .env 로드 및 API 설정
load_dotenv()
app = FastAPI()
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')
NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET")

# --- Pydantic 모델 정의 ---
class Message(BaseModel):
    sender: str
    text: str

class RecommendRequest(BaseModel):
    messages: List[Message]

class RecommendResponse(BaseModel):
    reply: str

# --- 네이버 검색 함수 (변경 없음) ---
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

# --- API 엔드포인트 ---
@app.post("/api/recommend", response_model=RecommendResponse)
async def recommend_restaurant(request: RecommendRequest):
    conversation_history = request.messages
    # --- 누락된 변수 정의 추가 ---
    latest_user_message = conversation_history[-1].text if conversation_history else ""
    print(f"전달받은 대화기록: {conversation_history}")

    try:
        # --- 1단계: 대화 맥락 기반 키워드 추출 (고도화) ---
        keyword_extraction_prompt = f"""
        당신은 대화의 맥락을 완벽하게 이해하여 검색에 필요한 정보를 추출하는 AI 전문가입니다.
        아래 [대화 기록]을 참고하여, **가장 마지막에 사용자가 한 말**에서 검색 키워드를 추출해주세요.

        [지시사항]
        1. 'topic': 대화의 핵심 주제(음식 또는 브랜드)를 추출합니다. "다른 곳은 없어?" 와 같이 주제가 생략되면, 이전 대화에서 사용자가 마지막으로 관심을 보인 주제를 가져와야 합니다.
        2. 'locations': 사용자가 마지막에 언급한 지역명 리스트입니다.
        3. 'is_franchise': 'topic'이 '스타벅스', '프랭크버거'와 같이 명확한 프랜차이즈 이름이면 true, 그렇지 않으면 false로 설정해주세요.
        4. 'exclude_list': 이전 챗봇 답변에서 이미 추천했던 가게 이름들의 리스트입니다. 사용자가 "다른 곳"을 찾을 때, 이 가게들을 제외하고 추천해야 합니다.

        [대화 기록]
        {json.dumps([msg.dict() for msg in conversation_history], ensure_ascii=False)}

        [JSON 출력 형식]
        {{
          "topic": "음식/브랜드",
          "locations": ["지역명1", "지역명2"],
          "is_franchise": true/false,
          "exclude_list": ["이미 추천한 가게1", "이미 추천한 가게2"]
        }}
        """
        response = model.generate_content(keyword_extraction_prompt)
        cleaned_response_text = response.text.strip().lstrip("```json").rstrip("```")
        keywords = json.loads(cleaned_response_text)
        print(f"추출된 키워드: {keywords}")

        # --- 2단계: 동적 검색 쿼리 생성 및 실행 ---
        all_search_items = []
        if keywords.get("locations"):
            for location in keywords["locations"]:
                query_suffix = "" if keywords.get("is_franchise") else " 맛집"
                search_query = f"{location} {keywords.get('topic', '')}{query_suffix}"
                
                search_results = search_naver_local(search_query.strip())
                if search_results and search_results.get("items"):
                    all_search_items.extend(search_results["items"])
        
        # --- 3단계: 최종 답변 생성 ---
        exclude_list = keywords.get("exclude_list", [])
        filtered_items = [item for item in all_search_items if item.get('title', '').replace('<b>', '').replace('</b>', '') not in exclude_list]
        unique_items = list({item['link']: item for item in filtered_items}.values())

        if not unique_items:
            bot_reply = "죄송합니다, 더 이상 추천해드릴 다른 맛집 정보를 찾을 수 없었어요."
        else:
            context_info = "\n".join([f"- 상호명: {item.get('title', '').replace('<b>', '').replace('</b>', '')}, 주소: {item.get('address', '')}, 카테고리: {item.get('category', '')}" for item in unique_items[:5]])

            generation_prompt = f"""
            너는 사용자의 질문과 제공된 검색 결과를 바탕으로 맛집을 추천하는 친절하고 상세한 챗봇이야.

            [지시사항]
            1. 사용자의 마지막 질문 의도를 파악해서 첫 문장을 시작해줘.
            2. 추천할 가게가 2개 이하이면, 각 가게에 대해 상세하고 매력적으로 설명해줘.
            3. 추천할 가게가 3개 이상이면, 각 가게의 핵심 정보(특징, 주소)만 간결하게 요약해서 알려줘.
            4. 각 가게는 번호를 매겨서 설명하고, 가게 이름과 설명을 줄바꿈으로 명확히 구분해줘.
            5. 가게 이름에 'DT'가 포함되어 있다면 "(드라이브스루 가능)" 이라고 덧붙여줘.
            6. 절대 마크다운(`**` 등)을 사용하지 마.
            7. 마지막에는 "더 궁금한 점이 있으시면 언제든지 다시 물어보세요!" 와 같이 친근한 마무리 인사를 덧붙여줘.

            [사용자 질문]
            {latest_user_message}

            [검색된 맛집 정보]
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
