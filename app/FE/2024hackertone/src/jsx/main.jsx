import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { geoMercator, geoPath } from 'd3-geo';
import { zoom } from 'd3-zoom';
import "../css/main.css";
import { drawSeoulMap, drawGyeonggiMap, drawIncheonMap, drawGangwonMap, drawChungnamMap } from './mapFunctions';

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
    }, []);

    return (
        <main className="container" style={{ backgroundColor: "gray" }}>
            <div className="header_text">Disease Prediction</div>
            <div className="main_contents">
                <div className="mini_map"></div>    
                <div className="dd">
                    <div className="danger_list">danger_list</div>
                    <div className="local">
                        <div className="number_of_medical"></div>
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
        .attr('height', height);

    d3.json('korea.json').then(json => {
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
            .on('mouseenter', function(event, d) {
                d3.select(this).raise().transition().duration(200).attr('transform', 'scale(1.05)');
                states.append('text')
                    .attr('id', `label-${d.properties.name_eng || 'unknown'}`)
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
                states.select(`#label-${d.properties.name_eng || 'unknown'}`).remove();
            })
            .on('click', function(event, d) {
                if (d.properties.name_eng?.toLowerCase() === 'seoul') {
                    console.log('Seoul clicked');
                    drawSeoulMap();
                } else if (d.properties.name_eng?.toLowerCase() === 'gyeonggi-do') {
                    console.log('Gyeonggi-do clicked');
                    drawGyeonggiMap();
                } else if (d.properties.name_eng?.toLowerCase() === 'incheon') {
                    console.log('Incheon clicked');
                    drawIncheonMap();
                } else if (d.properties.name_eng?.toLowerCase() === 'gangwon-do') {
                    console.log('Gangwon-do clicked');
                    drawGangwonMap();
                } else if (d.properties.name_eng?.toLowerCase() === 'chungcheongnam-do') {
                    console.log('Chungcheongnam-do clicked');
                    drawChungnamMap();
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
