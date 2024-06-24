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

if __name__ == '__main__':    
    app.run(debug=True, host="0.0.0.0", port="5003")
