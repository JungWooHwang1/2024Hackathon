from flask import Flask, jsonify, request
import mysql.connector
import redis
import json
from flask_cors import CORS

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

prompt = '''
너는 세계적인 통계학 전문가 및 데이터 분석가 및 데이터 시각화 전문가야
아래 요구사항을 충족시켜줘
id값은 무시해도 돼
대한민국 시,군,구 별 평균소득(단위 : 천원)과 시,군,구 별 스트레스 지수(%), 우울감 지수(%), 우울증세 지수(%)를 너에게 json 형태로 입력할거야

사용자의 입력을 모두 마친 후 분석을 하여 받은 값을 react에서 chart.js를 이용해서 그래프로 효과적이게 나타낼 수 있게 그래프 그려주는 코드를 작성해야해

- 사용자 입력
시,군,구 별 평균소득 : 
'''

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def get_db_connection():
    return mysql.connector.connect(
        host="",
        user="",
        password="",
        database=""
    )

# Redis 클라이언트 설정 (EC2 인스턴스의 IP 주소와 포트 사용)
redis_client = redis.StrictRedis(host='3.36.50.178', port=6379, db=0)

def fetch_from_db(query):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return rows

@app.route('/average-income', methods=['GET'])
def get_average_income():
    cache_key = 'average_income'
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data))

    rows = fetch_from_db("SELECT * FROM average_income")
    redis_client.setex(cache_key, 3600, json.dumps(rows))  # 캐시 1시간 유지
    return jsonify(rows)

@app.route('/stress-data', methods=['GET'])
def get_stress_data():
    cache_key = 'stress_data'
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data))

    rows = fetch_from_db("SELECT * FROM stress_data")
    redis_client.setex(cache_key, 3600, json.dumps(rows))  # 캐시 1시간 유지
    return jsonify(rows)

@app.route('/depression-data', methods=['GET'])
def get_depression_data():
    cache_key = 'depression_data'
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data))

    rows = fetch_from_db("SELECT * FROM depression_data")
    redis_client.setex(cache_key, 3600, json.dumps(rows))  # 캐시 1시간 유지
    return jsonify(rows)

@app.route('/degressive-data', methods=['GET'])
def get_degressive_data():
    cache_key = 'degressive_data'
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data))

    rows = fetch_from_db("SELECT * FROM degressive_data")
    redis_client.setex(cache_key, 3600, json.dumps(rows))  # 캐시 1시간 유지
    return jsonify(rows)

@app.route('/api/region/<region>', methods=['GET'])
def get_region_data(region):
    # 시/군/구 데이터를 받아서 분석 요청
    # 실제 분석 로직은 예제용으로 단순화
    analyzed_data = {
        "region": region,
        "average_income": "3000만원",
        "stress_level": "중간",
        "depression_level": "낮음",
        "depression_symptoms": "거의 없음"
    }
    
    return jsonify(analyzed_data)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port="5003")
