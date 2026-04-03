// HelioCore AI - Backend Server
// Усі роути та логіка в одному файлі

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// ТУТ ТРЕБА ПІДКЛЮЧИТИ POSTGRESQL
// const { Pool } = require('pg');
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false }
// });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ЦЕ ТЕСТОВІ ДАНІ ДЛЯ ІМІТАЦІЇ ESP32
// Ці дані імітують показники з реального пристрою ESP32
let testDataIndex = 0;
const testData = [
  { voltage: 12.5, battery: 85, light: 750, created_at: new Date() },
  { voltage: 12.3, battery: 78, light: 680, created_at: new Date() },
  { voltage: 11.8, battery: 65, light: 520, created_at: new Date() },
  { voltage: 11.2, battery: 45, light: 380, created_at: new Date() },
  { voltage: 10.8, battery: 32, light: 250, created_at: new Date() },
  { voltage: 10.2, battery: 18, light: 120, created_at: new Date() },
  { voltage: 12.8, battery: 92, light: 890, created_at: new Date() },
  { voltage: 13.1, battery: 98, light: 950, created_at: new Date() },
  { voltage: 11.5, battery: 55, light: 450, created_at: new Date() },
  { voltage: 10.5, battery: 25, light: 180, created_at: new Date() }
];

// Зберігаємо останні отримані дані
let latestData = testData[0];

// ТУТ AI АНАЛІЗ
// Функція аналізує показники та генерує рекомендації
function getAIRecommendations(data) {
  const recommendations = [];
  
  // Аналіз рівня батареї
  if (data.battery < 20) {
    recommendations.push({
      type: 'warning',
      icon: '⚡',
      message: 'Увімкнути режим економії енергії! Рівень батареї критично низький.'
    });
  } else if (data.battery < 40) {
    recommendations.push({
      type: 'caution',
      icon: '🔋',
      message: 'Рівень батареї знижується. Рекомендовано зменшити навантаження.'
    });
  } else if (data.battery > 90) {
    recommendations.push({
      type: 'success',
      icon: '✅',
      message: 'Батарея повністю заряджена. Система працює оптимально.'
    });
  }
  
  // Аналіз освітлення
  if (data.light < 200) {
    recommendations.push({
      type: 'warning',
      icon: '🌙',
      message: 'Недостатньо сонячної енергії. Зарядка призупинена.'
    });
  } else if (data.light < 400) {
    recommendations.push({
      type: 'caution',
      icon: '⛅',
      message: 'Хмарно. Зарядка відбувається повільно.'
    });
  } else if (data.light > 700) {
    recommendations.push({
      type: 'success',
      icon: '☀️',
      message: 'Відмінне освітлення! Максимальна ефективність зарядки.'
    });
  }
  
  // Аналіз напруги
  if (data.voltage < 10.5) {
    recommendations.push({
      type: 'warning',
      icon: '⚠️',
      message: 'Критично низька напруга! Перевірте підключення панелей.'
    });
  } else if (data.voltage > 13.0) {
    recommendations.push({
      type: 'success',
      icon: '🔌',
      message: 'Напруга в оптимальному діапазоні для швидкої зарядки.'
    });
  }
  
  // Якщо немає попереджень - все добре
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'info',
      icon: '📊',
      message: 'Система працює в нормальному режимі. Усі показники в нормі.'
    });
  }
  
  return recommendations;
}

// Визначення статусу системи
function getSystemStatus(data) {
  if (data.battery < 20 || data.voltage < 10.5) {
    return { status: 'critical', label: 'Критичний', color: '#ff4444' };
  } else if (data.battery < 40 || data.light < 300) {
    return { status: 'warning', label: 'Увага', color: '#ffaa00' };
  } else if (data.battery > 80 && data.light > 600) {
    return { status: 'optimal', label: 'Оптимальний', color: '#00ff88' };
  } else {
    return { status: 'normal', label: 'Нормальний', color: '#00d4ff' };
  }
}

// GET /api/data - Отримання останніх даних
// ТУТ ТРЕБА ПІДКЛЮЧИТИ API
app.get('/api/data', (req, res) => {
  // Для демонстрації циклічно змінюємо тестові дані
  testDataIndex = (testDataIndex + 1) % testData.length;
  latestData = { ...testData[testDataIndex], created_at: new Date() };
  
  const systemStatus = getSystemStatus(latestData);
  const recommendations = getAIRecommendations(latestData);
  
  res.json({
    success: true,
    data: {
      ...latestData,
      status: systemStatus,
      recommendations: recommendations
    }
  });
  
  // ТУТ ТРЕБА ПІДКЛЮЧИТИ POSTGRESQL
  // Приклад запиту до бази даних:
  // try {
  //   const result = await pool.query(
  //     'SELECT * FROM energy_data ORDER BY created_at DESC LIMIT 1'
  //   );
  //   res.json({ success: true, data: result.rows[0] });
  // } catch (error) {
  //   res.status(500).json({ success: false, error: error.message });
  // }
});

// POST /api/data - Отримання даних від ESP32
// ТУТ ESP32 ВІДПРАВЛЯЄ ДАНІ
app.post('/api/data', (req, res) => {
  const { voltage, battery, light } = req.body;
  
  // Валідація даних
  if (voltage === undefined || battery === undefined || light === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Відсутні обовязкові поля: voltage, battery, light'
    });
  }
  
  // Зберігаємо отримані дані
  latestData = {
    voltage: parseFloat(voltage),
    battery: parseInt(battery),
    light: parseInt(light),
    created_at: new Date()
  };
  
  console.log('Отримано дані від ESP32:', latestData);
  
  res.json({
    success: true,
    message: 'Дані успішно збережено',
    data: latestData
  });
  
  // ТУТ ТРЕБА ПІДКЛЮЧИТИ POSTGRESQL
  // Приклад збереження до бази даних:
  // try {
  //   const result = await pool.query(
  //     'INSERT INTO energy_data (voltage, battery, light) VALUES ($1, $2, $3) RETURNING *',
  //     [voltage, battery, light]
  //   );
  //   res.json({ success: true, data: result.rows[0] });
  // } catch (error) {
  //   res.status(500).json({ success: false, error: error.message });
  // }
});

// GET /api/history - Історія показників
app.get('/api/history', (req, res) => {
  // Повертаємо всі тестові дані як історію
  const history = testData.map((item, index) => ({
    id: index + 1,
    ...item,
    created_at: new Date(Date.now() - (testData.length - index) * 60000)
  }));
  
  res.json({
    success: true,
    data: history
  });
});

// POST /api/control - Керування системою
app.post('/api/control', (req, res) => {
  const { action } = req.body;
  
  const actions = {
    'eco-mode': 'Режим економії активовано',
    'boost-charge': 'Прискорену зарядку увімкнено',
    'reset': 'Систему перезавантажено',
    'calibrate': 'Калібрування датчиків розпочато'
  };
  
  if (actions[action]) {
    console.log(`Виконано дію: ${action}`);
    res.json({
      success: true,
      message: actions[action]
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Невідома дія'
    });
  }
});

// Головна сторінка
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`HelioCore AI Server запущено на порту ${PORT}`);
  console.log(`Відкрийте http://localhost:${PORT} у браузері`);
});
