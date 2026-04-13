document.addEventListener('DOMContentLoaded', () => {
    

    
    let fleetData = [];
    let charts = {};
    let currentView = 'grid'; 
    let scatterChartInstance = null;
    let radarChartInstance = null;


    const airlineSelect = document.getElementById('airline-select');
    const searchButton = document.getElementById('search-button');
    const dataDisplayContainer = document.getElementById('data-display-container');
    const sectionTitle = document.getElementById('section-title');
    

    const totalAircraftCountEl = document.getElementById('total-aircraft-count');
    const totalAirlineCountEl = document.getElementById('total-airline-count');
    const mostCommonModelEl = document.getElementById('most-common-model');
    const averageSeatCountEl = document.getElementById('average-seat-count');


    const modalOverlay = document.getElementById('details-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeModalButton = document.getElementById('close-modal-button');


    const gridViewBtn = document.getElementById('view-grid-btn');
    const listViewBtn = document.getElementById('view-list-btn');


    async function loadData() {
        try {
            const response = await fetch('data/havayolu_filo_veritabani.json');
            if (!response.ok) throw new Error(`HTTP hatası! Durum: ${response.status}`);
            fleetData = await response.json();
            initializeApp();
        } catch (error) {
            console.error("Veri yüklenirken bir hata oluştu:", error);
            dataDisplayContainer.innerHTML = `<p style="color: #e74c3c; padding: 2rem;">Veri yüklenemedi. 'data/havayolu_filo_veritabani.json' dosyasının doğru yerde olduğundan ve formatının geçerli olduğundan emin olun.</p>`;
        }
    }


    function initializeApp() {
        populateAirlineFilter();
        updateDashboard('Tümü'); 
        createMockOccupancyChart();      
        createClassOccupancyChart();     
        createEfficiencyPolarChart();    
        createRegionalOccupancyChart(); 
        createLoadFactorDoughnut();     
        createFleetAgeChart();     
        createFleetStatusChart();  
       




        searchButton.addEventListener('click', () => updateDashboard(airlineSelect.value));
        
        gridViewBtn.addEventListener('click', () => setView('grid'));
        listViewBtn.addEventListener('click', () => setView('list'));

        closeModalButton.addEventListener('click', () => modalOverlay.classList.remove('visible'));
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                modalOverlay.classList.remove('visible');
            }
        });
    }


    function setView(viewType) {
        currentView = viewType;
        gridViewBtn.classList.toggle('active', viewType === 'grid');
        listViewBtn.classList.toggle('active', viewType === 'list');
        updateDashboard(airlineSelect.value);
    }
    

    function populateAirlineFilter() {
        const airlines = [...new Set(fleetData.map(item => item['Havayolu Adı']))].sort();
        airlines.forEach(airline => {
            const option = document.createElement('option');
            option.value = airline;
            option.textContent = airline;
            airlineSelect.appendChild(option);
        });
    }


    function updateDashboard(selectedAirline) {
        const filteredData = (selectedAirline === 'Tümü') 
            ? fleetData 
            : fleetData.filter(item => item['Havayolu Adı'] === selectedAirline);
        
        sectionTitle.textContent = (selectedAirline === 'Tümü') 
            ? 'Tüm Filo Detayları' 
            : `${selectedAirline} - Filo Detayları`;

        if (currentView === 'grid') {
            updateCards(filteredData);
        } else {
            updateTable(filteredData);
        }
        
        updateStats(filteredData);
        updateAllCharts(filteredData);
    }


    //--------------------------------//
    // --- ARAYÜZ OLUŞTURMA FONKSİYONLARI ---
    //--------------------------------//

    // 6. Kart görünümünü oluştur
    function updateCards(data) {
        dataDisplayContainer.innerHTML = ''; 
        const cardsGrid = document.createElement('div');
        cardsGrid.className = 'cards-grid';

        if (data.length === 0) {
            cardsGrid.innerHTML = `<p>Gösterilecek veri bulunamadı.</p>`;
            dataDisplayContainer.appendChild(cardsGrid);
            return;
        }

        data.forEach(aircraft => {
            const card = document.createElement('div');
            card.className = 'aircraft-card';
            card.innerHTML = `
                <div class="card-header">
                    <h3>${aircraft['Uçak Tipi']}</h3>
                    <p>${aircraft['Havayolu Adı']}</p>
                </div>
                <div class="card-body">
                    <div class="card-stat"><h4>Adet</h4><p>${aircraft['Filodaki Adet']}</p></div>
                    <div class="card-stat"><h4>Koltuk</h4><p>${aircraft['Koltuk Sayısı'] || 'N/A'}</p></div>
                    <div class="card-stat"><h4>Menzil (km)</h4><p>${(aircraft['Menzil (km)'] || 0).toLocaleString('tr-TR')}</p></div>
                </div>`;
            card.addEventListener('click', () => showDetailsModal(aircraft));
            cardsGrid.appendChild(card);
        });
        dataDisplayContainer.appendChild(cardsGrid);
    }

    // 7. Tablo görünümünü oluştur
    function updateTable(data) {
        dataDisplayContainer.innerHTML = '';
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';

        const table = document.createElement('table');
        table.className = 'data-table'; 
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Havayolu</th>
                    <th>Uçak Tipi</th>
                    <th>Adet</th>
                    <th>Koltuk</th>
                    <th>Toplam Ekip</th> 
                    <th>Kanat Açıklığı (m)</th>
                </tr>
            </thead>
            <tbody id="fleet-table-body-inner"></tbody>`;

        const tableBody = table.querySelector('#fleet-table-body-inner');

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6">Gösterilecek veri bulunamadı.</td></tr>`; 
        } else {
            data.forEach(aircraft => {
                const row = document.createElement('tr');

                const toplamEkip = (aircraft['Pilot Sayısı'] || 0) + (aircraft['Kabin Ekibi Sayısı'] || 0);
                row.innerHTML = `
                    <td>${aircraft['Havayolu Adı']} (${aircraft['Havayolu Kodu']})</td>
                    <td>${aircraft['Uçak Tipi']}</td>
                    <td>${aircraft['Filodaki Adet']}</td>
                    <td>${aircraft['Koltuk Sayısı'] || 'N/A'}</td>
                    <td>${toplamEkip > 0 ? toplamEkip : 'N/A'}</td> 
                    <td>${aircraft['Kanat Açıklığı (m)'] || 'N/A'}</td>`;
                row.addEventListener('click', () => showDetailsModal(aircraft));
                tableBody.appendChild(row);
            });
        }
        
        tableContainer.appendChild(table);
        dataDisplayContainer.appendChild(tableContainer);
    }
    

    function showDetailsModal(aircraft) {
        modalTitle.textContent = `${aircraft['Uçak Tipi']} - Detaylar`;

        const sketchfabContainer = document.getElementById('sketchfab-container');
        const modelPath = aircraft['model_path'];

        if (modelPath) {
            const modelViewerHTML = `
                <model-viewer 
                    src="${modelPath}"
                    alt="3D model of ${aircraft['Uçak Tipi']}"
                    auto-rotate
                    camera-controls
                    style="width: 100%; height: 100%; background-color: #1f2937;">
                </model-viewer>`;
            sketchfabContainer.innerHTML = modelViewerHTML;
        } else {
            sketchfabContainer.innerHTML = `<div class="loading-message">Bu model için 3D görüntü mevcut değil.</div>`;
        }
        
        const detailsList = document.getElementById('details-list');
        detailsList.innerHTML = `
            <div class="detail-item"><span class="detail-label">Havayolu</span><span class="detail-value">${aircraft['Havayolu Adı']} (${aircraft['Havayolu Kodu']})</span></div>
            <div class="detail-item"><span class="detail-label">Filodaki Adet</span><span class="detail-value">${aircraft['Filodaki Adet']}</span></div>
            <div class="detail-item"><span class="detail-label">Koltuk Sayısı</span><span class="detail-value">${aircraft['Koltuk Sayısı'] || 'Bilgi Yok'}</span></div>
            <div class="detail-item"><span class="detail-label">Ekip</span><span class="detail-value">${aircraft['Pilot Sayısı'] || '?'} Pilot, ${aircraft['Kabin Ekibi Sayısı'] || '?'} Kabin</span></div>
            <div class="detail-item"><span class="detail-label">Kanat Açıklığı</span><span class="detail-value">${aircraft['Kanat Açıklığı (m)'] ? aircraft['Kanat Açıklığı (m)'] + ' m' : 'Bilgi Yok'}</span></div>
            <div class="detail-item"><span class="detail-label">Menzil (km)</span><span class="detail-value">${(aircraft['Menzil (km)'] || 0).toLocaleString('tr-TR')}</span></div>
            <div class="detail-item"><span class="detail-label">Maks. Kalkış Ağırlığı (kg)</span><span class="detail-value">${(aircraft['Maksimum Kalkış Ağırlığı (kg)'] || 0).toLocaleString('tr-TR')}</span></div>
        `;

        modalOverlay.classList.add('visible');
    }

    function updateStats(data) {
        const totalAircraft = data.reduce((sum, item) => sum + (item['Filodaki Adet'] || 0), 0);
        const totalAirlines = new Set(data.map(item => item['Havayolu Adı'])).size;
        const modelCounts = data.reduce((acc, item) => {
            acc[item['Uçak Tipi']] = (acc[item['Uçak Tipi']] || 0) + item['Filodaki Adet'];
            return acc;
        }, {});
        const mostCommonModel = Object.keys(modelCounts).reduce((a, b) => modelCounts[a] > modelCounts[b] ? a : b, '-');
        const totalSeats = data.reduce((sum, item) => sum + (item['Koltuk Sayısı'] || 0) * (item['Filodaki Adet'] || 0), 0);
        
        totalAircraftCountEl.textContent = totalAircraft > 0 ? totalAircraft.toLocaleString('tr-TR') : '0';
        totalAirlineCountEl.textContent = totalAirlines;
        mostCommonModelEl.textContent = data.length > 0 ? mostCommonModel : '-';
        averageSeatCountEl.textContent = totalAircraft > 0 ? (totalSeats / totalAircraft).toFixed(0) : '0';
    }


    function updateAllCharts(data) {
        createOrUpdateChart('fleetComposition', 'fleet-composition-chart', 'doughnut', {
            labels: data.map(item => item['Uçak Tipi']),
            datasets: [{ data: data.map(item => item['Filodaki Adet']), backgroundColor: ['#3498db', '#e74c3c', '#9b59b6', '#f1c40f', '#2ecc71', '#1abc9c', '#34495e', '#e67e22'], borderColor: '#2c3e50', borderWidth: 3 }]
        }, { legend: { position: 'right' } });

        createPerformanceScatterChart(data); 
        createTechRadarChart(data);


        const modelData = fleetData.reduce((acc, item) => {
            const model = item['Uçak Tipi'];

            acc[model] = (acc[model] || 0) + item['Filodaki Adet'];
            return acc;
        }, {});


        const sortedModels = Object.entries(modelData)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 20);

        createOrUpdateChart('manufacturer', 'manufacturer-chart', 'bar', {
            labels: sortedModels.map(item => item[0]), 
            datasets: [{
                label: 'Toplam Uçak Sayısı',
                data: sortedModels.map(item => item[1]), 
                backgroundColor: '#27ae60'
            }]
        }, { 
            legend: { display: false },
            scales: {
                x: {

                    ticks: {
                        autoSkip: false, 
                        maxRotation: 90, 
                        minRotation: 70
                    }
                }
            }
        });


        const sortedBySeats = [...data].sort((a, b) => (b['Koltuk Sayısı'] || 0) - (a['Koltuk Sayısı'] || 0)).slice(0, 15);
        createOrUpdateChart('seatCapacity', 'seat-capacity-chart', 'bar', {
            labels: sortedBySeats.map(item => item['Uçak Tipi']),
            datasets: [{ label: 'Koltuk Sayısı', data: sortedBySeats.map(item => item['Koltuk Sayısı']), backgroundColor: '#e67e22' }]
        }, { indexAxis: 'y', legend: { display: false } });


        const crewSeatData = data.map(item => ({
            x: (item['Pilot Sayısı'] || 0) + (item['Kabin Ekibi Sayısı'] || 0), 
            y: item['Koltuk Sayısı'],                                   
            r: Math.sqrt(item['Filodaki Adet']) * 2 + 4,                   
            model: item['Uçak Tipi'],
            count: item['Filodaki Adet']
        })).filter(item => item.x > 0 && item.y > 0); 

        createOrUpdateChart('rangeSeat', 'range-seat-chart', 'bubble', {
            datasets: [{
                label: 'Uçak Modelleri',
                data: crewSeatData,
                backgroundColor: 'rgba(155, 89, 182, 0.7)'
            }]
        }, {
            plugins: { 
                tooltip: { 
                    callbacks: { 
                        label: (c) => `${c.raw.model}: ${c.raw.count} adet, ${c.raw.y} koltuk, ${c.raw.x} kişilik ekip` 
                    } 
                } 
            },
            scales: { 
                x: { title: { display: true, text: 'Toplam Ekip Sayısı', color: '#ecf0f1' } }, 
                y: { title: { display: true, text: 'Koltuk Sayısı', color: '#ecf0f1' } } 
            }
        });

        const crewData = [...data]

            .filter(item => (item['Pilot Sayısı'] || 0) > 0)
            .sort((a, b) => (b['Koltuk Sayısı'] || 0) - (a['Koltuk Sayısı'] || 0))
            .slice(0, 15); 

        createOrUpdateChart('crewDistribution', 'crew-distribution-chart', 'bar', {
            labels: crewData.map(item => item['Uçak Tipi']),
            datasets: [
                {
                    label: 'Pilot Sayısı',
                    data: crewData.map(item => item['Pilot Sayısı']),
                    backgroundColor: '#3498db', 
                    borderColor: '#2980b9',
                    borderWidth: 1
                },
                {
                    label: 'Kabin Ekibi Sayısı',
                    data: crewData.map(item => item['Kabin Ekibi Sayısı']),
                    backgroundColor: '#e74c3c', 
                    borderColor: '#c0392b',
                    borderWidth: 1
                }
            ]
        }, {
            scales: {
                x: {
                    title: { display: true, text: 'Uçak Modelleri (Koltuk Sayısına Göre Sıralı)', color: '#ecf0f1' }
                },
                y: {
                    title: { display: true, text: 'Ekip Kişi Sayısı', color: '#ecf0f1' },
                    beginAtZero: true 
                }
            },
            plugins: {
                legend: {
                    position: 'top' 
                }
            }
        });        
    }


    function createOrUpdateChart(chartId, canvasId, type, data, customOptions = {}) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        if (charts[chartId]) charts[chartId].destroy();
        const defaultOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#ecf0f1' } } },
            scales: {
                x: { ticks: { color: '#ecf0f1' }, grid: { color: 'rgba(236, 240, 241, 0.1)' } },
                y: { ticks: { color: '#ecf0f1' }, grid: { color: 'rgba(236, 240, 241, 0.1)' } }
            }
        };
        const finalOptions = { ...defaultOptions, ...customOptions, plugins: { ...defaultOptions.plugins, ...customOptions.plugins }};
        charts[chartId] = new Chart(ctx, { type, data, options: finalOptions });
    }

    function createMockOccupancyChart() {
        const ctx = document.getElementById('occupancy-chart').getContext('2d');
        

        const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
        gradientFill.addColorStop(0, 'rgba(46, 204, 113, 0.6)'); 
        gradientFill.addColorStop(1, 'rgba(46, 204, 113, 0.0)'); 

        const labels = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haz', 'Tem', 'Ağu', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        

        const mockData = [78, 82, 75, 84, 88, 92, 95, 94, 89, 85, 80, 83];

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doluluk Oranı (%)',
                    data: mockData,
                    borderColor: '#2ecc71', 
                    backgroundColor: gradientFill, 
                    borderWidth: 3,
                    tension: 0.4, 
                    pointBackgroundColor: '#2c3e50', 
                    pointBorderColor: '#2ecc71', 
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    fill: true 
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false 
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(44, 62, 80, 0.9)',
                        titleColor: '#ecf0f1',
                        bodyColor: '#ecf0f1',
                        borderColor: '#2ecc71',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.parsed.y}% Doluluk`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#bdc3c7' },
                        grid: { display: false } 
                    },
                    y: {
                        min: 50, 
                        max: 100,
                        ticks: { color: '#bdc3c7', stepSize: 10 },
                        grid: { color: 'rgba(236, 240, 241, 0.05)' } 
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    function createClassOccupancyChart() {
        const ctx = document.getElementById('class-occupancy-chart').getContext('2d');
        

        const labels = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'C.tesi', 'Pazar'];

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Economy Class',
                        data: [88, 85, 82, 90, 95, 92, 89], 
                        backgroundColor: '#3498db', 
                        borderRadius: 4,
                    },
                    {
                        label: 'Business Class',
                        data: [65, 70, 60, 75, 80, 55, 60], 
                        backgroundColor: '#f1c40f', 
                        borderRadius: 4,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: false, 
                        ticks: { color: '#bdc3c7' },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: '#bdc3c7' },
                        grid: { color: 'rgba(236, 240, 241, 0.1)' },
                        title: { display: true, text: 'Doluluk %', color: '#bdc3c7' }
                    }
                },
                plugins: {
                    legend: { position: 'top', labels: { color: '#ecf0f1' } },
                    tooltip: { 
                        mode: 'index', 
                        intersect: false,
                        backgroundColor: 'rgba(44, 62, 80, 0.9)'
                    }
                }
            }
        });
    }


    function createEfficiencyPolarChart() {
        const ctx = document.getElementById('efficiency-polar-chart').getContext('2d');

        new Chart(ctx, {
            type: 'polarArea', 
            data: {
                labels: ['Boeing 737', 'Airbus A320', 'Boeing 787', 'Airbus A350', 'Embraer 190'],
                datasets: [{
                    label: 'Ortalama Doluluk (%)',
                    data: [92, 88, 85, 78, 95], 
                    backgroundColor: [
                        'rgba(231, 76, 60, 0.7)', 
                        'rgba(52, 152, 219, 0.7)', 
                        'rgba(46, 204, 113, 0.7)', 
                        'rgba(155, 89, 182, 0.7)', 
                        'rgba(241, 196, 15, 0.7)'  
                    ],
                    borderWidth: 1,
                    borderColor: '#2c3e50'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: { 
                        ticks: { display: false }, 
                        grid: { color: 'rgba(236, 240, 241, 0.1)' },
                        backdropColor: 'transparent'
                    }
                },
                plugins: {
                    legend: { position: 'right', labels: { color: '#ecf0f1' } }
                }
            }
        });
    }       

    function createRegionalOccupancyChart() {
        const ctx = document.getElementById('regional-occupancy-chart').getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Kuzey Amerika', 'Avrupa', 'Asya-Pasifik', 'Orta Doğu', 'İç Hatlar', 'Afrika'],
                datasets: [{
                    label: 'Ortalama Doluluk (%)',
                    data: [88, 92, 76, 81, 95, 70],
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.7)',  
                        'rgba(46, 204, 113, 0.7)',  
                        'rgba(155, 89, 182, 0.7)',  
                        'rgba(243, 156, 18, 0.7)',  
                        'rgba(231, 76, 60, 0.7)',   
                        'rgba(26, 188, 156, 0.7)'  
                    ],
                    borderColor: '#2c3e50',
                    borderWidth: 1,
                    barPercentage: 0.6 
                }]
            },
            options: {
                indexAxis: 'y', 
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(236, 240, 241, 0.1)' },
                        ticks: { color: '#bdc3c7' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#ecf0f1', font: { size: 12 } }
                    }
                },
                plugins: {
                    legend: { display: false }, 
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.parsed.x}% Doluluk`;
                            }
                        }
                    }
                }
            }
        });
    }

    function createLoadFactorDoughnut() {
        const ctx = document.getElementById('load-factor-doughnut').getContext('2d');

        new Chart(ctx, {
            type: 'doughnut',
            data: {

                labels: ['Kritik (<%60)', 'Normal (%60-85)', 'Yüksek (>%85)'],
                datasets: [{
                    data: [15, 45, 40], 
                    backgroundColor: [
                        '#c0392b', 
                        '#f39c12', 
                        '#27ae60'  
                    ],
                    borderColor: '#1f2937', 
                    borderWidth: 4,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%', 
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#ecf0f1', padding: 20 }
                    },
                    title: {
                        display: true,
                        text: 'Toplam Sefer Başarısı',
                        color: '#bdc3c7',
                        font: { size: 14, weight: 'normal' },
                        padding: { bottom: 10 }
                    }
                }
            }
        });
    }

    function createFleetAgeChart() {
        const ctx = document.getElementById('fleet-age-chart').getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['0-5 Yıl (Yeni)', '6-10 Yıl (Orta)', '11-15 Yıl (Deneyimli)', '15+ Yıl (Eski)'],
                datasets: [{
                    label: 'Uçak Sayısı',
                    data: [145, 120, 85, 45], 
                    backgroundColor: [
                        'rgba(46, 204, 113, 0.7)', 
                        'rgba(52, 152, 219, 0.7)', 
                        'rgba(243, 156, 18, 0.7)', 
                        'rgba(231, 76, 60, 0.7)'   
                    ],
                    borderColor: [
                        '#2ecc71',
                        '#3498db',
                        '#f39c12',
                        '#e74c3c'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { 
                        display: true, 
                        text: 'Ortalama Filo Yaşı: 7.4 Yıl', 
                        color: '#bdc3c7',
                        padding: { bottom: 20 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(236, 240, 241, 0.1)' },
                        ticks: { color: '#bdc3c7' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#ecf0f1' }
                    }
                }
            }
        });
    }

    function createFleetStatusChart() {
        const ctx = document.getElementById('fleet-status-chart').getContext('2d');

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Operasyonda (Aktif)', 'Bakımda (Hangar)', 'Park Halinde (Yedek)'],
                datasets: [{
                    data: [82, 12, 6], 
                    backgroundColor: [
                        '#27ae60', 
                        '#c0392b', 
                        '#7f8c8d'  
                    ],
                    borderWidth: 0, 
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%', 
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#ecf0f1', font: { size: 12 } }
                    },

                    title: {
                        display: true,
                        text: '%82 Aktiflik',
                        position: 'bottom',
                        color: '#27ae60',
                        font: { size: 16, weight: 'bold' }
                    }
                }
            }
        });
    }

    function createPerformanceScatterChart(data) {
        const ctx = document.getElementById('performance-scatter-chart').getContext('2d');


        if (scatterChartInstance) {
            scatterChartInstance.destroy();
        }

        const airbusData = data.filter(i => i['Uçak Tipi'].includes('Airbus')).map(i => ({ x: i['Maksimum Kalkış Ağırlığı (kg)'], y: i['Menzil (km)'], model: i['Uçak Tipi'] }));
        const boeingData = data.filter(i => i['Uçak Tipi'].includes('Boeing')).map(i => ({ x: i['Maksimum Kalkış Ağırlığı (kg)'], y: i['Menzil (km)'], model: i['Uçak Tipi'] }));
        const otherData = data.filter(i => !i['Uçak Tipi'].includes('Airbus') && !i['Uçak Tipi'].includes('Boeing')).map(i => ({ x: i['Maksimum Kalkış Ağırlığı (kg)'], y: i['Menzil (km)'], model: i['Uçak Tipi'] }));

        scatterChartInstance = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    { label: 'Airbus', data: airbusData, backgroundColor: 'rgba(52, 152, 219, 0.6)', borderColor: '#3498db' },
                    { label: 'Boeing', data: boeingData, backgroundColor: 'rgba(231, 76, 60, 0.6)', borderColor: '#c0392b' },
                    { label: 'Diğer', data: otherData, backgroundColor: 'rgba(241, 196, 15, 0.6)', borderColor: '#f39c12' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { 
                        type: 'linear', 
                        position: 'bottom',
                        title: { display: true, text: 'Kalkış Ağırlığı (kg)', color: '#bdc3c7' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: '#bdc3c7' }
                    },
                    y: { 
                        title: { display: true, text: 'Menzil (km)', color: '#bdc3c7' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: '#bdc3c7' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#ecf0f1' } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.raw.model}: ${context.raw.y}km / ${context.raw.x}kg`;
                            }
                        }
                    }
                }
            }
        });
    }


    function createTechRadarChart(data) {
        const ctx = document.getElementById('tech-radar-chart').getContext('2d');

        if (radarChartInstance) {
            radarChartInstance.destroy();
        }

        if (data.length === 0) return; 


        const avgSeat = data.reduce((s, i) => s + (i['Koltuk Sayısı'] || 0), 0) / data.length;
        const avgRange = data.reduce((s, i) => s + (i['Menzil (km)'] || 0), 0) / data.length;
        const avgWeight = data.reduce((s, i) => s + (i['Maksimum Kalkış Ağırlığı (kg)'] || 0), 0) / data.length;
        const avgWing = data.reduce((s, i) => s + (i['Kanat Açıklığı (m)'] || 0), 0) / data.length;

        radarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Kapasite', 'Menzil', 'Ağırlık', 'Boyut'],
                datasets: [{
                    label: 'Filo Ortalaması',
                    data: [(avgSeat/400)*100, (avgRange/15000)*100, (avgWeight/400000)*100, (avgWing/80)*100],
                    fill: true,
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    borderColor: '#2ecc71',
                    pointBackgroundColor: '#2ecc71'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#ecf0f1', font: { size: 12 } },
                        ticks: { display: false, backdropColor: 'transparent' },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    loadData();
});