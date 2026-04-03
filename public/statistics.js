// HelioCore AI - Statistics & Analytics JavaScript

// State
let currentTimeRange = 'day';
let currentPage = 1;
const itemsPerPage = 10;
let historyData = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeStatistics();
  setupEventListeners();
  startRealTimeUpdates();
});

function initializeStatistics() {
  updateLastUpdate();
  generateMockData();
  updateQuickStats();
  generateEnergyChart();
  generateBatteryChart();
  generateVoltageChart();
  generateLightChart();
  updatePerformanceMetrics();
  generateEvents();
  generateHistoryTable();
  animateOnLoad();
}

function setupEventListeners() {
  // Time range buttons
  document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTimeRange = btn.dataset.range;
      refreshData();
    });
  });

  // Chart type buttons
  document.querySelectorAll('.chart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.chart-actions');
      parent.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Redraw chart with new type
      generateEnergyChart(btn.dataset.type);
    });
  });

  // Export button
  document.getElementById('exportData')?.addEventListener('click', exportData);

  // Pagination
  document.getElementById('prevPage')?.addEventListener('click', () => changePage(-1));
  document.getElementById('nextPage')?.addEventListener('click', () => changePage(1));
}

function generateMockData() {
  const now = new Date();
  historyData = [];
  
  for (let i = 0; i < 100; i++) {
    const date = new Date(now - i * 3600000); // hourly data
    historyData.push({
      timestamp: date,
      battery: Math.floor(Math.random() * 40 + 60),
      voltage: (Math.random() * 2 + 11).toFixed(2),
      light: Math.floor(Math.random() * 800 + 100),
      generation: (Math.random() * 200 + 50).toFixed(1),
      consumption: (Math.random() * 150 + 30).toFixed(1),
      status: ['optimal', 'normal', 'warning'][Math.floor(Math.random() * 3)]
    });
  }
}

function updateLastUpdate() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('uk-UA');
  document.getElementById('lastUpdate').textContent = timeStr;
}

function updateQuickStats() {
  const multiplier = getTimeRangeMultiplier();
  
  animateValue('totalEnergy', 0, Math.floor(247 * multiplier), 1500, 'kWh');
  animateValue('totalSavings', 0, Math.floor(1847 * multiplier), 1500, 'UAH');
  animateValue('avgEfficiency', 0, 87 + Math.floor(Math.random() * 10), 1500, '%');
  animateValue('co2Saved', 0, Math.floor(124 * multiplier), 1500, 'kg');
  animateValue('systemUptime', 0, 99.9, 1500, '%');
  animateValue('chargeCycles', 0, Math.floor(247 * multiplier / 10), 1500, '');
}

function getTimeRangeMultiplier() {
  switch (currentTimeRange) {
    case 'day': return 1;
    case 'week': return 7;
    case 'month': return 30;
    case 'year': return 365;
    default: return 1;
  }
}

function animateValue(elementId, start, end, duration, suffix = '') {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const startTime = performance.now();
  const isFloat = end % 1 !== 0;
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * easeProgress;
    
    element.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

function generateEnergyChart(type = 'bar') {
  const chart = document.getElementById('energyChart');
  const labels = document.getElementById('energyLabels');
  if (!chart || !labels) return;
  
  const hours = currentTimeRange === 'day' ? 24 : 
                currentTimeRange === 'week' ? 7 : 
                currentTimeRange === 'month' ? 30 : 12;
  
  const data = [];
  for (let i = 0; i < hours; i++) {
    data.push({
      value: Math.random() * 150 + 50,
      consumption: Math.random() * 100 + 30
    });
  }
  
  // Calculate stats
  const values = data.map(d => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const total = values.reduce((a, b) => a + b, 0);
  
  document.getElementById('maxGeneration').textContent = max.toFixed(1) + ' Wh';
  document.getElementById('minGeneration').textContent = min.toFixed(1) + ' Wh';
  document.getElementById('avgGeneration').textContent = avg.toFixed(1) + ' Wh';
  document.getElementById('totalGenerationChart').textContent = (total / 1000).toFixed(2) + ' kWh';
  
  chart.innerHTML = '';
  data.forEach((item, index) => {
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = `${(item.value / max) * 100}%`;
    bar.setAttribute('data-value', item.value.toFixed(1) + ' Wh');
    bar.style.animationDelay = `${index * 30}ms`;
    chart.appendChild(bar);
  });
  
  // Generate labels
  labels.innerHTML = '';
  const labelCount = Math.min(hours, 12);
  const step = Math.ceil(hours / labelCount);
  for (let i = 0; i < hours; i += step) {
    const span = document.createElement('span');
    if (currentTimeRange === 'day') {
      span.textContent = `${i}:00`;
    } else if (currentTimeRange === 'week') {
      const days = ['Nd', 'Pn', 'Vt', 'Sr', 'Ct', 'Pt', 'Sb'];
      span.textContent = days[i % 7];
    } else if (currentTimeRange === 'month') {
      span.textContent = `${i + 1}`;
    } else {
      const months = ['Sich', 'Lyut', 'Ber', 'Kvit', 'Trav', 'Cherv', 'Lyp', 'Serp', 'Ver', 'Zhovt', 'Lyst', 'Hrud'];
      span.textContent = months[i];
    }
    labels.appendChild(span);
  }
}

function generateBatteryChart() {
  const chart = document.getElementById('batteryHistoryChart');
  if (!chart) return;
  
  chart.innerHTML = '';
  const dataPoints = 48;
  
  for (let i = 0; i < dataPoints; i++) {
    const bar = document.createElement('div');
    bar.className = 'battery-bar';
    const height = 40 + Math.random() * 60;
    bar.style.height = `${height}%`;
    bar.style.opacity = 0.5 + (i / dataPoints) * 0.5;
    chart.appendChild(bar);
  }
  
  // Update ring values
  updateRing('batteryHealthRing', 98);
  updateRing('batteryCapacityRing', 95);
  updateRing('batteryEfficiencyRing', 92);
}

function updateRing(elementId, percentage) {
  const ring = document.getElementById(elementId);
  if (!ring) return;
  
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (percentage / 100) * circumference;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = offset;
}

function generateVoltageChart() {
  const chart = document.getElementById('voltageHistoryChart');
  if (!chart) return;
  
  chart.innerHTML = '';
  const dataPoints = 60;
  
  for (let i = 0; i < dataPoints; i++) {
    const point = document.createElement('div');
    point.className = 'voltage-point';
    const height = 30 + Math.random() * 40;
    point.style.height = `${height}%`;
    chart.appendChild(point);
  }
  
  // Update gauge
  const voltage = 12.4;
  const needle = document.getElementById('voltageNeedle');
  if (needle) {
    const angle = ((voltage - 8) / 8) * 180 - 90;
    needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
  }
  
  document.getElementById('currentVoltage').textContent = voltage + 'V';
}

function generateLightChart() {
  const chart = document.getElementById('lightIntensityChart');
  if (!chart) return;
  
  chart.innerHTML = '';
  const dataPoints = 48;
  
  for (let i = 0; i < dataPoints; i++) {
    const bar = document.createElement('div');
    bar.className = 'light-bar';
    // Simulate day/night cycle
    const hour = (i / 2) % 24;
    let height;
    if (hour >= 6 && hour <= 18) {
      height = 20 + Math.sin((hour - 6) / 12 * Math.PI) * 80;
    } else {
      height = 5 + Math.random() * 10;
    }
    bar.style.height = `${height}%`;
    chart.appendChild(bar);
  }
  
  // Update stats
  document.getElementById('currentLight').textContent = Math.floor(Math.random() * 400 + 600);
  document.getElementById('sunnyHours').textContent = (4 + Math.random() * 4).toFixed(1) + 'h';
  document.getElementById('cloudyHours').textContent = (1 + Math.random() * 3).toFixed(1) + 'h';
  document.getElementById('darkHours').textContent = (14 + Math.random() * 2).toFixed(1) + 'h';
}

function updatePerformanceMetrics() {
  const metrics = [
    { bar: 'utilizationBar', value: 'utilizationRate', percent: 87.4 },
    { bar: 'conversionBar', value: 'conversionRate', percent: 92.1 },
    { bar: 'reliabilityBar', value: 'reliabilityRate', percent: 99.2 },
    { bar: 'qualityBar', value: 'powerQuality', percent: 95.8 }
  ];
  
  metrics.forEach(metric => {
    const bar = document.getElementById(metric.bar);
    const value = document.getElementById(metric.value);
    if (bar) bar.style.width = `${metric.percent}%`;
    if (value) value.textContent = metric.percent + '%';
  });
}

function generateEvents() {
  const eventsList = document.getElementById('eventsList');
  if (!eventsList) return;
  
  const events = [
    { type: 'success', icon: '✓', title: 'Systema zapushchena', time: '2 khvylyny tomu' },
    { type: 'info', icon: 'i', title: 'Onovlennya danykh', time: '5 khvylyn tomu' },
    { type: 'success', icon: '⚡', title: 'Batareya povnistyu zaryadzhen', time: '1 hodyna tomu' },
    { type: 'warning', icon: '!', title: 'Nyzka osvitlenist', time: '3 hodyny tomu' },
    { type: 'info', icon: 'i', title: 'Kalibratsiyu datchykiv zaversheno', time: '6 hodyn tomu' },
    { type: 'success', icon: '✓', title: 'Zvyazok vidnovleno', time: '12 hodyn tomu' }
  ];
  
  eventsList.innerHTML = events.map(event => `
    <div class="event-item">
      <div class="event-icon ${event.type}">${event.icon}</div>
      <div class="event-content">
        <div class="event-title">${event.title}</div>
        <div class="event-time">${event.time}</div>
      </div>
    </div>
  `).join('');
}

function generateHistoryTable() {
  const tbody = document.getElementById('historyTableBody');
  if (!tbody) return;
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = historyData.slice(startIndex, endIndex);
  
  tbody.innerHTML = pageData.map(item => `
    <tr>
      <td>${item.timestamp.toLocaleString('uk-UA')}</td>
      <td>${item.battery}%</td>
      <td>${item.voltage}V</td>
      <td>${item.light} lux</td>
      <td>${item.generation} Wh</td>
      <td>${item.consumption} Wh</td>
      <td><span class="status-badge ${item.status}">${getStatusLabel(item.status)}</span></td>
    </tr>
  `).join('');
  
  // Update pagination
  const totalPages = Math.ceil(historyData.length / itemsPerPage);
  document.getElementById('currentPage').textContent = currentPage;
  document.getElementById('totalPages').textContent = totalPages;
}

function getStatusLabel(status) {
  const labels = {
    optimal: 'Optymalno',
    normal: 'Normalno',
    warning: 'Uvaha',
    critical: 'Krytychno'
  };
  return labels[status] || status;
}

function changePage(direction) {
  const totalPages = Math.ceil(historyData.length / itemsPerPage);
  currentPage = Math.max(1, Math.min(totalPages, currentPage + direction));
  generateHistoryTable();
}

function exportData() {
  const exportObj = {
    exportDate: new Date().toISOString(),
    timeRange: currentTimeRange,
    quickStats: {
      totalEnergy: document.getElementById('totalEnergy')?.textContent,
      totalSavings: document.getElementById('totalSavings')?.textContent,
      avgEfficiency: document.getElementById('avgEfficiency')?.textContent,
      co2Saved: document.getElementById('co2Saved')?.textContent
    },
    historyData: historyData.slice(0, 50)
  };
  
  const dataStr = JSON.stringify(exportObj, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `heliocore_statistics_${Date.now()}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

function refreshData() {
  generateMockData();
  updateQuickStats();
  generateEnergyChart();
  generateBatteryChart();
  generateVoltageChart();
  generateLightChart();
  currentPage = 1;
  generateHistoryTable();
}

function startRealTimeUpdates() {
  setInterval(() => {
    updateLastUpdate();
    
    // Randomly update some values
    if (Math.random() > 0.5) {
      const light = Math.floor(Math.random() * 400 + 600);
      document.getElementById('currentLight').textContent = light;
    }
  }, 5000);
}

function animateOnLoad() {
  const elements = document.querySelectorAll('.quick-stat-card, .chart-section, .analytics-card, .health-card');
  elements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    setTimeout(() => {
      el.style.transition = 'all 0.5s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, index * 50);
  });
}
