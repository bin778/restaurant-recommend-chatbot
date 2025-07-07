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

    # --- 사용자 메시지 필터링 ---
    for keyword in filtered_keywords:
        if keyword.lower() in latest_user_message.lower():
            print(f"🚫 부적절 키워드 '{keyword}' 감지.")
            return "죄송합니다. 해당 주제에 대해서는 답변해 드릴 수 없습니다."

    # --- Few-shot 예시를 포함하여 지능을 고도화한 통합 프롬프트 ---
    combined_analysis_prompt = f"""
    당신은 사용자의 메시지를 분석하여, 그 의도에 따라 다음 세 가지 작업 중 하나를 수행하는 멀티태스킹 AI입니다.

    [작업 흐름]
    1. 마지막 사용자 메시지의 의도를 '맛집 추천', '상세 정보 질문', '일반 대화' 중 하나로 분류합니다.
    2. 의도가 '일반 대화'이면, 'reply' 필드에 직접 답변을 생성하고 나머지 필드는 null로 설정합니다.
    3. 의도가 '맛집 추천'이면, 'reply'는 null로 두고, 네이버 지역 검색에 필요한 'search_keywords'와 'sentiment_keywords'를 추출합니다.
    4. 의도가 '상세 정보 질문'이면, 'reply'는 null로 두고, 사용자가 궁금해하는 가게 정보인 'detail_query'를 추출합니다.

    [추출 지시사항]
    - sentiment_keywords: 사용자의 기분, 날씨, 맛 취향 등 감성/상황 키워드.
    - search_keywords: 맛집 추천 검색어. {{ "topics": [...], "locations": [...], "exclude_list": [...] }} 형식.
    - detail_query: 상세 정보 질문. {{ "target_restaurant": "...", "requested_details": "..." }} 형식.

    ---
    [Few-shot 예시]

    # 예시 1: 감성 키워드가 포함된 맛집 추천 질문
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
        }},
        "detail_query": null
    }}

    # 예시 2: 특정 가게에 대한 상세 정보 질문
    - 대화 기록: [
        {{"sender": "user", "text": "상수역 근처 맛집 추천해줘"}},
        {{"sender": "assistant", "text": "네, 상수역 근처 맛집으로 '후라토식당'과 '오챠'를 추천해드릴게요."}},
        {{"sender": "user", "text": "후라토식당 영업시간이 어떻게 돼?"}}
    ]
    - 출력:
    {{
        "intent": "상세 정보 질문",
        "reply": null,
        "sentiment_keywords": null,
        "search_keywords": null,
        "detail_query": {{
            "target_restaurant": "후라토식당 상수점",
            "requested_details": "영업시간"
        }}
    }}

    # 예시 3: 간단한 일반 대화
    - 대화 기록: [{{"sender": "user", "text": "고마워!"}}]
    - 출력:
    {{
        "intent": "일반 대화",
        "reply": "천만에요! 또 궁금한 점이 있으시면 언제든지 물어보세요.",
        "sentiment_keywords": null,
        "search_keywords": null,
        "detail_query": null
    }}
    ---

    [실제 분석 대상]

    [대화 기록]
    {json.dumps([msg.dict() for msg in conversation_history], ensure_ascii=False)}

    [JSON 출력 형식]
    {{ "intent": "...", "reply": "...", "sentiment_keywords": "...", "search_keywords": {{...}}, "detail_query": {{...}} }}
    """
    
    analysis_response = model.generate_content(combined_analysis_prompt)
    # JSON 문자열만 깔끔하게 추출하기 위한 후처리
    response_text = analysis_response.text.strip()
    json_part = response_text[response_text.find('{'):response_text.rfind('}')+1]
    analysis_data = json.loads(json_part)

    print(f"통합 분석 결과: {analysis_data}")
    
    intent = analysis_data.get("intent")

    if intent == "일반 대화":
        return analysis_data.get("reply", "네, 말씀하세요.")

    # --- 의도에 따른 정보 검색 (Retrieval) ---
    context_info = ""
    
    if intent == "상세 정보 질문":
        detail_query = analysis_data.get("detail_query")
        target_restaurant = detail_query.get("target_restaurant") if detail_query else None
        if target_restaurant:
            # 네이버 지역 검색 API는 정확도를 위해 'target_restaurant' 그대로 사용
            search_results = search_naver_local(target_restaurant)
            if search_results and search_results.get("items"):
                first_item = search_results["items"][0]
                place_url = first_item.get("link")

                is_place_url = place_url and ('map.naver.com' in place_url or 'm.place.naver.com' in place_url)
                if is_place_url:
                    context_info = scrape_naver_place_details(place_url)
                else:
                    context_info = f"'{target_restaurant}'의 네이버 지도 상세 페이지를 찾지 못했습니다."
            else:
                context_info = f"'{target_restaurant}'에 대한 정보를 찾을 수 없습니다."
        else:
             context_info = "어떤 가게에 대해 궁금하신가요? 가게 이름을 말씀해주세요."

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
                    # exclude_list에 포함된 가게는 추천에서 제외
                    exclude_list = keywords.get("exclude_list", [])
                    filtered_items = [
                        item for item in search_results["items"]
                        if not any(ex_item in item.get('title', '').replace('<b>', '').replace('</b>', '') for ex_item in exclude_list)
                    ]
                    all_search_items.extend(filtered_items)
        
        unique_items = list({item['link']: item for item in all_search_items}.values())
        context_info = "\n".join([f"- 상호명: {item.get('title', '').replace('<b>', '').replace('</b>', '')}, 주소: {item.get('address', '')}, 카테고리: {item.get('category', '')}" for item in unique_items[:5]])

    # --- 최종 답변 생성 (Generation) ---
    if not context_info:
        sentiment_keywords = analysis_data.get("sentiment_keywords")
        if intent == "맛집 추천" and sentiment_keywords:
             return f"{sentiment_keywords}에 어울리는 장소를 찾지 못했어요. 다른 장소나 키워드로 다시 추천해드릴까요?"
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