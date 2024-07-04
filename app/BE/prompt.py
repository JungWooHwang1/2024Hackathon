import google.generativeai as genai
from IPython.display import display
from IPython.display import Markdown

# 본인 API키 등록
GOOGLE_API_KEY = ""

safety_settings_NONE=[
    { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
    { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
    { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
    { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
]

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro', safety_settings=safety_settings_NONE)

prompt1 = '''
너는 세계적인 통계학 전문가 및 데이터 분석가 및 데이터 시각화 전문가야
아래 요구사항을 충족시켜줘
id값은 무시해도 돼
대한민국 시,군,구 별 평균소득(단위 : 천원)과 시,군,구 별 스트레스 지수(%), 우울감 지수(%), 우울증세 지수(%)를 너에게 json 형태로 입력할거야

사용자의 입력을 모두 마친 후 분석을 하여 받은 값을 react에서 chart.js를 이용해서 그래프로 효과적이게 나타낼 수 있게 그래프 그려주는 코드를 작성해야해

- 사용자 입력
시,군,구 별 평균소득 : 
'''

prompt2 = '''
시,군,구 별 스트레스 지수(%) :
'''


prompt3 = '''
시,군,구 별 우울감 지수(%) :
'''


prompt4 = '''
시,군,구 별 우울증세 지수(%) :
'''


response = model.generate_content(prompt1 ,stream=True) # google.generativeai 모듈의 content생성 함수 
response.resolve()
print(response.text)
