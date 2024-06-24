import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { geoMercator, geoPath } from 'd3-geo';
import { zoom } from 'd3-zoom';
import "../css/main.css";

// 색상 매핑 객체
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

const Main = () => {
    useEffect(() => {
        console.log('Component mounted');
        drawMap('.mini_map');
    }, []); // 빈 배열을 의존성 배열로 설정하여 컴포넌트가 마운트될 때 한 번만 실행

    return (
        <main className="container" style={{ backgroundColor: "gray" }}>
            <div className="header_text">Disease Prediction</div>
            <div className="main_contents">
                <div className="mini_map"></div>    
                <div className="dd">
                    <div className="danger_list">danger_list</div>
                    <div className="local">
                        <div className="number_of_medical">number_of_medical</div>
                        <div className="chat_bot">chat_bot</div>
                    </div>
                    <div className="behavior">behavior</div>
                </div>
            </div>
        </main>
    );
};

export default Main;

// 지도 그리기 함수
function drawMap(target) {
    console.log('Drawing map in', target);

    // 기존 SVG 요소 제거
    d3.select(target).selectAll('svg').remove();

    const width = 440; // 지도의 넓이
    const height = 534; // 지도의 높이
    const initialScale = 4440; // 확대시킬 값
    const initialX = -9700; // 초기 위치값 X
    const initialY = 3250; // 초기 위치값 Y

    const projection = geoMercator()
        .scale(initialScale)
        .translate([initialX, initialY]);
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
        .attr('height', height);

    

    // geoJson 데이터를 파싱하여 지도 그리기
    d3.json('korea.json').then(json => {
        console.log('JSON data loaded:', json);

        states.selectAll('path') // 지역 설정
            .data(json.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('id', d => `path-${d.properties.name_eng}`)
            .attr('fill', d => colorMapping[d.properties.name_eng.toLowerCase()] || '#585858')
            .attr('stroke', '#000')
            .attr('stroke-width', '1.5')
            .on('mouseenter', function(event, d) {
                d3.select(this).raise().transition().duration(200).attr('transform', 'scale(1.05)');
                
                // 텍스트 추가
                states.append('text')
                    .attr('id', `label-${d.properties.name_eng}`)
                    .attr('transform', () => {
                        const [x, y] = path.centroid(d);
                        return `translate(${x}, ${y})`;
                    })
                    .attr('text-anchor', 'middle')
                    .attr('dy', '.35em')
                    .attr('fill', '#fff')
                    .text(d.properties.name);
            })
            .on('mouseleave', function(event, d) {
                d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
                
                // 텍스트 제거
                states.select(`#label-${d.properties.name_eng}`).remove();
            })
            .on('click', function(event, d) {
                if (d.properties.name_eng.toLowerCase() === 'seoul') {
                    drawSeoulMap();
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

// 서울 시군구 지도 그리기 함수
function drawSeoulMap() {
    console.log('Drawing Seoul map');

    const width = 440; // 지도의 넓이
    const height = 534; // 지도의 높이
    const initialScale = 10000; // 확대시킬 값
    const initialX = -9700; // 초기 위치값 X
    const initialY = 3250; // 초기 위치값 Y

    const projection = geoMercator()
        .scale(initialScale)
        .translate([initialX, initialY]);
    const path = geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    // 기존 시군구 지도 제거
    states.selectAll('path').remove();
    states.selectAll('text').remove();

    // 서울 시군구 geoJson 데이터를 파싱하여 지도 그리기
    d3.json('seoul.json').then(json => {
        console.log('Seoul JSON data loaded:', json);

        states.selectAll('path') // 시군구 설정
            .data(json.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('id', d => `path-${d.properties.name_eng}`)
            .attr('fill', d => colorMapping[d.properties.name_eng.toLowerCase()] || '#585858')
            .attr('stroke', '#000')
            .attr('stroke-width', '1.5')
            .on('mouseenter', function(event, d) {
                d3.select(this).raise().transition().duration(200).attr('transform', 'scale(1.05)');
                
                // 텍스트 추가
                states.append('text')
                    .attr('id', `label-${d.properties.name_eng}`)
                    .attr('transform', () => {
                        const [x, y] = path.centroid(d);
                        return `translate(${x}, ${y})`;
                    })
                    .attr('text-anchor', 'middle')
                    .attr('dy', '.35em')
                    .attr('fill', '#fff')
                    .text(d.properties.name);
            })
            .on('mouseleave', function(event, d) {
                d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
                
                // 텍스트 제거
                states.select(`#label-${d.properties.name_eng}`).remove();
            });
    }).catch(error => {
        console.error('Error loading or parsing data:', error);
    });
}
