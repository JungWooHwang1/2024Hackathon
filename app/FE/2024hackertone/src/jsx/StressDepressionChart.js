import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const StressDepressionChart = ({ region, data }) => {
    const chartData = {
        labels: ['스트레스', '우울감', '우울증상'],
        datasets: [
            {
                label: `${region}의 2023년도 표준율 (%)`,
                data: [data.stress, data.depression, data.degressive],
                backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        scales: {
            y: {
                min: 0,
                max: 100,
                ticks: {
                    color: '#fff',
                    callback: function(value) {
                        return value + '%'; // y축 값에 %를 추가
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)',
                },
            },
            x: {
                ticks: {
                    color: '#fff',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)',
                },
            },
        },
        plugins: {
            legend: {
                labels: {
                    color: '#fff',
                },
            },
        },
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ width: '80%', maxWidth: '600px' }}>
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default StressDepressionChart;
