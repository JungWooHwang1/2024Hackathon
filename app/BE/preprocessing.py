import pandas as pd
import mysql.connector

# 엑셀 파일 불러오기
file_path = '/mnt/data/stress.xlsx'

# 특정 시트를 데이터프레임으로 불러오기
df_stress = pd.read_excel(file_path, sheet_name='15.스트레스', header=None)

# "2023"이라는 값을 포함하는 행을 찾음
row_index = df_stress[df_stress.eq("2023").any(axis=1)].index[0]

# 표준화율 컬럼 찾기
standardized_rate_column = df_stress.iloc[row_index].eq("표준화율").idxmax()

# 시군구 이름 및 표준화율 데이터 추출
df_2023 = df_stress.iloc[row_index + 1:, [0, standardized_rate_column]]
df_2023.columns = ["시군구", "표준화율"]

# NaN 값 제거
df_2023 = df_2023.dropna()

# MySQL 데이터베이스에 연결
db = mysql.connector.connect(
    host="",
    user="",
    password="",
    database=""
)

cursor = db.cursor()

# 테이블 생성 (이미 존재하는 경우 생략 가능)
cursor.execute("""
    CREATE TABLE IF NOT EXISTS standardized_rate (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sigungu VARCHAR(255),
        standardized_rate FLOAT
    )
""")

# 데이터 삽입
for _, row in df_2023.iterrows():
    cursor.execute("""
        INSERT INTO standardized_rate (sigungu, standardized_rate)
        VALUES (%s, %s)
    """, (row['시군구'], row['표준화율']))

# 변경사항 커밋
db.commit()

# 연결 종료
cursor.close()
db.close()
