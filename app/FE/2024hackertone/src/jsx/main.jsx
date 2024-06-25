import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { geoMercator, geoPath } from 'd3-geo';
import { zoom } from 'd3-zoom';
import "../css/main.css";
import {
    drawSeoulMap,
    drawGyeonggiMap,
    drawIncheonMap,
    drawGangwonMap,
    drawChungnamMap,
    drawChungbukMap,
    drawJeonnamMap,
    drawJeonbukMap,
    drawGyeongbukMap,
    drawGyeongnamMap,
    drawJejuMap,
    drawBusanMap,
    drawUlsanMap,
    drawDaeguMap,
    drawDaejeonMap,
    drawGwangjuMap,
    drawSejongMap
} from './mapFunctions';
import StressDepressionChart from './StressDepressionChart';

const colorMapping = {
    'seoul': '#FADADD',
    'busan': '#FFDAB9',
    'daegu': '#FFFFE0',
    'incheon': '#98FB98',
    'gwangju': '#E0FFFF',
    'daejeon': '#E6E6FA',
    'ulsan': '#FFE4E1',
    'sejong': '#ADD8E6',
    'gyeonggi-do': '#D8BFD8',
    'gangwon-do': '#DDA0DD',
    'chungcheongbuk-do': '#B0E0E6',
    'chungcheongnam-do': '#EEE8AA',
    'jeollabuk-do': '#F0FFF0',
    'jeollanam-do': '#F08080',
    'gyeongsangbuk-do': '#FFA07A',
    'gyeongsangnam-do': '#FFFACD',
    'jeju-do': '#F5FFFA'
};

const normalizeRegionForComparison = (name) => {
    const cleanedName = name.replace(/^(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|제주특별자치도|경기도|강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도)\s*/, '').replace(/(시|군|구)$/, '').trim().toLowerCase().replace(/\s+/g, '').replace(/[^가-힣a-z0-9]/g, '');
    console.log(`Original name: ${name}, Cleaned name: ${cleanedName}`);
    return cleanedName;
};

const Main = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [chartData, setChartData] = useState({});
    const [topIncomeRegions, setTopIncomeRegions] = useState([]);

    useEffect(() => {
        console.log('Component mounted');
        drawMap('.mini_map', handleRegionClick, setTopIncomeRegions);
    }, []);

    const handleRegionClick = async (region) => {
        console.log(`Fetching data for region: ${region}`);
        const normalizedRegion = normalizeRegionForComparison(region);
        console.log(`Normalized region: ${normalizedRegion}`);
        
        try {
            const stressResponse = await fetch('http://3.36.50.178:5003/stress-data');
            const stressResult = await stressResponse.json();
            const normalizedStressResult = stressResult.map(item => ({
                ...item,
                normalizedRegion: normalizeRegionForComparison(item.region)
            }));
            const stress = normalizedStressResult.find(item => item.normalizedRegion === normalizedRegion)?.standard_rate_2023 || null;
    
            console.log(`Stress data: ${JSON.stringify(normalizedStressResult)}`);
            console.log(`Found stress value: ${stress}`);
    
            const depressionResponse = await fetch('http://3.36.50.178:5003/depression-data');
            const depressionResult = await depressionResponse.json();
            const normalizedDepressionResult = depressionResult.map(item => ({
                ...item,
                normalizedRegion: normalizeRegionForComparison(item.region)
            }));
            const depression = normalizedDepressionResult.find(item => item.normalizedRegion === normalizedRegion)?.standard_rate_2023 || null;
    
            const degressiveResponse = await fetch('http://3.36.50.178:5003/degressive-data');
            const degressiveResult = await degressiveResponse.json();
            const normalizedDegressiveResult = degressiveResult.map(item => ({
                ...item,
                normalizedRegion: normalizeRegionForComparison(item.region)
            }));
            const degressive = normalizedDegressiveResult.find(item => item.normalizedRegion === normalizedRegion)?.standard_rate_2023 || null;
    
            console.log(`Data for ${region}:`, { stress, depression, degressive });
    
            setSelectedRegion(region);
            setChartData({
                stress,
                depression,
                degressive
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const splitTopIncomeRegions = () => {
        const halfwayIndex = Math.ceil(topIncomeRegions.length / 2);
        return [topIncomeRegions.slice(0, halfwayIndex), topIncomeRegions.slice(halfwayIndex)];
    };

    const [leftColumn, rightColumn] = splitTopIncomeRegions();

    return (
        <main className="container" style={{ backgroundColor: "gray" }}>
            <div className="header_text">Local Visualization</div>
            <div className="main_contents">
                <div className="mini_map"></div>
                <div className="dd">
                    <div className="danger_list">
                        <h2>Top 10 Average Incomes</h2>
                        <div className="danger_list_column">
                            <ul>
                                {leftColumn.map((region, index) => (
                                    <li key={index}>{region.name}: {region.income} 만원</li>
                                ))}
                            </ul>
                            <ul>
                                {rightColumn.map((region, index) => (
                                    <li key={index}>{region.name}: {region.income} 만원</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="local">
                        <div className="number_of_medical">
                            {selectedRegion}
                            {<StressDepressionChart
                                region={selectedRegion}
                                data={chartData}
                            />}
                        </div>
                        
                    </div>
                    
                </div>
            </div>
        </main>
    );
};

export default Main;

function drawMap(target, handleRegionClick, setTopIncomeRegions) {
    console.log('Drawing map in', target);

    d3.select(target).selectAll('svg').remove();

    const width = 440;
    const height = 534;
    const initialScale = 4440;
    const initialX = 127.7669;
    const initialY = 35.9078;

    const projection = geoMercator()
        .center([initialX, initialY])
        .scale(initialScale)
        .translate([width / 2, height / 2]);
    const path = geoPath().projection(projection);

    const svg = d3.select(target)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('id', 'map')
        .attr('class', 'map');

    const states = svg.append('g').attr('id', 'states');

    states.append('rect')
        .attr('class', 'background')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#2F2F2F'); // 배경 색상 설정

    d3.json('/korea.json').then(json => {
        console.log('JSON data loaded:', json);

        states.selectAll('path')
            .data(json.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('id', d => `path-${d.properties.name_eng || 'unknown'}`)
            .attr('fill', d => colorMapping[d.properties.name_eng?.toLowerCase() || 'unknown'] || '#585858')
            .attr('stroke', '#000')
            .attr('stroke-width', '1.5')
            .append('title')
            .text(d => d.properties.name);

        states.selectAll('path')
            .on('mouseenter', function (event, d) {
                d3.select(this).raise().transition().duration(200).attr('transform', 'scale(1.05)');
            })
            .on('mouseleave', function (event, d) {
                d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
            })
            .on('click', function (event, d) {
                const regionName = d.properties.name_eng?.toLowerCase();
                if (regionName === 'seoul') {
                    console.log('Seoul clicked');
                    drawSeoulMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'gyeonggi-do') {
                    console.log('Gyeonggi-do clicked');
                    drawGyeonggiMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'incheon') {
                    console.log('Incheon clicked');
                    drawIncheonMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'gangwon-do') {
                    console.log('Gangwon-do clicked');
                    drawGangwonMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'chungcheongnam-do') {
                    console.log('Chungcheongnam-do clicked');
                    drawChungnamMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'chungcheongbuk-do') {
                    console.log('Chungcheongbuk-do clicked');
                    drawChungbukMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'jeollanam-do') {
                    console.log('Jeonnam clicked');
                    drawJeonnamMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'jeollabuk-do') {
                    console.log('Jeonbuk clicked');
                    drawJeonbukMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'gyeongsangbuk-do') {
                    console.log('Gyeongsangbuk-do clicked');
                    drawGyeongbukMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'gyeongsangnam-do') {
                    console.log('Gyeongsangnam-do clicked');
                    drawGyeongnamMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'jeju-do') {
                    console.log('Jeju-do clicked');
                    drawJejuMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'busan') {
                    console.log('Busan clicked');
                    drawBusanMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'ulsan') {
                    console.log('Ulsan clicked');
                    drawUlsanMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'daegu') {
                    console.log('Daegu clicked');
                    drawDaeguMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'daejeon') {
                    console.log('Daejeon clicked');
                    drawDaejeonMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'gwangju') {
                    console.log('Gwangju clicked');
                    drawGwangjuMap(handleRegionClick, setTopIncomeRegions);
                } else if (regionName === 'sejong') {
                    console.log('Sejong clicked');
                    drawSejongMap(handleRegionClick, setTopIncomeRegions);
                }
            });
    }).catch(error => {
        console.error('Error loading or parsing data:', error);
    });

    const zoomBehavior = zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
            states.attr('transform', event.transform);
        });

    svg.call(zoomBehavior);
}

