import os, json
import urllib.request
import requests
from bs4 import BeautifulSoup

NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET")

def search_naver_local(query: str) -> dict:
    """네이버 지역 검색 API를 호출합니다."""
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        print("❌ 네이버 API 키가 설정되지 않았습니다.")
        return None
        
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

def scrape_naver_place_details(place_url: str) -> str:
    """
    네이버 지도 상세 페이지 URL을 받아, 주요 텍스트 정보를 크롤링합니다.
    """
    try:
        print(f"네이버 상세 정보 크롤링 시작: {place_url}")
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(place_url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'lxml')
        
        main_content = soup.find('div', id='app-root')
        if main_content:
            for s in main_content.select('script, style'):
                s.decompose()
            text_lines = [line.strip() for line in main_content.get_text(separator='\n').splitlines() if line.strip()]
            return '\n'.join(text_lines)
        return "상세 정보를 가져오는 데 실패했습니다."
    except Exception as e:
        print(f"크롤링 중 오류 발생: {e}")
        return "상세 정보를 가져오는 데 실패했습니다."