import matplotlib.pyplot as plt

# 저장된 데이터 로드
with open('response_times.txt', 'r') as f:
    lines = f.readlines()

times_with_redis = eval(lines[0].split(": ")[1])
times_without_redis = eval(lines[1].split(": ")[1])

# 차트 그리기
plt.figure(figsize=(10, 5))
plt.plot(range(1, 4), times_with_redis, label='With Redis', marker='o')
plt.plot(range(1, 4), times_without_redis, label='Without Redis', marker='o')

plt.xlabel('Request Number')
plt.ylabel('Response Time (seconds)')
plt.title('Response Time Comparison: With Redis vs Without Redis')
plt.legend()
plt.grid(True)
plt.show()
