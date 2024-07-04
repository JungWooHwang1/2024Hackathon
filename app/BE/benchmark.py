import requests
import time

def measure_response_times(url, num_requests=3):
    response_times = []

    for _ in range(num_requests):
        start_time = time.time()
        response = requests.get(url)
        
        if response.status_code == 200:
            try:
                response_time = response.json()['response_time']
            except ValueError:
                print(f"Error decoding JSON response from {url}: {response.text}")
                continue
        else:
            print(f"Request to {url} failed with status code {response.status_code}")
            continue
        
        response_times.append(response_time)
        time.sleep(1)  # 요청 간에 약간의 지연을 추가

    return response_times

url_with_redis = 'http://3.36.50.178:5003/average-income-redis'
url_without_redis = 'http://3.36.50.178:5003/average-income-no-redis'

times_with_redis = measure_response_times(url_with_redis)
times_without_redis = measure_response_times(url_without_redis)

print("Times with Redis:", times_with_redis)
print("Times without Redis:", times_without_redis)

# 데이터를 파일로 저장
with open('response_times.txt', 'w') as f:
    f.write(f"Times with Redis: {times_with_redis}\n")
    f.write(f"Times without Redis: {times_without_redis}\n")
