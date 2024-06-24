import * as d3 from 'd3';
import { geoMercator, geoPath } from 'd3-geo';

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

function createProjection(width, height, initialX, initialY, initialScale) {
    return geoMercator()
        .center([initialX, initialY])
        .scale(initialScale)
        .translate([width / 2, height / 2]);
}

export function drawSeoulMap() {
    console.log('Drawing Seoul map');

    const width = 440;
    const height = 534;
    const initialScale = 55000;
    const initialX = 126.9780;
    const initialY = 37.5665;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('seoul.geojson').then(json => {
        console.log('Seoul JSON data loaded:', json);

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
                    .text(d.properties.name_ko || d.properties.name_eng);
            })
            .on('mouseleave', function(event, d) {
                d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
                states.select(`#label-${d.properties.name_eng || 'unknown'}`).remove();
            });
    }).catch(error => {
        console.error('Error loading or parsing data:', error);
    });
}

export function drawGyeonggiMap() {
    console.log('Drawing Gyeonggi map');

    const width = 440;
    const height = 534;
    const initialScale = 30000;
    const initialX = 127.5183;
    const initialY = 37.4138;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('gyeonggi.geojson').then(json => {
        console.log('Gyeonggi JSON data loaded:', json);

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
                    .text(d.properties.name_ko || d.properties.name_eng);
            })
            .on('mouseleave', function(event, d) {
                d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
                states.select(`#label-${d.properties.name_eng || 'unknown'}`).remove();
            });
    }).catch(error => {
        console.error('Error loading or parsing data:', error);
    });
}

export function drawIncheonMap() {
    console.log('Drawing Incheon map');

    const width = 440;
    const height = 534;
    const initialScale = 30000;
    const initialX = 126.7052;
    const initialY = 37.4563;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('incheon.geojson').then(json => {
        console.log('Incheon JSON data loaded:', json);

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
                    .text(d.properties.name_ko || d.properties.name_eng);
            })
            .on('mouseleave', function(event, d) {
                d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
                states.select(`#label-${d.properties.name_eng || 'unknown'}`).remove();
            });
    }).catch(error => {
        console.error('Error loading or parsing data:', error);
    });
}

export function drawGangwonMap() {
    console.log('Drawing Gangwon map');

    const width = 440;
    const height = 534;
    const initialScale = 30000;
    const initialX = 128.1555;
    const initialY = 37.8228;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('gangwon.geojson').then(json => {
        console.log('Gangwon JSON data loaded:', json);

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
                    .text(d.properties.name_ko || d.properties.name_eng);
            })
            .on('mouseleave', function(event, d) {
                d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
                states.select(`#label-${d.properties.name_eng || 'unknown'}`).remove();
            });
    }).catch(error => {
        console.error('Error loading or parsing data:', error);
    });
}

export function drawChungnamMap() {
    console.log('Drawing Chungnam map');

    const width = 440;
    const height = 534;
    const initialScale = 30000;
    const initialX = 126.8320;
    const initialY = 36.5184;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('chungnam.geojson').then(json => {
        console.log('Chungnam JSON data loaded:', json);

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
                    .text(d.properties.name_ko || d.properties.name_eng);
            })
            .on('mouseleave', function(event, d) {
                d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
                states.select(`#label-${d.properties.name_eng || 'unknown'}`).remove();
            });
    }).catch(error => {
        console.error('Error loading or parsing data:', error);
    });
}
