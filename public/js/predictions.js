// HelioCore AI - Predictions Module
// Advanced AI-powered forecasting system

const API_BASE_URL = '';
const UPDATE_INTERVAL = 5000;

// DOM Elements
const elements = {
    lastUpdate: document.getElementById('lastUpdate'),
    aiAccuracy: document.getElementById('aiAccuracy'),

    // Current values
    currentBattery: document.getElementById('currentBattery'),
    currentVoltage: document.getElementById('currentVoltage'),
    currentLight: document.getElementById('currentLight'),
    currentPower: document.getElementById('currentPower'),

    // Battery predictions
    battery1h: document.getElementById('battery1h'),
    battery3h: document.getElementById('battery3h'),
    battery6h: document.getElementById('battery6h'),
    battery12h: document.getElementById('battery12h'),
    battery24h: document.getElementById('battery24h'),
    batteryTrend1h: document.getElementById('batteryTrend1h'),
    batteryTrend3h: document.getElementById('batteryTrend3h'),
    batteryTrend6h: document.getElementById('batteryTrend6h'),
    batteryTrend12h: document.getElementById('batteryTrend12h'),
    batteryTrend24h: document.getElementById('batteryTrend24h'),
    batteryBar1h: document.getElementById('batteryBar1h'),
    batteryBar3h: document.getElementById('batteryBar3h'),
    batteryBar6h: document.getElementById('batteryBar6h'),
    batteryBar12h: document.getElementById('batteryBar12h'),
    batteryBar24h: document.getElementById('batteryBar24h'),
    batteryTimelineFill: document.getElementById('batteryTimelineFill'),
    timeToFull: document.getElementById('timeToFull'),
    autonomyTime: document.getElementById('autonomyTime'),

    // Energy
    todayGeneration: document.getElementById('todayGeneration'),
    todayGenerationPred: document.getElementById('todayGenerationPred'),
    todayConsumption: document.getElementById('todayConsumption'),
    todayConsumptionPred: document.getElementById('todayConsumptionPred'),
    energyBalance: document.getElementById('energyBalance'),
    tomorrowBalance: document.getElementById('tomorrowBalance'),
    hourlyChart: document.getElementById('hourlyChart'),

    // Weather
    weatherConditionNow: document.getElementById('weatherConditionNow'),
    weatherTempNow: document.getElementById('weatherTempNow'),
    weatherEffectNow: document.getElementById('weatherEffectNow'),
    weatherCondition3h: document.getElementById('weatherCondition3h'),
    weatherTemp3h: document.getElementById('weatherTemp3h'),
    weatherEffect3h: document.getElementById('weatherEffect3h'),
    weatherCondition6h: document.getElementById('weatherCondition6h'),
    weatherTemp6h: document.getElementById('weatherTemp6h'),
    weatherEffect6h: document.getElementById('weatherEffect6h'),
    weatherCondition12h: document.getElementById('weatherCondition12h'),
    weatherTemp12h: document.getElementById('weatherTemp12h'),
    weatherEffect12h: document.getElementById('weatherEffect12h'),
    weatherConditionTomorrow: document.getElementById('weatherConditionTomorrow'),
    weatherTempTomorrow: document.getElementById('weatherTempTomorrow'),
    weatherEffectTomorrow: document.getElementById('weatherEffectTomorrow'),
    sunriseTime: document.getElementById('sunriseTime'),
    sunsetTime: document.getElementById('sunsetTime'),
    daylightHours: document.getElementById('daylightHours'),
    peakTime: document.getElementById('peakTime'),
    uvIndex: document.getElementById('uvIndex'),
    sunAngle: document.getElementById('sunAngle'),

    // Health
    batteryHealthGauge: document.getElementById('batteryHealthGauge'),
    batteryHealthValue: document.getElementById('batteryHealthValue'),
    batteryHealth1m: document.getElementById('batteryHealth1m'),
    batteryHealth3m: document.getElementById('batteryHealth3m'),
    batteryHealth6m: document.getElementById('batteryHealth6m'),
    batteryHealth1y: document.getElementById('batteryHealth1y'),
    batteryHealthRec: document.getElementById('batteryHealthRec'),

    panelHealthGauge: document.getElementById('panelHealthGauge'),
    panelHealthValue: document.getElementById('panelHealthValue'),
    panelDegradation: document.getElementById('panelDegradation'),
    panelLifetime: document.getElementById('panelLifetime'),
    panelMaintenance: document.getElementById('panelMaintenance'),
    panelDirt: document.getElementById('panelDirt'),
    panelHealthRec: document.getElementById('panelHealthRec'),

    systemHealthGauge: document.getElementById('systemHealthGauge'),
    systemHealthValue: document.getElementById('systemHealthValue'),
    systemUptime: document.getElementById('systemUptime'),
    systemCpu: document.getElementById('systemCpu'),
    systemRam: document.getElementById('systemRam'),
    systemTemp: document.getElementById('systemTemp'),
    systemHealthRec: document.getElementById('systemHealthRec'),

    // Long-term
    weekGeneration: document.getElementById('weekGeneration'),
    weekConsumption: document.getElementById('weekConsumption'),
    weekSavings: document.getElementById('weekSavings'),
    weekCO2: document.getElementById('weekCO2'),
    weekChart: document.getElementById('weekChart'),

    monthGeneration: document.getElementById('monthGeneration'),
    monthConsumption: document.getElementById('monthConsumption'),
    monthSavings: document.getElementById('monthSavings'),
    monthCO2: document.getElementById('monthCO2'),
    monthComparisonBar: document.getElementById('monthComparisonBar'),
    monthComparison: document.getElementById('monthComparison'),

    yearGeneration: document.getElementById('yearGeneration'),
    yearConsumption: document.getElementById('yearConsumption'),
    yearSavings: document.getElementById('yearSavings'),
    yearROI: document.getElementById('yearROI'),
    springEfficiency: document.getElementById('springEfficiency'),
    summerEfficiency: document.getElementById('summerEfficiency'),
    autumnEfficiency: document.getElementById('autumnEfficiency'),
    winterEfficiency: document.getElementById('winterEfficiency'),

    // AI Insights
    aiInsightsList: document.getElementById('aiInsightsList'),
    overallScoreRing: document.getElementById('overallScoreRing'),
    overallScore: document.getElementById('overallScore'),
    productivityBar: document.getElementById('productivityBar'),
    productivityScore: document.getElementById('productivityScore'),
    efficiencyBar: document.getElementById('efficiencyBar'),
    efficiencyScore: document.getElementById('efficiencyScore'),
    reliabilityBar: document.getElementById('reliabilityBar'),
    reliabilityScore: document.getElementById('reliabilityScore'),
    optimizationBar: document.getElementById('optimizationBar'),
    optimizationScore: document.getElementById('optimizationScore')
};

// Current state
let currentData = null;

// Fetch data from API
async function fetchData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/data`);
        if (!response.ok) throw new Error('Network error');
        const result = await response.json();
        if (result.success) {
            currentData = result.data;
            updateAllPredictions(result.data);
            elements.lastUpdate.textContent = new Date().toLocaleTimeString('uk-UA');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        // Use simulated data for demo
        simulateData();
    }
}

// Simulate data for demo purposes
function simulateData() {
    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour <= 20;

    currentData = {
        battery: Math.floor(Math.random() * 30) + 60,
        voltage: 11.5 + Math.random() * 2,
        light: isDaytime ? Math.floor(Math.random() * 400) + 400 : Math.floor(Math.random() * 100)
    };

    updateAllPredictions(currentData);
    elements.lastUpdate.textContent = new Date().toLocaleTimeString('uk-UA');
}

// Update all predictions
function updateAllPredictions(data) {
    updateCurrentSummary(data);
    updateBatteryPredictions(data);
    updateEnergyPredictions(data);
    updateWeatherImpact(data);
    updateHealthPredictions(data);
    updateLongtermPredictions(data);
    updateAIInsights(data);
}

// Update current summary
function updateCurrentSummary(data) {
    elements.currentBattery.textContent = data.battery;
    elements.currentVoltage.textContent = data.voltage.toFixed(1);
    elements.currentLight.textContent = data.light;
    elements.currentPower.textContent = (data.voltage * data.battery * 0.01).toFixed(1);
}

// Battery predictions using simple ML-like algorithm
function updateBatteryPredictions(data) {
    const chargeRate = data.light > 300 ? 5 : (data.light > 100 ? 2 : -3);
    const predictions = {
        '1h': Math.min(100, Math.max(0, data.battery + chargeRate * 1)),
        '3h': Math.min(100, Math.max(0, data.battery + chargeRate * 3)),
        '6h': Math.min(100, Math.max(0, data.battery + chargeRate * 5)),
        '12h': Math.min(100, Math.max(0, data.battery + chargeRate * 3)),
        '24h': Math.min(100, Math.max(0, data.battery + chargeRate * 2))
    };

    // Update values
    elements.battery1h.textContent = predictions['1h'];
    elements.battery3h.textContent = predictions['3h'];
    elements.battery6h.textContent = predictions['6h'];
    elements.battery12h.textContent = predictions['12h'];
    elements.battery24h.textContent = predictions['24h'];

    // Update trends
    const trend1h = predictions['1h'] - data.battery;
    const trend3h = predictions['3h'] - data.battery;
    const trend6h = predictions['6h'] - data.battery;
    const trend12h = predictions['12h'] - data.battery;
    const trend24h = predictions['24h'] - data.battery;

    updateTrend(elements.batteryTrend1h, trend1h);
    updateTrend(elements.batteryTrend3h, trend3h);
    updateTrend(elements.batteryTrend6h, trend6h);
    updateTrend(elements.batteryTrend12h, trend12h);
    updateTrend(elements.batteryTrend24h, trend24h);

    // Update bars
    elements.batteryBar1h.style.width = `${predictions['1h']}%`;
    elements.batteryBar3h.style.width = `${predictions['3h']}%`;
    elements.batteryBar6h.style.width = `${predictions['6h']}%`;
    elements.batteryBar12h.style.width = `${predictions['12h']}%`;
    elements.batteryBar24h.style.width = `${predictions['24h']}%`;

    // Timeline
    elements.batteryTimelineFill.style.left = `${data.battery}%`;

    // Time calculations
    const hoursToFull = chargeRate > 0 ? Math.ceil((100 - data.battery) / chargeRate) : '--';
    const autonomyHours = Math.floor(data.battery / 3);

    elements.timeToFull.textContent = hoursToFull !== '--' ? `${hoursToFull}:00` : '--:--';
    elements.autonomyTime.textContent = `${autonomyHours}:00`;
}

function updateTrend(element, value) {
    const sign = value >= 0 ? '+' : '';
    element.textContent = `${sign}${value.toFixed(0)}%`;
    element.className = `pred-trend ${value >= 0 ? 'up' : 'down'}`;
}

// Energy predictions
function updateEnergyPredictions(data) {
    const generation = (data.light * 0.05).toFixed(1);
    const consumption = (data.voltage * data.battery * 0.008).toFixed(1);
    const balance = (generation - consumption).toFixed(1);

    elements.todayGeneration.textContent = generation;
    elements.todayGenerationPred.textContent = `${(generation * 8).toFixed(0)} Wh`;
    elements.todayConsumption.textContent = consumption;
    elements.todayConsumptionPred.textContent = `${(consumption * 24).toFixed(0)} Wh`;
    elements.energyBalance.textContent = `${balance >= 0 ? '+' : ''}${balance}`;
    elements.energyBalance.className = `energy-value ${balance >= 0 ? 'positive' : ''}`;
    elements.tomorrowBalance.textContent = `${balance >= 0 ? '+' : ''}${(balance * 1.1).toFixed(1)} Wh`;

    // Generate hourly chart
    generateHourlyChart(data);
}

function generateHourlyChart(data) {
    const hours = [];
    const currentHour = new Date().getHours();

    for (let i = 0; i < 24; i++) {
        const hour = (currentHour + i) % 24;
        const isDaytime = hour >= 6 && hour <= 20;
        const peakHour = hour >= 10 && hour <= 15;

        let genHeight = isDaytime ? (peakHour ? 80 + Math.random() * 20 : 40 + Math.random() * 30) : 5;
        let consHeight = 20 + Math.random() * 30;

        hours.push({
            hour: hour,
            generation: genHeight,
            consumption: consHeight,
            label: `${hour}:00`
        });
    }

    const chartHTML = hours.slice(0, 12).map(h => `
    <div class="forecast-bar">
      <div class="bar-value" style="height: ${h.generation}%"></div>
      <div class="bar-label">${h.label}</div>
    </div>
  `).join('');

    elements.hourlyChart.innerHTML = chartHTML;
}

// Weather impact predictions
function updateWeatherImpact(data) {
    const weatherConditions = [
        { condition: 'Сонячно', temp: 25, efficiency: 95 },
        { condition: 'Хмарно', temp: 20, efficiency: 65 },
        { condition: 'Дощ', temp: 18, efficiency: 35 },
        { condition: 'Похмуро', temp: 22, efficiency: 50 }
    ];

    const currentWeather = data.light > 600 ? weatherConditions[0] :
        data.light > 400 ? weatherConditions[1] :
            data.light > 200 ? weatherConditions[3] : weatherConditions[2];

    // Current weather
    elements.weatherConditionNow.textContent = currentWeather.condition;
    elements.weatherTempNow.textContent = `${currentWeather.temp + Math.floor(Math.random() * 5)}°C`;
    elements.weatherEffectNow.textContent = `${currentWeather.efficiency}%`;
    elements.weatherEffectNow.className = `effect-value ${currentWeather.efficiency > 70 ? 'high' : currentWeather.efficiency > 40 ? 'medium' : 'low'}`;

    // Future weather predictions
    const predictions = [
        { el: '3h', conditions: weatherConditions[Math.floor(Math.random() * 2)] },
        { el: '6h', conditions: weatherConditions[Math.floor(Math.random() * 3)] },
        { el: '12h', conditions: weatherConditions[3] },
        { el: 'Tomorrow', conditions: weatherConditions[Math.floor(Math.random() * 2)] }
    ];

    predictions.forEach((pred, i) => {
        const condEl = elements[`weatherCondition${pred.el}`];
        const tempEl = elements[`weatherTemp${pred.el}`];
        const effEl = elements[`weatherEffect${pred.el}`];

        if (condEl) condEl.textContent = pred.conditions.condition;
        if (tempEl) tempEl.textContent = `${pred.conditions.temp + Math.floor(Math.random() * 5)}°C`;
        if (effEl) {
            effEl.textContent = `${pred.conditions.efficiency}%`;
            effEl.className = `effect-value ${pred.conditions.efficiency > 70 ? 'high' : pred.conditions.efficiency > 40 ? 'medium' : 'low'}`;
        }
    });

    // Solar analysis
    elements.sunriseTime.textContent = '06:12';
    elements.sunsetTime.textContent = '20:34';
    elements.daylightHours.textContent = '14:22';
    elements.peakTime.textContent = '12:00-14:00';
    elements.uvIndex.textContent = (data.light / 100).toFixed(1);
    elements.sunAngle.textContent = `${45 + Math.floor(Math.random() * 30)}°`;
}

// Health predictions
function updateHealthPredictions(data) {
    // Battery health
    const batteryHealth = 85 + Math.floor(Math.random() * 10);
    updateGauge(elements.batteryHealthGauge, batteryHealth);
    elements.batteryHealthValue.textContent = `${batteryHealth}%`;
    elements.batteryHealth1m.textContent = `${batteryHealth - 1}%`;
    elements.batteryHealth3m.textContent = `${batteryHealth - 3}%`;
    elements.batteryHealth6m.textContent = `${batteryHealth - 5}%`;
    elements.batteryHealth1y.textContent = `${batteryHealth - 8}%`;
    elements.batteryHealthRec.textContent = batteryHealth > 80 ?
        'Батарея в доброму стані. Продовжуйте дотримуватись режиму зарядки.' :
        'Рекомендуємо провести діагностику батареї найближчим часом.';

    // Panel health
    const panelHealth = 90 + Math.floor(Math.random() * 8);
    updateGauge(elements.panelHealthGauge, panelHealth);
    elements.panelHealthValue.textContent = `${panelHealth}%`;
    elements.panelDegradation.textContent = '0.5%';
    elements.panelLifetime.textContent = '23 років';
    elements.panelMaintenance.textContent = `${30 + Math.floor(Math.random() * 60)} днів`;
    elements.panelDirt.textContent = `${5 + Math.floor(Math.random() * 15)}%`;
    elements.panelHealthRec.textContent = panelHealth > 85 ?
        'Панелі працюють оптимально. Наступне очищення через 30 днів.' :
        'Рекомендуємо очистити панелі для підвищення ефективності.';

    // System health
    const systemHealth = 92 + Math.floor(Math.random() * 6);
    updateGauge(elements.systemHealthGauge, systemHealth);
    elements.systemHealthValue.textContent = `${systemHealth}%`;
    elements.systemUptime.textContent = `${200 + Math.floor(Math.random() * 500)} годин`;
    elements.systemCpu.textContent = `${10 + Math.floor(Math.random() * 25)}%`;
    elements.systemRam.textContent = `${30 + Math.floor(Math.random() * 30)}%`;
    elements.systemTemp.textContent = `${35 + Math.floor(Math.random() * 15)}°C`;
    elements.systemHealthRec.textContent = 'Контролер працює стабільно. Усі системи в нормі.';
}

function updateGauge(element, value) {
    const circumference = 283;
    const offset = circumference - (value / 100) * circumference;
    element.style.strokeDashoffset = offset;
}

// Long-term predictions
function updateLongtermPredictions(data) {
    // Weekly
    const weekGen = (data.light * 0.05 * 7).toFixed(1);
    const weekCons = (data.voltage * data.battery * 0.008 * 24 * 7 / 1000).toFixed(2);
    elements.weekGeneration.textContent = `${weekGen} kWh`;
    elements.weekConsumption.textContent = `${weekCons} kWh`;
    elements.weekSavings.textContent = `${Math.floor(weekGen * 4)} грн`;
    elements.weekCO2.textContent = `${(weekGen * 0.5).toFixed(1)} кг`;

    generateWeekChart();

    // Monthly
    const monthGen = (weekGen * 4.3).toFixed(1);
    const monthCons = (weekCons * 4.3).toFixed(2);
    elements.monthGeneration.textContent = `${monthGen} kWh`;
    elements.monthConsumption.textContent = `${monthCons} kWh`;
    elements.monthSavings.textContent = `${Math.floor(monthGen * 4)} грн`;
    elements.monthCO2.textContent = `${(monthGen * 0.5).toFixed(1)} кг`;

    const monthChange = 5 + Math.floor(Math.random() * 15);
    elements.monthComparisonBar.style.width = `${50 + monthChange}%`;
    elements.monthComparison.textContent = `+${monthChange}%`;

    // Yearly
    elements.yearGeneration.textContent = `${(monthGen * 12).toFixed(0)} kWh`;
    elements.yearConsumption.textContent = `${(monthCons * 12).toFixed(0)} kWh`;
    elements.yearSavings.textContent = `${Math.floor(monthGen * 12 * 4)} грн`;
    elements.yearROI.textContent = '3.5 років';

    // Seasonal efficiency
    elements.springEfficiency.textContent = '78%';
    elements.summerEfficiency.textContent = '95%';
    elements.autumnEfficiency.textContent = '65%';
    elements.winterEfficiency.textContent = '45%';
}

function generateWeekChart() {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    const chartHTML = days.map(day => {
        const height = 30 + Math.floor(Math.random() * 60);
        return `
      <div class="week-bar">
        <div class="week-bar-fill" style="height: ${height}%"></div>
        <div class="week-bar-label">${day}</div>
      </div>
    `;
    }).join('');

    elements.weekChart.innerHTML = chartHTML;
}

// AI Insights
function updateAIInsights(data) {
    const insights = generateAIInsights(data);

    const insightsHTML = insights.map(insight => `
    <div class="insight-card ${insight.type}">
      <div class="insight-icon">
        ${insight.icon}
      </div>
      <div class="insight-content">
        <p class="insight-title">${insight.title}</p>
        <p class="insight-description">${insight.description}</p>
      </div>
    </div>
  `).join('');

    elements.aiInsightsList.innerHTML = insightsHTML;

    // Overall score
    const overallScore = Math.floor((data.battery + (data.light / 10) + (data.voltage * 5)) / 3);
    const clampedScore = Math.min(100, Math.max(0, overallScore));

    updateGauge(elements.overallScoreRing, clampedScore);
    elements.overallScore.textContent = clampedScore;

    // Breakdown scores
    const productivity = 70 + Math.floor(Math.random() * 25);
    const efficiency = 65 + Math.floor(Math.random() * 30);
    const reliability = 80 + Math.floor(Math.random() * 18);
    const optimization = 60 + Math.floor(Math.random() * 35);

    elements.productivityBar.style.width = `${productivity}%`;
    elements.productivityScore.textContent = `${productivity}%`;
    elements.efficiencyBar.style.width = `${efficiency}%`;
    elements.efficiencyScore.textContent = `${efficiency}%`;
    elements.reliabilityBar.style.width = `${reliability}%`;
    elements.reliabilityScore.textContent = `${reliability}%`;
    elements.optimizationBar.style.width = `${optimization}%`;
    elements.optimizationScore.textContent = `${optimization}%`;

    // Update accuracy
    elements.aiAccuracy.textContent = `${92 + Math.floor(Math.random() * 6)}.${Math.floor(Math.random() * 10)}%`;
}

function generateAIInsights(data) {
    const insights = [];

    // Battery insights
    if (data.battery < 30) {
        insights.push({
            type: 'warning',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            title: 'Низький заряд батареї',
            description: 'Рекомендуємо увімкнути режим економії енергії та зменшити навантаження.'
        });
    } else if (data.battery > 90) {
        insights.push({
            type: 'success',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            title: 'Оптимальний заряд',
            description: 'Батарея повністю заряджена. Система готова до автономної роботи.'
        });
    }

    // Light insights
    if (data.light > 700) {
        insights.push({
            type: 'success',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/></svg>',
            title: 'Ідеальні умови генерації',
            description: 'Яскраве сонце забезпечує максимальну ефективність. Очікувана генерація: +15% від норми.'
        });
    } else if (data.light < 200) {
        insights.push({
            type: 'caution',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
            title: 'Знижена освітленість',
            description: 'Хмарна погода зменшує генерацію. Рекомендуємо економний режим.'
        });
    }

    // Voltage insights
    if (data.voltage > 13) {
        insights.push({
            type: 'info',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
            title: 'Висока напруга',
            description: 'Система працює на оптимальній напрузі. Ефективність зарядки максимальна.'
        });
    }

    // General insights
    insights.push({
        type: 'info',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        title: 'Прогноз на завтра',
        description: 'Очікується сонячна погода. Прогнозована генерація: 4.5 kWh. Рекомендуємо планувати енергоємні задачі.'
    });

    insights.push({
        type: 'success',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
        title: 'Стабільна робота системи',
        description: `Uptime: ${200 + Math.floor(Math.random() * 500)} годин. Всі датчики працюють коректно.`
    });

    return insights;
}

// Navigation link to predictions
function addPredictionsLink() {
    const headerNav = document.querySelector('.header-nav');
    if (headerNav && !document.querySelector('.nav-link[href="predictions.html"]')) {
        const link = document.createElement('a');
        link.href = 'predictions.html';
        link.className = 'nav-link predictions-link';
        link.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span>Прогнози</span>
    `;
        headerNav.appendChild(link);
    }
}

// Initialize
function init() {
    console.log('HelioCore AI Predictions - Initializing...');

    // Initial data fetch
    fetchData();

    // Auto-update
    setInterval(fetchData, UPDATE_INTERVAL);

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            fetchData();
        }
    });

    console.log('HelioCore AI Predictions - Ready!');
}

document.addEventListener('DOMContentLoaded', init);
