import json, os
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from services import search_naver_local, scrape_naver_place_details

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

class Message(BaseModel):
    sender: str
    text: str

async def process_recommendation_request(
    conversation_history: List[Message],
    filtered_keywords: set,
    current_location: Optional[str] = None
) -> str:
    """
    사용자의 요청을 받아 RAG 파이프라인을 실행하고 최종 답변을 반환합니다.
    """
    latest_user_message = conversation_history[-1].text if conversation_history else ""

    # --- 1. 사용자 메시지 필터링 ---
    for keyword in filtered_keywords:
        if keyword.lower() in latest_user_message.lower():
            print(f"🚫 부적절 키워드 '{keyword}' 감지.")
            return "죄송합니다. 해당 주제에 대해서는 답변해 드릴 수 없습니다."

    # --- 2. LLM을 이용한 의도 분석 및 키워드 추출 ---
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

    [대화 기록]
    {json.dumps([msg.dict() for msg in conversation_history], ensure_ascii=False)}

    [JSON 출력 형식]
    {{"intent": "...", "reply": "...", "sentiment_keywords": "...", "search_keywords": {{...}}, "detail_query": {{...}}}}
    """
    
    analysis_response = model.generate_content(combined_analysis_prompt)
    analysis_data = json.loads(analysis_response.text.strip().lstrip("```json").rstrip("```"))
    print(f"통합 분석 결과: {analysis_data}")
    
    intent = analysis_data.get("intent")

    if intent == "일반 대화":
        return analysis_data.get("reply", "네, 말씀하세요.")

    # --- 3. 의도에 따른 정보 검색 (Retrieval) ---
    context_info = ""
    sentiment = analysis_data.get("sentiment_keywords")
    
    if intent == "상세 정보 질문":
        detail_query = analysis_data.get("detail_query")
        target_restaurant = detail_query.get("target_restaurant") if detail_query else None
        if target_restaurant:
            search_results = search_naver_local(target_restaurant)
            if search_results and search_results.get("items"):
                place_url = search_results["items"][0].get("link")
                if place_url.startswith("https://map.naver.com/p/"): # 네이버 플레이스 URL인지 확인
                    context_info = scrape_naver_place_details(place_url)
                else:
                    context_info = "해당 가게의 네이버 지도 상세 페이지를 찾지 못했습니다."
            else:
                context_info = f"'{target_restaurant}'에 대한 정보를 찾을 수 없습니다."
        else:
             context_info = "어떤 가게에 대해 궁금하신가요?"

    elif intent == "맛집 추천":
        keywords = analysis_data.get("search_keywords")
        if not keywords or not keywords.get("locations"):
            if current_location:
                keywords = keywords or {}
                keywords["locations"] = [current_location]
            else:
                return "어디 근처의 맛집을 찾아드릴까요? 지역을 말씀해주시면 더 정확하게 추천해 드릴 수 있어요."
        
        all_search_items = []
        for location in keywords.get("locations", []):
            for topic in keywords.get("topics", ["맛집"]):
                search_query = f"{location} {topic}"
                search_results = search_naver_local(search_query)
                if search_results and search_results.get("items"):
                    all_search_items.extend(search_results["items"])
        
        unique_items = list({item['link']: item for item in all_search_items}.values())
        context_info = "\n".join([f"- 상호명: {item.get('title', '').replace('<b>', '').replace('</b>', '')}, 주소: {item.get('address', '')}, 카테고리: {item.get('category', '')}" for item in unique_items[:5]])

    # --- 4. 최종 답변 생성 (Generation) ---
    if not context_info:
        return "죄송합니다, 정보를 찾는 데 실패했어요. 다시 질문해주시겠어요?"

    generation_prompt = f"""
    너는 사용자의 질문에 대해, [주어진 정보]를 바탕으로 친절하고 명확하게 설명하는 맛집 큐레이터야.
    
    [지시사항]
    1. [주어진 정보]를 완벽하게 분석하고 요약해서 답변해줘.
    2. 사용자가 '영업시간', '메뉴' 등을 물어보면, 정보에서 해당 내용을 찾아내서 알려줘.
    3. 만약 정보에 내용이 없다면, "아쉽게도 제가 가진 정보에는 영업시간이 나와있지 않네요." 와 같이 솔직하게 답변해줘.
    4. 절대 [주어진 정보]에 없는 내용을 추측해서 말하지 마.
    5. 절대 마크다운(`**` 등)을 사용하지 마.

    [사용자 질문]: "{latest_user_message}"
    [주어진 정보]:
    {context_info}

    [너의 답변]:
    """
    final_response = model.generate_content(generation_prompt)
    bot_reply = final_response.text

    print(f"최종 생성된 답변: {bot_reply}")
    return bot_reply