import os
import sys
import urllib.request
from dotenv import load_dotenv # 추가된 부분

load_dotenv() # 스크립트 시작 시 .env 파일의 환경변수를 불러옴

# os 모듈을 사용해 환경변수에서 키를 불러옵니다.
client_id = os.environ.get('NAVER_CLIENT_ID')
client_secret = os.environ.get('NAVER_CLIENT_SECRET')

encText = urllib.parse.quote("쌍동통닭")
url = "https://openapi.naver.com/v1/search/local.json?query=" + encText # JSON 결과
# url = "https://openapi.naver.com/v1/search/blog.xml?query=" + encText # XML 결과

request = urllib.request.Request(url)
request.add_header("X-Naver-Client-Id",client_id)
request.add_header("X-Naver-Client-Secret",client_secret)

response = urllib.request.urlopen(request)

rescode = response.getcode()
if(rescode==200):
    response_body = response.read()
    print(response_body.decode('utf-8'))
else:
    print("Error Code:" + rescode)
