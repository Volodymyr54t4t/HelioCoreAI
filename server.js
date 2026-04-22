// HelioCore AI - Backend Server
// Усі роути та логіка в одному файлі

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// ============================================
// TELEGRAM BOT INTEGRATION
// ============================================
const TelegramBot = require('node-telegram-bot-api');

// Токен з .env файлу
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;
const subscribers = new Set();

// Ініціалізація бота (тільки якщо є токен)
if (BOT_TOKEN && BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE') {
    bot = new TelegramBot(BOT_TOKEN, { polling: true });
    console.log('Telegram Bot запущено!');
} else {
    console.log('TELEGRAM_BOT_TOKEN не знайдено в .env - бот не запущено');
}

// ТУТ ТРЕБА ПІДКЛЮЧИТИ POSTGRESQL
// const { Pool } = require('pg');
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false }
// });

const app = express();
const PORT = process.env.PORT || 3001;

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

// ============================================
// TELEGRAM BOT HANDLERS
// ============================================

if (bot) {
    // Функції форматування
    function getStatusEmoji(status) {
        const emojis = { 'critical': '🔴', 'warning': '🟡', 'normal': '🟢', 'optimal': '💚' };
        return emojis[status] || '⚪';
    }

    function getBatteryEmoji(level) {
        if (level >= 80) return '🔋';
        if (level >= 40) return '🪫';
        return '⚠️';
    }

    function createProgressBar(value, max = 100, length = 10) {
        const filled = Math.round((value / max) * length);
        const empty = length - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }

    function formatStatusMessage(data) {
        const statusEmoji = getStatusEmoji(data.status?.status);
        const batteryEmoji = getBatteryEmoji(data.battery);
        const batteryBar = createProgressBar(data.battery);

        let lightStatus = '🌙 Темно';
        if (data.light > 700) lightStatus = '☀️ Яскраве сонце';
        else if (data.light > 500) lightStatus = '🌤️ Сонячно';
        else if (data.light > 300) lightStatus = '⛅ Хмарно';
        else if (data.light > 100) lightStatus = '🌥️ Похмуро';

        let voltageStatus = '⚡ Нормально';
        if (data.voltage > 13.0) voltageStatus = '⚡ Відмінно';
        else if (data.voltage < 10.5) voltageStatus = '⚠️ Низька';
        else if (data.voltage < 11.5) voltageStatus = '🔻 Знижена';

        return `
╔══════════════════════════════════╗
║    🌞 HELIOCORE AI MONITOR      ║
╚══════════════════════════════════╝

${statusEmoji} Статус системи: ${data.status?.label || 'Невідомо'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${batteryEmoji} БАТАРЕЯ
├─ Рівень: ${data.battery}%
├─ Прогрес: [${batteryBar}]
└─ Стан: ${data.battery > 80 ? '✅ Заряджена' : data.battery > 40 ? '🔄 Заряджається' : '⚠️ Потребує заряду'}

⚡ НАПРУГА
├─ Значення: ${data.voltage.toFixed(2)} V
├─ Мін/Макс: 10.0V / 14.0V
└─ Стан: ${voltageStatus}

💡 ОСВІТЛЕННЯ
├─ Інтенсивність: ${data.light} lux
├─ Мін/Макс: 0 / 1000 lux
└─ Стан: ${lightStatus}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ЕФЕКТИВНІСТЬ СИСТЕМИ
├─ Зарядка: ${data.light > 300 ? '🟢 Активна' : '🔴 Призупинена'}
├─ Споживання: ~${(data.voltage * 0.5).toFixed(1)}W
└─ Генерація: ~${(data.light * 0.01).toFixed(1)}W

🕐 Оновлено: ${new Date(data.created_at).toLocaleString('uk-UA')}
    `.trim();
    }

    function formatRecommendations(data) {
        if (!data.recommendations || data.recommendations.length === 0) {
            return '✅ Немає активних рекомендацій';
        }

        let message = `
╔══════════════════════════════════╗
║      🤖 AI РЕКОМЕНДАЦІЇ          ║
╚══════════════════════════════════╝

`;

        data.recommendations.forEach((rec) => {
            const typeEmoji = { 'warning': '🔴', 'caution': '🟡', 'success': '🟢', 'info': '🔵' };
            message += `${typeEmoji[rec.type] || '⚪'} ${rec.icon} ${rec.message}\n\n`;
        });

        return message.trim();
    }

    function formatDetailedInfo(data) {
        const uptimeHours = Math.floor(Math.random() * 720) + 24;
        const totalEnergy = (data.voltage * data.battery * 0.1).toFixed(2);

        return `
╔══════════════════════════════════╗
║    📊 ДЕТАЛЬНА СТАТИСТИКА       ║
╚══════════════════════════════════╝

🔌 ЕЛЕКТРИЧНІ ПАРАМЕТРИ
├─ Напруга: ${data.voltage.toFixed(3)} V
├─ Розрахунковий струм: ${(data.battery * 0.1).toFixed(2)} A
├─ Потужність: ${(data.voltage * data.battery * 0.01).toFixed(2)} W
├─ Енергія накопичена: ${totalEnergy} Wh
└─ Ефективність: ${Math.min(95, (data.light / 10 + 50)).toFixed(1)}%

🌡️ УМОВИ НАВКОЛИШНЬОГО СЕРЕДОВИЩА
├─ Освітленість: ${data.light} lux
├─ Розрахункова температура: ${(20 + data.light * 0.01).toFixed(1)}°C
├─ UV індекс: ${Math.min(11, (data.light / 100)).toFixed(1)}
└─ Прогноз погоди: ${data.light > 500 ? 'Сонячно ☀️' : 'Хмарно ☁️'}

📈 СТАТИСТИКА РОБОТИ
├─ Час роботи: ${uptimeHours} годин
├─ Цикли зарядки: ${Math.floor(uptimeHours / 24)}
├─ Середня напруга: ${(data.voltage * 0.98).toFixed(2)} V
├─ Пікова потужність: ${(data.voltage * 1.1).toFixed(2)} W
└─ Мін. рівень батареї: ${Math.max(5, data.battery - 30)}%

🔧 ТЕХНІЧНІ ДАНІ
├─ Версія прошивки: v2.1.4
├─ ID пристрою: ESP32-HC-001
├─ WiFi сигнал: -${Math.floor(Math.random() * 30 + 40)} dBm
├─ Пам'ять: ${Math.floor(Math.random() * 30 + 60)}% вільно
└─ CPU: ${Math.floor(Math.random() * 20 + 10)}%

🕐 Час звіту: ${new Date().toLocaleString('uk-UA')}
    `.trim();
    }

    function formatHistory(history) {
        if (!history || history.length === 0) return '📭 Історія порожня';

        let message = `
╔══════════════════════════════════╗
║      📜 ІСТОРІЯ ПОКАЗНИКІВ       ║
╚══════════════════════════════════╝

`;

        const recentHistory = history.slice(-10).reverse();
        recentHistory.forEach((item, index) => {
            const time = new Date(item.created_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
            const batteryIcon = item.battery > 50 ? '🔋' : '🪫';
            message += `${index + 1}. ${time} │ ${batteryIcon} ${item.battery}% │ ⚡${item.voltage.toFixed(1)}V │ 💡${item.light}\n`;
        });

        message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📊 Показано останні ${recentHistory.length} записів`;
        return message.trim();
    }

    // Отримання даних
    function getCurrentData() {
        testDataIndex = (testDataIndex + 1) % testData.length;
        latestData = { ...testData[testDataIndex], created_at: new Date() };
        const systemStatus = getSystemStatus(latestData);
        const recommendations = getAIRecommendations(latestData);
        return { ...latestData, status: systemStatus, recommendations };
    }

    // Головна клавіатура
    const mainKeyboard = {
        reply_markup: {
            keyboard: [
                ['📊 Статус', '🔋 Батарея', '💡 Освітлення'],
                ['🤖 AI Рекомендації', '📈 Деталі'],
                ['📜 Історія', '⚙️ Керування'],
                ['❓ Допомога']
            ],
            resize_keyboard: true
        }
    };

    const statusInlineKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔄 Оновити', callback_data: 'refresh_status' }, { text: '📊 Деталі', callback_data: 'show_details' }],
                [{ text: '🤖 AI Аналіз', callback_data: 'show_ai' }, { text: '📜 Історія', callback_data: 'show_history' }],
                [{ text: '🔔 Підписатися', callback_data: 'subscribe' }]
            ]
        }
    };

    const controlInlineKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🍃 Еко режим', callback_data: 'control_eco' }, { text: '⚡ Boost', callback_data: 'control_boost' }],
                [{ text: '🔄 Перезавантажити', callback_data: 'control_reset' }, { text: '📐 Калібрувати', callback_data: 'control_calibrate' }]
            ]
        }
    };

    // /start
    bot.onText(/\/start/, (msg) => {
        const userName = msg.from.first_name || 'Користувач';
        bot.sendMessage(msg.chat.id, `
🌞 Вітаю, ${userName}!

Ласкаво просимо до HelioCore AI Bot!

╔══════════════════════════════════╗
║  Що я вмію:                      ║
╠══════════════════════════════════╣
║ 📊 Моніторинг в реальному часі   ║
║ 🔋 Контроль батареї              ║
║ ⚡ Аналіз енергоспоживання       ║
║ 🤖 AI рекомендації               ║
║ 📈 Статистика та історія         ║
║ 🔔 Сповіщення про проблеми       ║
╚══════════════════════════════════╝

Натисніть /status або кнопку "📊 Статус"!
    `.trim(), mainKeyboard);
    });

    // /status
    bot.onText(/\/status/, (msg) => {
        const data = getCurrentData();
        bot.sendMessage(msg.chat.id, formatStatusMessage(data), statusInlineKeyboard);
    });

    // /battery
    bot.onText(/\/battery/, (msg) => {
        const data = getCurrentData();
        const batteryBar = createProgressBar(data.battery, 100, 20);
        bot.sendMessage(msg.chat.id, `
🔋 СТАН БАТАРЕЇ

Рівень заряду: ${data.battery}%
[${batteryBar}]

├─ Напруга: ${data.voltage.toFixed(2)} V
├─ Ємність: ~${(data.battery * 0.5).toFixed(0)} Wh
├─ Стан здоров'я: ${data.battery > 50 ? '✅ Добрий' : '⚠️ Потребує уваги'}
├─ Цикли: ~${Math.floor(Math.random() * 200 + 50)}
└─ Температура: ${(25 + Math.random() * 10).toFixed(1)}°C

${data.battery < 20 ? '⚠️ УВАГА: Низький заряд!' : data.battery > 90 ? '✅ Батарея повністю заряджена' : '🔄 Батарея заряджається'}
    `.trim());
    });

    // /power
    bot.onText(/\/power/, (msg) => {
        const data = getCurrentData();
        const power = (data.voltage * data.battery * 0.01).toFixed(2);
        bot.sendMessage(msg.chat.id, `
⚡ ПАРАМЕТРИ ЖИВЛЕННЯ

╭─────────────────────────╮
│ Напруга:    ${data.voltage.toFixed(2)} V      │
│ Струм:      ${(data.battery * 0.05).toFixed(2)} A       │
│ Потужність: ${power} W      │
╰─────────────────────────╯

📊 Діапазони:
├─ Номінальна напруга: 12.0 V
├─ Мін. робоча: 10.5 V
├─ Макс. зарядки: 14.4 V
└─ Поточний стан: ${data.voltage > 12 ? '🟢 Норма' : '🟡 Увага'}

📈 Споживання за годину: ~${(power * 0.8).toFixed(2)} Wh
📈 Генерація за годину: ~${(data.light * 0.008).toFixed(2)} Wh
    `.trim());
    });

    // /light
    bot.onText(/\/light/, (msg) => {
        const data = getCurrentData();
        const lightBar = createProgressBar(data.light, 1000, 20);
        let lightCondition = '🌙 Ніч/темно', efficiency = 0;
        if (data.light > 800) { lightCondition = '☀️ Яскраве сонце'; efficiency = 95; }
        else if (data.light > 600) { lightCondition = '🌤️ Сонячно'; efficiency = 80; }
        else if (data.light > 400) { lightCondition = '⛅ Легка хмарність'; efficiency = 60; }
        else if (data.light > 200) { lightCondition = '🌥️ Хмарно'; efficiency = 40; }
        else if (data.light > 50) { lightCondition = '🌧️ Похмуро'; efficiency = 20; }

        bot.sendMessage(msg.chat.id, `
💡 ОСВІТЛЕННЯ ТА ГЕНЕРАЦІЯ

Інтенсивність: ${data.light} lux
[${lightBar}]

├─ Умови: ${lightCondition}
├─ Ефективність: ${efficiency}%
├─ Генерація: ${(data.light * 0.01).toFixed(2)} W
└─ Прогноз: ${data.light > 300 ? '📈 Зарядка активна' : '📉 Зарядка мінімальна'}

🌡️ UV індекс: ${Math.min(11, (data.light / 90)).toFixed(1)}
🌡️ Розрахункова t°: ${(15 + data.light * 0.02).toFixed(0)}°C
    `.trim());
    });

    // /ai
    bot.onText(/\/ai/, (msg) => {
        const data = getCurrentData();
        bot.sendMessage(msg.chat.id, formatRecommendations(data));
    });

    // /details
    bot.onText(/\/details/, (msg) => {
        const data = getCurrentData();
        bot.sendMessage(msg.chat.id, formatDetailedInfo(data));
    });

    // /history
    bot.onText(/\/history/, (msg) => {
        const history = testData.map((item, index) => ({
            id: index + 1,
            ...item,
            created_at: new Date(Date.now() - (testData.length - index) * 60000)
        }));
        bot.sendMessage(msg.chat.id, formatHistory(history));
    });

    // /subscribe
    bot.onText(/\/subscribe/, (msg) => {
        subscribers.add(msg.chat.id);
        bot.sendMessage(msg.chat.id, `✅ Ви підписались на сповіщення!\n\nВи будете отримувати:\n🔴 Критичні попередження\n🟡 Попередження про проблеми\n\nДля відписки: /unsubscribe`);
    });

    // /unsubscribe
    bot.onText(/\/unsubscribe/, (msg) => {
        subscribers.delete(msg.chat.id);
        bot.sendMessage(msg.chat.id, '🔕 Ви відписались від сповіщень');
    });

    // /help
    bot.onText(/\/help/, (msg) => {
        bot.sendMessage(msg.chat.id, `
╔══════════════════════════════════╗
║    📚 ДОВІДКА HELIOCORE BOT     ║
╚══════════════════════════════════╝

🔹 ОСНОВНІ КОМАНДИ

/start - Запустити бота
/status - Поточний стан системи
/battery - Інформація про батарею
/power - Параметри живлення
/light - Дані освітлення
/ai - AI рекомендації
/details - Детальна статистика
/history - Історія показників
/subscribe - Підписка на сповіщення
/unsubscribe - Відписатися

🔸 КЕРУВАННЯ СИСТЕМОЮ

/eco - Режим економії енергії
/boost - Прискорена зарядка
/reset - Перезавантаження системи
/calibrate - Калібрування датчиків

🔹 ІНШЕ

/help - Ця довідка
/export - Експорт даних
    `.trim());
    });

    // /export
    bot.onText(/\/export/, (msg) => {
        const data = getCurrentData();
        const history = testData.map((item, index) => ({ id: index + 1, ...item, created_at: new Date(Date.now() - (testData.length - index) * 60000) }));
        const exportData = { timestamp: new Date().toISOString(), current: data, history, system: { version: '2.1.4', device: 'ESP32-HC-001' } };
        bot.sendDocument(msg.chat.id, Buffer.from(JSON.stringify(exportData, null, 2)), { filename: `heliocore_export_${Date.now()}.json`, caption: '📁 Експорт даних HelioCore AI' });
    });

    // Control commands
    bot.onText(/\/eco/, (msg) => { bot.sendMessage(msg.chat.id, '🍃 Режим економії енергії активовано!'); });
    bot.onText(/\/boost/, (msg) => { bot.sendMessage(msg.chat.id, '⚡ Прискорену зарядку увімкнено!'); });
    bot.onText(/\/reset/, (msg) => { bot.sendMessage(msg.chat.id, '🔄 Систему перезавантажено!'); });
    bot.onText(/\/calibrate/, (msg) => { bot.sendMessage(msg.chat.id, '📐 Калібрування датчиків розпочато!'); });

    // Text button handlers
    bot.on('message', (msg) => {
        if (msg.text?.startsWith('/')) return;
        const chatId = msg.chat.id;
        const data = getCurrentData();

        switch (msg.text) {
            case '📊 Статус': bot.sendMessage(chatId, formatStatusMessage(data), statusInlineKeyboard); break;
            case '🔋 Батарея': bot.emit('text', { ...msg, text: '/battery' }); break;
            case '💡 Освітлення': bot.emit('text', { ...msg, text: '/light' }); break;
            case '🤖 AI Рекомендації': bot.sendMessage(chatId, formatRecommendations(data)); break;
            case '📈 Деталі': bot.sendMessage(chatId, formatDetailedInfo(data)); break;
            case '📜 Історія': bot.emit('text', { ...msg, text: '/history' }); break;
            case '⚙️ Керування': bot.sendMessage(chatId, '⚙️ Керування системою:', controlInlineKeyboard); break;
            case '❓ Допомога': bot.emit('text', { ...msg, text: '/help' }); break;
        }
    });

    // Callback query handlers
    bot.on('callback_query', (query) => {
        const chatId = query.message.chat.id;
        const data = getCurrentData();

        switch (query.data) {
            case 'refresh_status': bot.editMessageText(formatStatusMessage(data), { chat_id: chatId, message_id: query.message.message_id, ...statusInlineKeyboard }); break;
            case 'show_details': bot.sendMessage(chatId, formatDetailedInfo(data)); break;
            case 'show_ai': bot.sendMessage(chatId, formatRecommendations(data)); break;
            case 'show_history': bot.emit('text', { chat: { id: chatId }, text: '/history' }); break;
            case 'subscribe': subscribers.add(chatId); bot.answerCallbackQuery(query.id, { text: '✅ Підписано!' }); break;
            case 'control_eco': bot.sendMessage(chatId, '🍃 Режим економії активовано!'); break;
            case 'control_boost': bot.sendMessage(chatId, '⚡ Boost режим увімкнено!'); break;
            case 'control_reset': bot.sendMessage(chatId, '🔄 Систему перезавантажено!'); break;
            case 'control_calibrate': bot.sendMessage(chatId, '📐 Калібрування розпочато!'); break;
        }
        bot.answerCallbackQuery(query.id);
    });

    // Error handling
    bot.on('polling_error', (error) => {
        console.error('Telegram Bot помилка:', error.message);
    });
}
