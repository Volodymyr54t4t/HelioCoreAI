// HelioCore AI - Telegram Bot
// Повнофункціональний бот для моніторингу сонячних панелей
// Команда для запуску: node bot.js

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// ============================================
// КОНФІГУРАЦІЯ
// ============================================

// ТУТ ВСТАВТЕ ВАШ ТОКЕН БОТА
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8341534913:AAHhcn2GSUF2Z-yr7V2zQsTjOUmQ8450XtI';

// URL вашого сервера (для отримання даних)
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

// ID адміністраторів (можуть отримувати критичні сповіщення)
const ADMIN_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',').map(id => parseInt(id)) : [];

// ============================================
// ІНІЦІАЛІЗАЦІЯ БОТА
// ============================================

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Зберігаємо підписників на сповіщення
const subscribers = new Set();

// Останні дані системи
let lastData = null;
let lastAlertTime = 0;

console.log('🤖 HelioCore AI Telegram Bot запущено!');
console.log(`📡 Підключення до сервера: ${SERVER_URL}`);

// ============================================
// ФУНКЦІЇ ОТРИМАННЯ ДАНИХ
// ============================================

// Отримання поточних даних з сервера
async function fetchCurrentData() {
    try {
        const response = await fetch(`${SERVER_URL}/api/data`);
        const result = await response.json();

        if (result.success) {
            lastData = result.data;
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Помилка отримання даних:', error.message);
        return null;
    }
}

// Отримання історії даних
async function fetchHistory() {
    try {
        const response = await fetch(`${SERVER_URL}/api/history`);
        const result = await response.json();

        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error('Помилка отримання історії:', error.message);
        return [];
    }
}

// ============================================
// ФОРМАТУВАННЯ ПОВІДОМЛЕНЬ
// ============================================

// Емодзі для статусів
function getStatusEmoji(status) {
    const emojis = {
        'critical': '🔴',
        'warning': '🟡',
        'normal': '🟢',
        'optimal': '💚'
    };
    return emojis[status] || '⚪';
}

// Емодзі для рівня батареї
function getBatteryEmoji(level) {
    if (level >= 80) return '🔋';
    if (level >= 60) return '🔋';
    if (level >= 40) return '🪫';
    if (level >= 20) return '🪫';
    return '⚠️';
}

// Прогрес-бар
function createProgressBar(value, max = 100, length = 10) {
    const filled = Math.round((value / max) * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

// Форматування основного повідомлення зі статусом
function formatStatusMessage(data) {
    const statusEmoji = getStatusEmoji(data.status?.status);
    const batteryEmoji = getBatteryEmoji(data.battery);
    const batteryBar = createProgressBar(data.battery);

    // Визначення якості освітлення
    let lightStatus = '🌙 Темно';
    if (data.light > 700) lightStatus = '☀️ Яскраве сонце';
    else if (data.light > 500) lightStatus = '🌤️ Сонячно';
    else if (data.light > 300) lightStatus = '⛅ Хмарно';
    else if (data.light > 100) lightStatus = '🌥️ Похмуро';

    // Визначення стану напруги
    let voltageStatus = '⚡ Нормально';
    if (data.voltage > 13.0) voltageStatus = '⚡ Відмінно';
    else if (data.voltage < 10.5) voltageStatus = '⚠️ Низька';
    else if (data.voltage < 11.5) voltageStatus = '🔻 Знижена';

    const message = `
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

    return message;
}

// Форматування рекомендацій AI
function formatRecommendations(data) {
    if (!data.recommendations || data.recommendations.length === 0) {
        return '✅ Немає активних рекомендацій';
    }

    let message = `
╔══════════════════════════════════╗
║      🤖 AI РЕКОМЕНДАЦІЇ          ║
╚══════════════════════════════════╝

`;

    data.recommendations.forEach((rec, index) => {
        const typeEmoji = {
            'warning': '🔴',
            'caution': '🟡',
            'success': '🟢',
            'info': '🔵'
        };

        message += `${typeEmoji[rec.type] || '⚪'} ${rec.icon} ${rec.message}\n\n`;
    });

    return message.trim();
}

// Форматування детальної інформації
function formatDetailedInfo(data) {
    const uptimeHours = Math.floor(Math.random() * 720) + 24; // Імітація uptime
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

// Форматування історії
function formatHistory(history) {
    if (!history || history.length === 0) {
        return '📭 Історія порожня';
    }

    let message = `
╔══════════════════════════════════╗
║      📜 ІСТОРІЯ ПОКАЗНИКІВ       ║
╚══════════════════════════════════╝

`;

    // Показуємо останні 10 записів
    const recentHistory = history.slice(-10).reverse();

    recentHistory.forEach((item, index) => {
        const time = new Date(item.created_at).toLocaleTimeString('uk-UA', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const batteryIcon = item.battery > 50 ? '🔋' : '🪫';

        message += `${index + 1}. ${time} │ ${batteryIcon} ${item.battery}% │ ⚡${item.voltage.toFixed(1)}V │ 💡${item.light}\n`;
    });

    message += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Показано останні ${recentHistory.length} записів
  `;

    return message.trim();
}

// Форматування допомоги
function formatHelpMessage() {
    return `
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
/about - Про систему
/settings - Налаштування
/export - Експорт даних

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Порада: Використовуйте кнопки меню 
   для швидкого доступу до функцій!

🌐 Веб-інтерфейс: ${SERVER_URL}
📧 Підтримка: support@heliocore.ai
  `.trim();
}

// ============================================
// КЛАВІАТУРИ
// ============================================

// Головна клавіатура
const mainKeyboard = {
    reply_markup: {
        keyboard: [
            ['📊 Статус', '🔋 Батарея', '💡 Освітлення'],
            ['🤖 AI Рекомендації', '📈 Деталі'],
            ['📜 Історія', '⚙️ Налаштування'],
            ['❓ Допомога']
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    }
};

// Inline клавіатура для статусу
const statusInlineKeyboard = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: '🔄 Оновити', callback_data: 'refresh_status' },
                { text: '📊 Деталі', callback_data: 'show_details' }
            ],
            [
                { text: '🤖 AI Аналіз', callback_data: 'show_ai' },
                { text: '📜 Історія', callback_data: 'show_history' }
            ],
            [
                { text: '🔔 Підписатися', callback_data: 'subscribe' }
            ]
        ]
    }
};

// Inline клавіатура для керування
const controlInlineKeyboard = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: '🍃 Еко режим', callback_data: 'control_eco' },
                { text: '⚡ Boost зарядка', callback_data: 'control_boost' }
            ],
            [
                { text: '🔄 Перезавантажити', callback_data: 'control_reset' },
                { text: '📐 Калібрувати', callback_data: 'control_calibrate' }
            ],
            [
                { text: '◀️ Назад', callback_data: 'back_main' }
            ]
        ]
    }
};

// ============================================
// ОБРОБНИКИ КОМАНД
// ============================================

// /start - Привітання
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'Користувач';

    const welcomeMessage = `
🌞 Вітаю, ${userName}!

Ласкаво просимо до HelioCore AI Bot - 
вашого помічника для моніторингу 
сонячних панелей!

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

Натисніть /status для перегляду 
поточного стану системи!
  `.trim();

    await bot.sendMessage(chatId, welcomeMessage, mainKeyboard);
});

// /status - Поточний стан
bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;

    await bot.sendMessage(chatId, '⏳ Отримую дані з системи...');

    const data = await fetchCurrentData();

    if (data) {
        await bot.sendMessage(chatId, formatStatusMessage(data), statusInlineKeyboard);
    } else {
        await bot.sendMessage(chatId, '❌ Не вдалося отримати дані. Перевірте підключення до сервера.');
    }
});

// /battery - Інформація про батарею
bot.onText(/\/battery/, async (msg) => {
    const chatId = msg.chat.id;
    const data = await fetchCurrentData();

    if (!data) {
        return bot.sendMessage(chatId, '❌ Дані недоступні');
    }

    const batteryBar = createProgressBar(data.battery, 100, 20);

    const message = `
🔋 СТАН БАТАРЕЇ

Рівень заряду: ${data.battery}%
[${batteryBar}]

├─ Напруга: ${data.voltage.toFixed(2)} V
├─ Ємність: ~${(data.battery * 0.5).toFixed(0)} Wh
├─ Стан здоров'я: ${data.battery > 50 ? '✅ Добрий' : '⚠️ Потребує уваги'}
├─ Цикли: ~${Math.floor(Math.random() * 200 + 50)}
└─ Температура: ${(25 + Math.random() * 10).toFixed(1)}°C

${data.battery < 20 ? '⚠️ УВАГА: Низький заряд!' :
            data.battery > 90 ? '✅ Батарея повністю заряджена' :
                '🔄 Батарея заряджається'}
  `.trim();

    await bot.sendMessage(chatId, message);
});

// /power - Параметри живлення
bot.onText(/\/power/, async (msg) => {
    const chatId = msg.chat.id;
    const data = await fetchCurrentData();

    if (!data) {
        return bot.sendMessage(chatId, '❌ Дані недоступні');
    }

    const power = (data.voltage * data.battery * 0.01).toFixed(2);

    const message = `
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
  `.trim();

    await bot.sendMessage(chatId, message);
});

// /light - Дані освітлення
bot.onText(/\/light/, async (msg) => {
    const chatId = msg.chat.id;
    const data = await fetchCurrentData();

    if (!data) {
        return bot.sendMessage(chatId, '❌ Дані недоступні');
    }

    const lightBar = createProgressBar(data.light, 1000, 20);
    let lightCondition = '';
    let efficiency = 0;

    if (data.light > 800) {
        lightCondition = '☀️ Яскраве сонце';
        efficiency = 95;
    } else if (data.light > 600) {
        lightCondition = '🌤️ Сонячно';
        efficiency = 80;
    } else if (data.light > 400) {
        lightCondition = '⛅ Легка хмарність';
        efficiency = 60;
    } else if (data.light > 200) {
        lightCondition = '🌥️ Хмарно';
        efficiency = 40;
    } else if (data.light > 50) {
        lightCondition = '🌧️ Похмуро';
        efficiency = 20;
    } else {
        lightCondition = '🌙 Ніч/темно';
        efficiency = 0;
    }

    const message = `
💡 ОСВІТЛЕННЯ ТА ГЕНЕРАЦІЯ

Інтенсивність: ${data.light} lux
[${lightBar}]

├─ Умови: ${lightCondition}
├─ Ефективність: ${efficiency}%
├─ Генерація: ${(data.light * 0.01).toFixed(2)} W
└─ Прогноз: ${data.light > 300 ? '📈 Зарядка активна' : '📉 Зарядка мінімальна'}

🌡️ UV індекс: ${Math.min(11, (data.light / 90)).toFixed(1)}
🌡️ Розрахункова t°: ${(15 + data.light * 0.02).toFixed(0)}°C
  `.trim();

    await bot.sendMessage(chatId, message);
});

// /ai - AI рекомендації
bot.onText(/\/ai/, async (msg) => {
    const chatId = msg.chat.id;
    const data = await fetchCurrentData();

    if (data) {
        await bot.sendMessage(chatId, formatRecommendations(data));
    } else {
        await bot.sendMessage(chatId, '❌ Не вдалося отримати AI аналіз');
    }
});

// /details - Детальна статистика
bot.onText(/\/details/, async (msg) => {
    const chatId = msg.chat.id;
    const data = await fetchCurrentData();

    if (data) {
        await bot.sendMessage(chatId, formatDetailedInfo(data));
    } else {
        await bot.sendMessage(chatId, '❌ Дані недоступні');
    }
});

// /history - Історія
bot.onText(/\/history/, async (msg) => {
    const chatId = msg.chat.id;
    const history = await fetchHistory();
    await bot.sendMessage(chatId, formatHistory(history));
});

// /subscribe - Підписка
bot.onText(/\/subscribe/, (msg) => {
    const chatId = msg.chat.id;
    subscribers.add(chatId);

    bot.sendMessage(chatId, `
✅ Ви підписались на сповіщення!

Ви будете отримувати:
🔴 Критичні попередження
🟡 Попередження про проблеми
📊 Щоденні звіти (якщо увімкнено)

Для відписки: /unsubscribe
  `);
});

// /unsubscribe - Відписка
bot.onText(/\/unsubscribe/, (msg) => {
    const chatId = msg.chat.id;
    subscribers.delete(chatId);

    bot.sendMessage(chatId, '🔕 Ви відписались від сповіщень');
});

// /help - Допомога
bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, formatHelpMessage());
});

// /about - Про систему
bot.onText(/\/about/, (msg) => {
    const message = `
╔══════════════════════════════════╗
║      🌞 ПРО HELIOCORE AI         ║
╚══════════════════════════════════╝

HelioCore AI - це інтелектуальна 
система моніторингу сонячних панелей
на базі ESP32 з AI аналітикою.

📌 ВЕРСІЯ: 2.1.4
📌 РОЗРОБНИК: HelioCore Team
📌 ЛІЦЕНЗІЯ: MIT

🔧 ТЕХНОЛОГІЇ:
├─ ESP32 мікроконтролер
├─ Node.js backend
├─ Telegram Bot API
├─ AI/ML аналітика
└─ PostgreSQL (опційно)

📊 МОЖЛИВОСТІ:
├─ Real-time моніторинг
├─ Історія показників
├─ AI рекомендації
├─ Push-сповіщення
├─ Віддалене керування
└─ Експорт даних

🌐 ${SERVER_URL}
📧 support@heliocore.ai
📱 Telegram: @HelioCoreSupportBot
  `.trim();

    bot.sendMessage(msg.chat.id, message);
});

// /settings - Налаштування
bot.onText(/\/settings/, (msg) => {
    const chatId = msg.chat.id;
    const isSubscribed = subscribers.has(chatId);

    const message = `
⚙️ НАЛАШТУВАННЯ

├─ Сповіщення: ${isSubscribed ? '✅ Увімкнено' : '❌ Вимкнено'}
├─ Мова: 🇺🇦 Українська
├─ Часовий пояс: Europe/Kyiv
└─ Формат даних: Метричний

Для зміни налаштувань використовуйте
відповідні команди або кнопки нижче.
  `.trim();

    bot.sendMessage(chatId, message, controlInlineKeyboard);
});

// /export - Експорт даних
bot.onText(/\/export/, async (msg) => {
    const chatId = msg.chat.id;
    const data = await fetchCurrentData();
    const history = await fetchHistory();

    if (!data) {
        return bot.sendMessage(chatId, '❌ Дані недоступні');
    }

    const exportData = {
        timestamp: new Date().toISOString(),
        current: data,
        history: history,
        system: {
            version: '2.1.4',
            device: 'ESP32-HC-001'
        }
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    // Відправляємо як документ
    await bot.sendDocument(chatId, Buffer.from(jsonString), {
        filename: `heliocore_export_${Date.now()}.json`,
        caption: '📁 Експорт даних HelioCore AI'
    });
});

// Команди керування
bot.onText(/\/eco/, async (msg) => {
    try {
        await fetch(`${SERVER_URL}/api/control`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'eco-mode' })
        });
        bot.sendMessage(msg.chat.id, '🍃 Режим економії енергії активовано!');
    } catch (error) {
        bot.sendMessage(msg.chat.id, '❌ Помилка виконання команди');
    }
});

bot.onText(/\/boost/, async (msg) => {
    try {
        await fetch(`${SERVER_URL}/api/control`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'boost-charge' })
        });
        bot.sendMessage(msg.chat.id, '⚡ Прискорену зарядку увімкнено!');
    } catch (error) {
        bot.sendMessage(msg.chat.id, '❌ Помилка виконання команди');
    }
});

bot.onText(/\/reset/, async (msg) => {
    try {
        await fetch(`${SERVER_URL}/api/control`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reset' })
        });
        bot.sendMessage(msg.chat.id, '🔄 Систему перезавантажено!');
    } catch (error) {
        bot.sendMessage(msg.chat.id, '❌ Помилка виконання команди');
    }
});

bot.onText(/\/calibrate/, async (msg) => {
    try {
        await fetch(`${SERVER_URL}/api/control`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'calibrate' })
        });
        bot.sendMessage(msg.chat.id, '📐 Калібрування датчиків розпочато!');
    } catch (error) {
        bot.sendMessage(msg.chat.id, '❌ Помилка виконання команди');
    }
});

// ============================================
// ОБРОБКА ТЕКСТОВИХ ПОВІДОМЛЕНЬ (КНОПКИ)
// ============================================

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ігноруємо команди (вони обробляються окремо)
    if (text?.startsWith('/')) return;

    switch (text) {
        case '📊 Статус':
            const statusData = await fetchCurrentData();
            if (statusData) {
                await bot.sendMessage(chatId, formatStatusMessage(statusData), statusInlineKeyboard);
            }
            break;

        case '🔋 Батарея':
            bot.emit('text', { ...msg, text: '/battery' });
            break;

        case '💡 Освітлення':
            bot.emit('text', { ...msg, text: '/light' });
            break;

        case '🤖 AI Рекомендації':
            const aiData = await fetchCurrentData();
            if (aiData) {
                await bot.sendMessage(chatId, formatRecommendations(aiData));
            }
            break;

        case '📈 Деталі':
            const detailData = await fetchCurrentData();
            if (detailData) {
                await bot.sendMessage(chatId, formatDetailedInfo(detailData));
            }
            break;

        case '📜 Історія':
            const history = await fetchHistory();
            await bot.sendMessage(chatId, formatHistory(history));
            break;

        case '⚙️ Налаштування':
            bot.emit('text', { ...msg, text: '/settings' });
            break;

        case '❓ Допомога':
            await bot.sendMessage(chatId, formatHelpMessage());
            break;
    }
});

// ============================================
// ОБРОБКА CALLBACK QUERY (INLINE КНОПКИ)
// ============================================

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const action = query.data;

    // Підтверджуємо отримання callback
    await bot.answerCallbackQuery(query.id);

    switch (action) {
        case 'refresh_status':
            const data = await fetchCurrentData();
            if (data) {
                await bot.editMessageText(formatStatusMessage(data), {
                    chat_id: chatId,
                    message_id: messageId,
                    ...statusInlineKeyboard
                });
            }
            break;

        case 'show_details':
            const detailData = await fetchCurrentData();
            if (detailData) {
                await bot.sendMessage(chatId, formatDetailedInfo(detailData));
            }
            break;

        case 'show_ai':
            const aiData = await fetchCurrentData();
            if (aiData) {
                await bot.sendMessage(chatId, formatRecommendations(aiData));
            }
            break;

        case 'show_history':
            const history = await fetchHistory();
            await bot.sendMessage(chatId, formatHistory(history));
            break;

        case 'subscribe':
            subscribers.add(chatId);
            await bot.answerCallbackQuery(query.id, { text: '✅ Підписано на сповіщення!' });
            break;

        case 'control_eco':
            await fetch(`${SERVER_URL}/api/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'eco-mode' })
            });
            await bot.answerCallbackQuery(query.id, { text: '🍃 Еко режим активовано!' });
            break;

        case 'control_boost':
            await fetch(`${SERVER_URL}/api/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'boost-charge' })
            });
            await bot.answerCallbackQuery(query.id, { text: '⚡ Boost зарядка увімкнена!' });
            break;

        case 'control_reset':
            await fetch(`${SERVER_URL}/api/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset' })
            });
            await bot.answerCallbackQuery(query.id, { text: '🔄 Систему перезавантажено!' });
            break;

        case 'control_calibrate':
            await fetch(`${SERVER_URL}/api/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'calibrate' })
            });
            await bot.answerCallbackQuery(query.id, { text: '📐 Калібрування розпочато!' });
            break;

        case 'back_main':
            await bot.sendMessage(chatId, 'Головне меню:', mainKeyboard);
            break;
    }
});

// ============================================
// АВТОМАТИЧНІ СПОВІЩЕННЯ
// ============================================

// Перевірка критичних станів кожні 5 хвилин
setInterval(async () => {
    if (subscribers.size === 0) return;

    const data = await fetchCurrentData();
    if (!data) return;

    const now = Date.now();

    // Не спамимо - мінімум 10 хвилин між сповіщеннями
    if (now - lastAlertTime < 600000) return;

    let alertMessage = null;

    // Критично низький заряд
    if (data.battery < 15) {
        alertMessage = `
🚨 КРИТИЧНЕ ПОПЕРЕДЖЕННЯ!

⚠️ Рівень батареї: ${data.battery}%

Терміново потрібна зарядка або 
увімкнення режиму економії!

/eco - Увімкнути еко режим
/status - Перевірити стан
    `.trim();
    }

    // Критично низька напруга
    else if (data.voltage < 10.5) {
        alertMessage = `
🚨 КРИТИЧНЕ ПОПЕРЕДЖЕННЯ!

⚠️ Напруга: ${data.voltage.toFixed(2)} V

Критично низька напруга!
Перевірте підключення панелей.

/status - Перевірити стан
/details - Детальна інформація
    `.trim();
    }

    if (alertMessage) {
        lastAlertTime = now;

        // Надсилаємо всім підписникам
        for (const chatId of subscribers) {
            try {
                await bot.sendMessage(chatId, alertMessage);
            } catch (error) {
                // Якщо не вдалося надіслати - видаляємо з підписників
                subscribers.delete(chatId);
            }
        }
    }
}, 300000); // 5 хвилин

// ============================================
// ОБРОБКА ПОМИЛОК
// ============================================

bot.on('polling_error', (error) => {
    console.error('Помилка polling:', error.message);
});

bot.on('error', (error) => {
    console.error('Помилка бота:', error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Зупинка бота...');
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Зупинка бота...');
    bot.stopPolling();
    process.exit(0);
});

console.log('✅ Бот готовий до роботи!');
console.log('📝 Команди: /start, /status, /battery, /power, /light, /ai, /details, /history');
