from flask import Flask, jsonify
import mysql.connector

app = Flask(__name__)

def get_db_connection():
    return mysql.connector.connect(
        host="cbydatabase.cr4ge84cgeks.ap-northeast-2.rds.amazonaws.com",
        user="admin",
        password="12341234",
        database="CBY_Database"
    )

@app.route('/average-income', methods=['GET'])
def get_average_income():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM average_income")
    rows = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(rows)

@app.route('/stress-data', methods=['GET'])
def get_stress_data():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM stress_data")
    rows = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(rows)

<<<<<<< HEAD
if __name__ == '__main__':    
=======
    if response.status_code == 200:
        try:
            data = response.json()
            items = data.get('response', {}).get('body', {}).get('items', [])
            filtered_items = []

            for item in items:
                if item.get('lowrnkZnCd') == lowrnkZnCd:
                    filtered_items.append({
                        "일자": item.get('dt'),
                        "지역명": region_codes.get(znCd, "Unknown Region") + " " + subregion_codes.get(lowrnkZnCd, "Unknown Subregion"),
                        "질병명": disease_codes.get(dissCd, "Unknown Disease"),
                        "예측진료건수": item.get('cnt'),
                        "예측위험도": item.get('risk'),
                        "위험도지침": item.get('dissRiskXpln')
                    })

            return jsonify(filtered_items)

        except json.JSONDecodeError:
            return jsonify({"error": "JSON 디코딩 오류가 발생했습니다."}), 500
    else:
        return jsonify({"error": f"요청 실패: 상태 코드 {response.status_code}"}), response.status_code

if __name__ == '__main__':
>>>>>>> 47ad0b68a44d0fc2445b0d363f91ca2705edc86e
    app.run(debug=True, host="0.0.0.0", port="5003")
