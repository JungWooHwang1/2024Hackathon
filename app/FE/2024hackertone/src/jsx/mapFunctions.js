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
    return d3.geoMercator()
        .center([initialX, initialY])
        .scale(initialScale)
        .translate([width / 2, height / 2]);
}

async function updateMapWithIncome(target, region) {
    const url = `http://3.36.50.178:5003/average-income/${encodeURIComponent(region)}`;
    console.log('Fetching data from URL:', url);

    try {
        const response = await fetch(url);
        const textResponse = await response.text();
        console.log('Server response:', textResponse);

        const incomeData = JSON.parse(textResponse);
        
        const maxIncome = Math.max(...incomeData.map(d => d.average_income_price));
        const minIncome = Math.min(...incomeData.map(d => d.average_income_price));

        const colorScale = d3.scaleLinear()
            .domain([minIncome, maxIncome])
            .range(["#d4e157", "#1b5e20"]);

        d3.select(target).selectAll('path')
            .data(incomeData, d => d.sigungu_nm)
            .join('path')
            .attr('d', d => geoPath()(d))
            .attr('fill', d => colorScale(d.average_income_price))
            .attr('stroke', '#000')
            .attr('stroke-width', '1.5')
            .append('title')
            .text(d => `${d.sigungu_nm}: ${d.average_income_price}`);
    } catch (error) {
        console.error('Error fetching or processing income data:', error);
    }
}

export function drawSeoulMap(handleRegionClick, setTopIncomeRegions) {
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

    d3.json('/seoul.geojson').then(json => {
        console.log('Seoul JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('서울특별시 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                const maxIncome = Math.max(...Object.values(incomeMap));
                const minIncome = Math.min(...Object.values(incomeMap));

                const colorScale = d3.scaleLinear()
                    .domain([minIncome, maxIncome])
                    .range(["#e0f7fa", "#004d40"]);

                states.selectAll('path')
                    .data(json.features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('id', d => `path-${d.properties.SIG_KOR_NM || 'unknown'}`)
                    .attr('fill', d => {
                        const key = d.properties.SIG_KOR_NM.trim();
                        const income = incomeMap[key];
                        console.log(`SIG_KOR_NM: ${d.properties.SIG_KOR_NM}, Key: ${key}, Income: ${income}`);
                        return income !== undefined ? colorScale(income) : '#585858';
                    })
                    .attr('stroke', '#000')
                    .attr('stroke-width', '1.5')
                    .on('mouseenter', function (event, d) {
                        d3.select(this).raise().transition().duration(200).attr('transform', 'scale(1.05)');
                    })
                    .on('mouseleave', function (event, d) {
                        d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
                    })
                    .on('click', function (event, d) {
                        const regionName = d.properties.SIG_KOR_NM;
                        console.log(`${regionName} clicked`);
                        handleRegionClick(regionName);

                        // 서울 특별시 내에서 소득 상위 10개 지역 설정
                        const seoulIncomeData = incomeData.filter(item => item.sigungu_nm.includes('서울특별시'));
                        const sortedIncomeData = seoulIncomeData
                            .map(item => ({
                                name: item.sigungu_nm.replace('서울특별시 ', '').trim(),
                                income: item.average_income_price
                            }))
                            .sort((a, b) => b.income - a.income)
                            .slice(0, 10);

                        setTopIncomeRegions(sortedIncomeData);
                    })
                    .append('title')
                    .text(d => `${d.properties.SIG_KOR_NM}: ${incomeMap[d.properties.SIG_KOR_NM.trim()] || 'No data'}`);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}


export function drawGyeonggiMap(handleRegionClick, setTopIncomeRegions) {
    console.log('Drawing Gyeonggi map');

    const width = 600;
    const height = 600;
    const initialScale = 15000;
    const initialX = 127.5183;
    const initialY = 37.4138;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/gyeonggi.geojson').then(json => {
        console.log('Gyeonggi JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('경기도 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                const maxIncome = Math.max(...Object.values(incomeMap));
                const minIncome = Math.min(...Object.values(incomeMap));

                const colorScale = d3.scaleLinear()
                    .domain([minIncome, maxIncome])
                    .range(["#e0f7fa", "#004d40"]);

                states.selectAll('path')
                    .data(json.features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('id', d => `path-${d.properties.SIG_KOR_NM || 'unknown'}`)
                    .attr('fill', d => {
                        const key = d.properties.SIG_KOR_NM.trim();
                        const income = incomeMap[key];
                        console.log(`SIG_KOR_NM: ${d.properties.SIG_KOR_NM}, Key: ${key}, Income: ${income}`);
                        return income !== undefined ? colorScale(income) : '#585858';
                    })
                    .attr('stroke', '#000')
                    .attr('stroke-width', '1.5')
                    .on('mouseenter', function (event, d) {
                        d3.select(this).raise().transition().duration(200).attr('transform', 'scale(1.05)');
                    })
                    .on('mouseleave', function (event, d) {
                        d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
                    })
                    .on('click', function (event, d) {
                        const regionName = d.properties.SIG_KOR_NM;
                        console.log(`${regionName} clicked`);
                        handleRegionClick(regionName);

                        // 경기도 내에서 소득 상위 10개 지역 설정
                        const gyeonggiIncomeData = incomeData.filter(item => item.sigungu_nm.includes('경기도'));
                        const sortedIncomeData = gyeonggiIncomeData
                            .map(item => ({
                                name: item.sigungu_nm.replace('경기도 ', '').trim(),
                                income: item.average_income_price
                            }))
                            .sort((a, b) => b.income - a.income)
                            .slice(0, 10);

                        setTopIncomeRegions(sortedIncomeData);
                    })
                    .append('title')
                    .text(d => `${d.properties.SIG_KOR_NM}: ${incomeMap[d.properties.SIG_KOR_NM.trim()] || 'No data'}`);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}

export function drawIncheonMap(handleRegionClick, setTopIncomeRegions) {
    console.log('Drawing Incheon map');
    const width = 640;
    const height = 534;
    const initialScale = 20000;
    const initialX = 126.7052;
    const initialY = 37.4563;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/incheon.geojson').then(json => {
        console.log('Incheon JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('인천광역시 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                const maxIncome = Math.max(...Object.values(incomeMap));
                const minIncome = Math.min(...Object.values(incomeMap));

                const colorScale = d3.scaleLinear()
                    .domain([minIncome, maxIncome])
                    .range(["#e0f7fa", "#004d40"]);

                states.selectAll('path')
                    .data(json.features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('id', d => `path-${d.properties.SIG_KOR_NM || 'unknown'}`)
                    .attr('fill', d => {
                        const key = d.properties.SIG_KOR_NM.trim();
                        const income = incomeMap[key];
                        console.log(`SIG_KOR_NM: ${d.properties.SIG_KOR_NM}, Key: ${key}, Income: ${income}`);
                        return income !== undefined ? colorScale(income) : '#585858';
                    })
                    .attr('stroke', '#000')
                    .attr('stroke-width', '1.5')
                    .on('mouseenter', function (event, d) {
                        d3.select(this).raise().transition().duration(200).attr('transform', 'scale(1.05)');
                    })
                    .on('mouseleave', function (event, d) {
                        d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
                    })
                    .on('click', function (event, d) {
                        const regionName = d.properties.SIG_KOR_NM;
                        console.log(`${regionName} clicked`);
                        handleRegionClick(regionName);

                        // 인천 광역시 내에서 소득 상위 10개 지역 설정
                        const incheonIncomeData = incomeData.filter(item => item.sigungu_nm.includes('인천광역시'));
                        const sortedIncomeData = incheonIncomeData
                            .map(item => ({
                                name: item.sigungu_nm.replace('인천광역시 ', '').trim(),
                                income: item.average_income_price
                            }))
                            .sort((a, b) => b.income - a.income)
                            .slice(0, 10);

                        setTopIncomeRegions(sortedIncomeData);
                    })
                    .append('title')
                    .text(d => `${d.properties.SIG_KOR_NM}: ${incomeMap[d.properties.SIG_KOR_NM.trim()] || 'No data'}`);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}


export function drawGangwonMap(handleRegionClick, setTopIncomeRegions) {
    console.log('Drawing Gangwon map');
    const width = 640;
    const height = 534;
    const initialScale = 20000;
    const initialX = 128.1555;
    const initialY = 37.8228;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/gangwon.geojson').then(json => {
        console.log('Gangwon JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('강원도 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                const maxIncome = Math.max(...Object.values(incomeMap));
                const minIncome = Math.min(...Object.values(incomeMap));

                const colorScale = d3.scaleLinear()
                    .domain([minIncome, maxIncome])
                    .range(["#e0f7fa", "#004d40"]);

                states.selectAll('path')
                    .data(json.features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('id', d => `path-${d.properties.adm_nm || 'unknown'}`)
                    .attr('fill', d => {
                        const key = d.properties.adm_nm.trim();
                        const income = incomeMap[key];
                        console.log(`adm_nm: ${d.properties.adm_nm}, Key: ${key}, Income: ${income}`);
                        return income !== undefined ? colorScale(income) : '#585858';
                    })
                    .attr('stroke', '#000')
                    .attr('stroke-width', '1.5')
                    .on('mouseenter', function (event, d) {
                        d3.select(this).raise().transition().duration(200).attr('transform', 'scale(1.05)');
                    })
                    .on('mouseleave', function (event, d) {
                        d3.select(this).transition().duration(200).attr('transform', 'scale(1)');
                    })
                    .on('click', function (event, d) {
                        const regionName = d.properties.adm_nm;
                        console.log(`${regionName} clicked`);
                        handleRegionClick(regionName);

                        // 강원도 내에서 소득 상위 10개 지역 설정
                        const gangwonIncomeData = incomeData.filter(item => item.sigungu_nm.includes('강원도'));
                        const sortedIncomeData = gangwonIncomeData
                            .map(item => ({
                                name: item.sigungu_nm.replace('강원도 ', '').trim(),
                                income: item.average_income_price
                            }))
                            .sort((a, b) => b.income - a.income)
                            .slice(0, 10);

                        setTopIncomeRegions(sortedIncomeData);
                    })
                    .append('title')
                    .text(d => `${d.properties.adm_nm}: ${incomeMap[d.properties.adm_nm.trim()] || 'No data'}`);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}

// Add the rest of the map functions

export function drawChungnamMap() {
    console.log('Drawing Chungnam map');

    const width = 440;
    const height = 534;
    const initialScale = 14000;
    const initialX = 126.8320;
    const initialY = 36.5184;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/chungnam.geojson').then(json => {
        console.log('Chungnam JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('충청남도 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                updateMapWithIncome(states, path, json, incomeMap);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}

export function drawChungbukMap() {
    console.log('Drawing Chungbuk map');

    const width = 200;
    const height = 534;
    const initialScale = 16000;
    const initialX = 127.4914;
    const initialY = 36.6356;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/chungbuk.geojson').then(json => {
        console.log('Chungbuk JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('충청북도 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                updateMapWithIncome(states, path, json, incomeMap);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}

export function drawJeonnamMap() {
    console.log('Drawing Jeonnam map');

    const width = 740;
    const height = 534;
    const initialScale = 12000;
    const initialX = 127.5183;
    const initialY = 34.8679;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/jeonnam.geojson').then(json => {
        console.log('Jeonnam JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('전라남도 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                updateMapWithIncome(states, path, json, incomeMap);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}

export function drawJeonbukMap() {
    console.log('Drawing Jeonbuk map');

    const width = 450;
    const height = 500;
    const initialScale = 15000;
    const initialX = 127.1088;
    const initialY = 35.7175;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/jeonbuk.geojson').then(json => {
        console.log('Jeonbuk JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('전라북도 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                updateMapWithIncome(states, path, json, incomeMap);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}

export function drawGyeongbukMap() {
    console.log('Drawing Gyeongbuk map');

    const width = 400;
    const height = 444;
    const initialScale = 13000;
    const initialX = 128.6018;
    const initialY = 36.5759;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/gyeongbuk.geojson').then(json => {
        console.log('Gyeongbuk JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('경상북도 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                updateMapWithIncome(states, path, json, incomeMap);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}

export function drawGyeongnamMap() {
    console.log('Drawing Gyeongnam map');

    const width = 350;
    const height = 500;
    const initialScale = 15000;
    const initialX = 128.2141;
    const initialY = 35.2371;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/gyeongnam.geojson').then(json => {
        console.log('Gyeongnam JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('경상남도 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                updateMapWithIncome(states, path, json, incomeMap);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}

export function drawJejuMap() {
    console.log('Drawing Jeju map');

    const width = 440;
    const height = 370;
    const initialScale = 27000;
    const initialX = 126.5312;
    const initialY = 33.4996;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/jeju.geojson').then(json => {
        console.log('Jeju JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('제주특별자치도 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                updateMapWithIncome(states, path, json, incomeMap);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}

export function drawBusanMap() {
    console.log('Drawing Busan map');

    const width = 440;
    const height = 534;
    const initialScale = 40000;
    const initialX = 129.0756;
    const initialY = 35.1796;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/busan.geojson').then(json => {
        console.log('Busan JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('부산광역시 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                updateMapWithIncome(states, path, json, incomeMap);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}

export function drawUlsanMap() {
    console.log('Drawing Ulsan map');

    const width = 540;
    const height = 534;
    const initialScale = 40000;
    const initialX = 129.3114;
    const initialY = 35.5384;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/ulsan.geojson').then(json => {
        console.log('Ulsan JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('울산광역시 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                updateMapWithIncome(states, path, json, incomeMap);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}

export function drawDaeguMap() {
    console.log('Drawing Daegu map');

    const width = 490;
    const height = 434;
    const initialScale = 50000;
    const initialX = 128.6018;
    const initialY = 35.8714;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/daegu.geojson').then(json => {
        console.log('Daegu JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('대구광역시 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                updateMapWithIncome(states, path, json, incomeMap);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}

export function drawDaejeonMap() {
    console.log('Drawing Daejeon map');

    const width = 440;
    const height = 490;
    const initialScale = 60000;
    const initialX = 127.3845;
    const initialY = 36.3504;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/daejeon.geojson').then(json => {
        console.log('Daejeon JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('대전광역시 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                updateMapWithIncome(states, path, json, incomeMap);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}

export function drawGwangjuMap() {
    console.log('Drawing Gwangju map');

    const width = 440;
    const height = 534;
    const initialScale = 53000;
    const initialX = 126.8514;
    const initialY = 35.1595;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/gwangju.geojson').then(json => {
        console.log('Gwangju JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('광주광역시 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                updateMapWithIncome(states, path, json, incomeMap);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}

export function drawSejongMap() {
    console.log('Drawing Sejong map');

    const width = 440;
    const height = 734;
    const initialScale = 50000;
    const initialX = 127.2890;
    const initialY = 36.4800;

    const projection = createProjection(width, height, initialX, initialY, initialScale);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select('.mini_map')
        .select('svg');

    const states = svg.select('#states');

    states.selectAll('path').remove();
    states.selectAll('text').remove();

    d3.json('/sejong.geojson').then(json => {
        console.log('Sejong JSON data loaded:', json);

        fetch('http://3.36.50.178:5003/average-income')
            .then(response => response.json())
            .then(incomeData => {
                const incomeMap = incomeData.reduce((acc, item) => {
                    const key = item.sigungu_nm.replace('세종특별자치시 ', '').trim();
                    acc[key] = item.average_income_price;
                    return acc;
                }, {});

                console.log('Income Map:', incomeMap);

                updateMapWithIncome(states, path, json, incomeMap);
            })
            .catch(error => {
                console.error('Error fetching income data:', error);
            });
    }).catch(error => {
        console.error('Error loading or parsing geojson data:', error);
    });
}