// HelioCore AI - Frontend Application
// Логіка взаємодії з сервером та оновлення інтерфейсу

// ТУТ ТРЕБА ПІДКЛЮЧИТИ API
// Базовий URL для API запитів
const API_BASE_URL = '';

// Інтервал автооновлення (2 секунди)
const UPDATE_INTERVAL = 2000;

// DOM елементи
const elements = {
  // Статус підключення
  connectionStatus: document.getElementById('connectionStatus'),
  lastUpdate: document.getElementById('lastUpdate'),
  
  // Банер статусу
  statusBanner: document.getElementById('statusBanner'),
  statusIcon: document.getElementById('statusIcon'),
  statusLabel: document.getElementById('statusLabel'),
  statusDescription: document.getElementById('statusDescription'),
  
  // Метрики
  batteryValue: document.getElementById('batteryValue'),
  batteryProgress: document.getElementById('batteryProgress'),
  voltageValue: document.getElementById('voltageValue'),
  voltageGauge: document.getElementById('voltageGauge'),
  lightValue: document.getElementById('lightValue'),
  lightFill: document.getElementById('lightFill'),
  
  // Статус кільце
  statusRingProgress: document.getElementById('statusRingProgress'),
  statusEmoji: document.getElementById('statusEmoji'),
  statusMain: document.getElementById('statusMain'),
  statusSub: document.getElementById('statusSub'),
  
  // AI рекомендації
  recommendationsList: document.getElementById('recommendationsList'),
  
  // Toast контейнер
  toastContainer: document.getElementById('toastContainer')
};

// Стан додатку
let isConnected = true;
let updateTimer = null;

// ТУТ ТРЕБА ПІДКЛЮЧИТИ API
// Функція для отримання даних з сервера
async function fetchData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/data`);
    
    if (!response.ok) {
      throw new Error('Помилка отримання даних');
    }
    
    const result = await response.json();
    
    if (result.success) {
      updateUI(result.data);
      setConnectionStatus(true);
    } else {
      throw new Error(result.error || 'Невідома помилка');
    }
  } catch (error) {
    console.error('Помилка завантаження даних:', error);
    setConnectionStatus(false);
  }
}

// Оновлення статусу підключення
function setConnectionStatus(connected) {
  isConnected = connected;
  
  if (connected) {
    elements.connectionStatus.classList.remove('disconnected');
    elements.connectionStatus.querySelector('.status-text').textContent = 'Підключено';
    elements.lastUpdate.textContent = new Date().toLocaleTimeString('uk-UA');
  } else {
    elements.connectionStatus.classList.add('disconnected');
    elements.connectionStatus.querySelector('.status-text').textContent = 'Відключено';
  }
}

// Оновлення інтерфейсу
function updateUI(data) {
  // Оновлення батареї
  updateBattery(data.battery);
  
  // Оновлення напруги
  updateVoltage(data.voltage);
  
  // Оновлення освітлення
  updateLight(data.light);
  
  // Оновлення статусу
  updateStatus(data.status, data.battery);
  
  // Оновлення AI рекомендацій
  updateRecommendations(data.recommendations);
  
  // Оновлення банера статусу
  updateStatusBanner(data.status);
}

// Оновлення показника батареї
function updateBattery(battery) {
  elements.batteryValue.textContent = battery;
  elements.batteryProgress.style.width = `${battery}%`;
  
  // Зміна кольору в залежності від рівня
  elements.batteryProgress.classList.remove('low', 'medium');
  
  if (battery < 20) {
    elements.batteryProgress.classList.add('low');
  } else if (battery < 50) {
    elements.batteryProgress.classList.add('medium');
  }
}

// Оновлення показника напруги
function updateVoltage(voltage) {
  elements.voltageValue.textContent = voltage.toFixed(1);
  
  // Позиція індикатора (від 8V до 14V)
  const minV = 8;
  const maxV = 14;
  const percentage = ((voltage - minV) / (maxV - minV)) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  elements.voltageGauge.style.left = `calc(${clampedPercentage}% - 10px)`;
}

// Оновлення показника освітлення
function updateLight(light) {
  elements.lightValue.textContent = light;
  
  // Максимальне значення освітлення для індикатора
  const maxLight = 1000;
  const percentage = (light / maxLight) * 100;
  const clampedPercentage = Math.min(100, percentage);
  
  elements.lightFill.style.width = `${clampedPercentage}%`;
}

// Оновлення статусу системи
function updateStatus(status, battery) {
  // Оновлення кільцевого індикатора
  const circumference = 283; // 2 * π * 45
  const progress = (battery / 100) * circumference;
  elements.statusRingProgress.style.strokeDashoffset = circumference - progress;
  elements.statusRingProgress.style.stroke = status.color;
  
  // Оновлення емодзі
  const statusEmojis = {
    critical: '🔴',
    warning: '🟡',
    normal: '🔵',
    optimal: '🟢'
  };
  elements.statusEmoji.textContent = statusEmojis[status.status] || '⚡';
  
  // Оновлення тексту
  elements.statusMain.textContent = status.label;
  elements.statusMain.style.color = status.color;
  
  const statusDescriptions = {
    critical: 'Потребує уваги',
    warning: 'Моніторинг активний',
    normal: 'Працює стабільно',
    optimal: 'Максимальна ефективність'
  };
  elements.statusSub.textContent = statusDescriptions[status.status] || 'Очікування...';
}

// Оновлення банера статусу
function updateStatusBanner(status) {
  // Очищення попередніх класів
  elements.statusBanner.classList.remove('critical', 'warning', 'optimal');
  
  // Додавання нового класу
  if (status.status !== 'normal') {
    elements.statusBanner.classList.add(status.status);
  }
  
  // Оновлення іконки
  const bannerIcons = {
    critical: '🚨',
    warning: '⚠️',
    normal: '✅',
    optimal: '🌟'
  };
  elements.statusIcon.textContent = bannerIcons[status.status] || '●';
  elements.statusIcon.style.color = status.color;
  
  // Оновлення тексту
  elements.statusLabel.textContent = `Статус: ${status.label}`;
  elements.statusLabel.style.color = status.color;
  
  const descriptions = {
    critical: 'Система потребує негайної уваги! Перевірте показники.',
    warning: 'Деякі показники вимагають уваги. Рекомендовано перевірку.',
    normal: 'Система працює в нормальному режимі.',
    optimal: 'Всі системи працюють на максимальній ефективності!'
  };
  elements.statusDescription.textContent = descriptions[status.status] || 'Очікування даних з сервера';
}

// ТУТ AI АНАЛІЗ
// Оновлення AI рекомендацій
function updateRecommendations(recommendations) {
  if (!recommendations || recommendations.length === 0) {
    elements.recommendationsList.innerHTML = `
      <div class="recommendation-card info">
        <div class="rec-icon">📊</div>
        <div class="rec-content">
          <p>Аналіз даних у процесі...</p>
        </div>
      </div>
    `;
    return;
  }
  
  const html = recommendations.map(rec => `
    <div class="recommendation-card ${rec.type}">
      <div class="rec-icon">${rec.icon}</div>
      <div class="rec-content">
        <p>${rec.message}</p>
      </div>
    </div>
  `).join('');
  
  elements.recommendationsList.innerHTML = html;
}

// Показ toast повідомлення
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
    <span class="toast-message">${message}</span>
  `;
  
  elements.toastContainer.appendChild(toast);
  
  // Автоматичне видалення через 3 секунди
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ТУТ ТРЕБА ПІДКЛЮЧИТИ API
// Відправка команди керування
async function sendControlCommand(action) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(result.message, 'success');
      
      // Оновлення стану кнопки
      const button = document.querySelector(`[data-action="${action}"]`);
      if (button) {
        button.classList.toggle('active');
        const statusEl = button.querySelector('.btn-status');
        if (statusEl) {
          statusEl.textContent = button.classList.contains('active') ? 'Активно' : 'Вимкнено';
        }
      }
    } else {
      showToast(result.error || 'Помилка виконання команди', 'error');
    }
  } catch (error) {
    console.error('Помилка відправки команди:', error);
    showToast('Помилка звязку з сервером', 'error');
  }
}

// Ініціалізація обробників подій
function initEventListeners() {
  // Кнопки керування
  const controlButtons = document.querySelectorAll('.control-btn');
  controlButtons.forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action) {
        sendControlCommand(action);
      }
    });
  });
}

// Запуск автооновлення
function startAutoUpdate() {
  // Перше завантаження
  fetchData();
  
  // Автооновлення кожні 2 секунди
  updateTimer = setInterval(fetchData, UPDATE_INTERVAL);
}

// Зупинка автооновлення
function stopAutoUpdate() {
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
  }
}

// Ініціалізація додатку
function init() {
  console.log('HelioCore AI - Ініціалізація...');
  
  initEventListeners();
  startAutoUpdate();
  
  // Зупинка оновлення при втраті фокусу вікна (опціонально)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoUpdate();
    } else {
      startAutoUpdate();
    }
  });
  
  console.log('HelioCore AI - Готово до роботи!');
}

// Запуск при завантаженні сторінки
document.addEventListener('DOMContentLoaded', init);
