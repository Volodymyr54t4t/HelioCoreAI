// HelioCore AI — Web Bluetooth Frontend
// Arduino R4 WiFi + ArduinoBLE

// ===== BLE UUID =====
const SERVICE_UUID   = '12345678-1234-1234-1234-123456789abc';
const DATA_CHAR_UUID = '12345678-1234-1234-1234-123456789001';
const CMD_CHAR_UUID  = '12345678-1234-1234-1234-123456789002';

// DOM елементи
const elements = {
    connectionStatus:    document.getElementById('connectionStatus'),
    lastUpdate:          document.getElementById('lastUpdate'),
    statusBanner:        document.getElementById('statusBanner'),
    statusIcon:          document.getElementById('statusIcon'),
    statusLabel:         document.getElementById('statusLabel'),
    statusDescription:   document.getElementById('statusDescription'),
    chargingBadge:       document.getElementById('chargingBadge'),
    chargingIndicator:   document.getElementById('chargingIndicator'),
    batteryValue:        document.getElementById('batteryValue'),
    batteryProgress:     document.getElementById('batteryProgress'),
    batteryStatusText:   document.getElementById('batteryStatusText'),
    voltageValue:        document.getElementById('voltageValue'),
    voltageGauge:        document.getElementById('voltageGauge'),
    tempValue:           document.getElementById('tempValue'),
    tempFill:            document.getElementById('tempFill'),
    humValue:            document.getElementById('humValue'),
    humProgress:         document.getElementById('humProgress'),
    co2Value:            document.getElementById('co2Value'),
    co2Fill:             document.getElementById('co2Fill'),
    co2Label:            document.getElementById('co2Label'),
    statusRingProgress:  document.getElementById('statusRingProgress'),
    statusEmoji:         document.getElementById('statusEmoji'),
    statusMain:          document.getElementById('statusMain'),
    statusSub:           document.getElementById('statusSub'),
    recommendationsList: document.getElementById('recommendationsList'),
    toastContainer:      document.getElementById('toastContainer'),
    ecoStatus:           document.getElementById('ecoStatus'),
    servoStatus:         document.getElementById('servoStatus'),
    batStatus:           document.getElementById('batStatus'),
    servoModal:          document.getElementById('servoModal'),
    servoAngleValue:     document.getElementById('servoAngleValue'),
    servoArcProgress:    document.getElementById('servoArcProgress'),
    servoArrow:          document.getElementById('servoArrow'),
    servoPositionLabel:  document.getElementById('servoPositionLabel'),
    servoRelayState:     document.getElementById('servoRelayState'),
};

// ===== СТАН =====
let bleDevice    = null;
let bleServer    = null;
let dataChar     = null;
let cmdChar      = null;
let isConnected  = false;
let isDemoMode   = false;   // режим без BLE
let relayOn      = false;
let batRelayOn   = true;
let currentServoAngle = 90;

// ===== BLE ПІДКЛЮЧЕННЯ =====
async function connectBLE() {
    if (!navigator.bluetooth) {
        showToast('Web Bluetooth недоступний. Використовуйте Chrome на ПК/Android', 'error');
        return;
    }
    try {
        showToast('Пошук HelioCore...', 'success');
        bleDevice = await navigator.bluetooth.requestDevice({
            filters: [{ name: 'HelioCore' }],
            optionalServices: [SERVICE_UUID],
        });
        bleDevice.addEventListener('gattserverdisconnected', onDisconnected);

        bleServer = await bleDevice.gatt.connect();
        const service = await bleServer.getPrimaryService(SERVICE_UUID);

        dataChar = await service.getCharacteristic(DATA_CHAR_UUID);
        await dataChar.startNotifications();
        dataChar.addEventListener('characteristicvaluechanged', onDataReceived);

        cmdChar = await service.getCharacteristic(CMD_CHAR_UUID);

        // ===== СИНХРОНІЗАЦІЯ ЧАСУ =====
        // Надсилаємо поточний Unix-час одразу після підключення
        await syncTime();

        setConnectionStatus(true);
        isDemoMode = false;
        showToast('HelioCore підключено! ✅', 'success');

        const btn = document.getElementById('bleConnectBtn');
        if (btn) {
            btn.classList.add('connected');
            btn.querySelector('span').textContent = 'Відключити';
        }

    } catch (err) {
        if (err.name !== 'NotFoundError') showToast('Помилка: ' + err.message, 'error');
        setConnectionStatus(false);
    }
}

// ===== СИНХРОНІЗАЦІЯ ЧАСУ =====
// Надсилає поточний Unix timestamp на Arduino (секунди)
async function syncTime() {
    const unixSec = Math.floor(Date.now() / 1000);
    const ok = await sendCmd('time:' + unixSec);
    if (ok) {
        console.log('HelioCore: час синхронізовано →', new Date(unixSec * 1000).toLocaleTimeString('uk-UA'));
    }
}

function onDisconnected() {
    setConnectionStatus(false);
    isDemoMode = false;
    cmdChar = null; dataChar = null;
    const btn = document.getElementById('bleConnectBtn');
    if (btn) {
        btn.classList.remove('connected');
        btn.querySelector('span').textContent = 'Bluetooth';
    }
    showToast('Пристрій відключено', 'error');
}

async function disconnectBLE() {
    if (bleDevice && bleDevice.gatt.connected) bleDevice.gatt.disconnect();
}

// ===== ДЕМО-РЕЖИМ (пропуск BLE) =====
function enterDemoMode() {
    isDemoMode = true;
    isConnected = true;

    // Оновлюємо статус
    const statusEl = elements.connectionStatus;
    const text = statusEl.querySelector('.status-text');
    statusEl.classList.remove('disconnected');
    text.textContent = 'Демо-режим';
    elements.lastUpdate.textContent = new Date().toLocaleTimeString('uk-UA');

    // Оновлюємо кнопку
    const btn = document.getElementById('bleConnectBtn');
    if (btn) {
        btn.classList.add('connected');
        btn.querySelector('span').textContent = 'Відключити';
    }

    showToast('Демо-режим увімкнено (без BLE) 🔵', 'success');

    // Запускаємо демо-дані
    startDemoData();
}

let demoInterval = null;
function startDemoData() {
    if (demoInterval) clearInterval(demoInterval);
    sendDemoUpdate(); // одразу
    demoInterval = setInterval(sendDemoUpdate, 3000);
}

function stopDemoData() {
    if (demoInterval) { clearInterval(demoInterval); demoInterval = null; }
}

function sendDemoUpdate() {
    // Генеруємо реалістичні демо-дані
    const t = parseFloat((20 + Math.random() * 8).toFixed(1));
    const h = Math.round(45 + Math.random() * 20);
    const g = Math.round(300 + Math.random() * 150);
    const statusStr = g > 600 ? 'critical' : g > 400 ? 'warning' : relayOn ? 'optimal' : 'normal';

    const raw = {
        b: 100, v: 5.0, t, h, g,
        s: statusStr,
        r: relayOn,
        bat: batRelayOn,
    };
    const data = buildUIData(raw);
    updateUI(data);
}

// ===== ПРИЙОМ ДАНИХ =====
function onDataReceived(event) {
    try {
        const raw = new TextDecoder('utf-8').decode(event.target.value);

        // Перевіряємо, чи це запит підтвердження калібрування
        if (raw.startsWith('cal:align')) {
            showCalibrationPrompt();
            return;
        }

        const parsed = JSON.parse(raw);
        const data = buildUIData(parsed);
        updateUI(data);
        setConnectionStatus(true);
    } catch (err) {
        console.error('BLE parse error:', err);
    }
}

// ===== КАЛІБРУВАННЯ SOLAR TRACKING =====
// Показуємо модальний діалог — "направте пристрій на сонце"
function showCalibrationPrompt() {
    // Якщо вже є модалка — не дублюємо
    if (document.getElementById('calModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'calModal';
    overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;
        display:flex;align-items:center;justify-content:center;
    `;

    overlay.innerHTML = `
        <div style="
            background:var(--color-background-secondary,#1a1a2e);
            border:1px solid rgba(0,212,255,0.3);
            border-radius:16px;padding:32px;max-width:400px;width:90%;
            text-align:center;font-family:Rajdhani,sans-serif;
        ">
            <div style="font-size:48px;margin-bottom:16px;">☀️</div>
            <h3 style="color:var(--neon-yellow,#ffee00);font-size:1.3rem;margin:0 0 12px;">
                Калібрування Solar Tracking
            </h3>
            <p style="color:var(--text-muted,#aaa);margin:0 0 8px;font-size:0.95rem;">
                Направте сонячну панель прямо на сонце та натисніть <strong style="color:#fff;">Підтвердити</strong>.
            </p>
            <p style="color:var(--text-muted,#aaa);margin:0 0 24px;font-size:0.85rem;">
                Після цього Arduino запам'ятає поточний час і кут, і буде автоматично стежити за рухом сонця.
            </p>
            <div style="display:flex;gap:12px;justify-content:center;">
                <button id="calConfirmBtn" style="
                    background:rgba(0,255,136,0.15);border:1px solid #00ff88;
                    color:#00ff88;padding:10px 24px;border-radius:8px;
                    font-family:Rajdhani,sans-serif;font-size:1rem;cursor:pointer;
                ">☀️ Підтвердити</button>
                <button id="calCancelBtn" style="
                    background:rgba(255,68,68,0.1);border:1px solid rgba(255,68,68,0.4);
                    color:#ff8888;padding:10px 24px;border-radius:8px;
                    font-family:Rajdhani,sans-serif;font-size:1rem;cursor:pointer;
                ">✕ Скасувати</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('calConfirmBtn').addEventListener('click', async () => {
        overlay.remove();
        // Надсилаємо підтвердження + поточний час (щоб Arduino знав початкову точку)
        const unixSec = Math.floor(Date.now() / 1000);
        await sendCmd('cal:confirm:' + unixSec);
        showToast('Калібрування виконано! ☀️ Трекінг запущено', 'success');
    });

    document.getElementById('calCancelBtn').addEventListener('click', () => {
        overlay.remove();
        sendCmd('cal:cancel');
        showToast('Калібрування скасовано', 'error');
    });
}

// Arduino шле: {"b":100,"v":5.0,"t":23.5,"h":55,"g":320,"s":"normal","r":false,"bat":true}
function buildUIData(raw) {
    const statusMap = {
        critical: { status: 'critical', label: 'Критичний',    color: '#ff4444' },
        warning:  { status: 'warning',  label: 'Попередження', color: '#ffaa00' },
        normal:   { status: 'normal',   label: 'Нормальний',   color: '#00d4ff' },
        optimal:  { status: 'optimal',  label: 'Оптимальний',  color: '#00ff88' },
    };
    const status = statusMap[raw.s] || statusMap.normal;
    const isCharging = raw.r === true;

    return {
        battery: 100,
        voltage: 5.0,
        temp:    raw.t ?? null,
        hum:     raw.h ?? null,
        gas:     raw.g ?? 0,
        status,
        relay:      raw.r,
        batRelay:   raw.bat !== undefined ? raw.bat : true,
        isCharging,
        recommendations: generateRecommendations(raw),
    };
}

// ===== AI РЕКОМЕНДАЦІЇ =====
function generateRecommendations(raw) {
    const recs = [];
    const isCharging = raw.r === true;
    const batOn = raw.bat !== undefined ? raw.bat : true;

    if (!batOn) {
        recs.push({ type: 'warning', icon: '🔋', message: 'Акумулятор відключений! Реле АКБ вимкнено (пін 6).' });
    } else {
        recs.push({ type: 'success', icon: '🔋', message: 'Акумулятор підключений і готовий до роботи.' });
    }

    if (isCharging) {
        recs.push({ type: 'success', icon: '⚡', message: 'Сонячна панель активна — йде зарядка від сонячної енергії.' });
    } else {
        recs.push({ type: 'info', icon: '💡', message: 'Збереження сонячної енергії вимкнено. Увімкніть реле для зарядки.' });
    }

    if (raw.g > 600) {
        recs.push({ type: 'warning', icon: '🚨', message: `Критичний рівень газу/CO₂ (${raw.g}). Реле увімкнено автоматично!` });
    } else if (raw.g > 400) {
        recs.push({ type: 'caution', icon: '⚠️', message: `Підвищений рівень CO₂ (${raw.g}). Рекомендується провітрювання.` });
    } else if (raw.g !== null) {
        recs.push({ type: 'success', icon: '✅', message: `Рівень CO₂ в нормі (${raw.g}).` });
    }

    if (raw.t !== null) {
        if (raw.t > 40) {
            recs.push({ type: 'warning', icon: '🌡️', message: `Висока температура (${raw.t}°C)! Перевірте вентиляцію обладнання.` });
        } else if (raw.t > 30) {
            recs.push({ type: 'caution', icon: '🌡️', message: `Температура підвищена (${raw.t}°C). Слідкуйте за охолодженням.` });
        } else {
            recs.push({ type: 'success', icon: '🌡️', message: `Температура в нормі — ${raw.t}°C.` });
        }
    }

    if (raw.h !== null) {
        if (raw.h > 80) {
            recs.push({ type: 'caution', icon: '💧', message: `Висока вологість (${raw.h}%). Можлива корозія контактів.` });
        } else if (raw.h < 20) {
            recs.push({ type: 'info', icon: '💧', message: `Низька вологість (${raw.h}%). Показник в допустимому діапазоні.` });
        }
    }

    return recs;
}

// ===== ОНОВЛЕННЯ UI =====
function updateUI(data) {
    updateBattery(data.battery, data.isCharging);
    updateVoltage(data.voltage);
    updateTemp(data.temp);
    updateHumidity(data.hum);
    updateCO2(data.gas);
    updateStatus(data.status, data.battery);
    updateStatusBanner(data.status, data.isCharging);
    updateRecommendations(data.recommendations);

    relayOn = data.relay;
    elements.ecoStatus.textContent = relayOn ? 'Активно' : 'Вимкнено';
    const ecoBtn = document.querySelector('.eco-btn');
    if (ecoBtn) relayOn ? ecoBtn.classList.add('active') : ecoBtn.classList.remove('active');

    batRelayOn = data.batRelay;
    updateBatRelayUI();

    if (elements.servoRelayState) {
        elements.servoRelayState.textContent = relayOn ? 'ON ⚡' : 'OFF';
        elements.servoRelayState.style.color  = relayOn ? 'var(--neon-green)' : 'var(--text-muted)';
    }

    elements.lastUpdate.textContent = new Date().toLocaleTimeString('uk-UA');
}

function updateBatRelayUI() {
    if (elements.batStatus) {
        elements.batStatus.textContent = batRelayOn ? 'Підключений' : 'Відключений';
    }
    const batBtn = document.querySelector('.bat-btn');
    if (batBtn) {
        if (batRelayOn) {
            batBtn.classList.remove('bat-off');
            batBtn.classList.add('bat-on');
            batBtn.setAttribute('title', 'Відключити акумулятор');
        } else {
            batBtn.classList.remove('bat-on');
            batBtn.classList.add('bat-off');
            batBtn.setAttribute('title', 'Підключити акумулятор');
        }
        const labelEl = batBtn.querySelector('.bat-btn-label, .btn-label, .control-label');
        if (labelEl) labelEl.textContent = batRelayOn ? 'Вимкнути АКБ' : 'Увімкнути АКБ';
    }
}

function updateBattery(battery, isCharging) {
    elements.batteryValue.textContent = battery;
    elements.batteryProgress.style.width = '100%';
    elements.batteryProgress.classList.remove('low', 'medium', 'charging');
    if (isCharging) {
        elements.batteryProgress.classList.add('charging');
        elements.batteryStatusText.textContent = 'Заряджається ⚡';
        elements.batteryStatusText.classList.add('charging-text-anim');
        elements.chargingIndicator.style.display = 'block';
    } else {
        elements.batteryStatusText.textContent = 'Повний заряд';
        elements.batteryStatusText.classList.remove('charging-text-anim');
        elements.chargingIndicator.style.display = 'none';
    }
}

function updateVoltage(voltage) {
    elements.voltageValue.textContent = voltage.toFixed(1);
    const pct = Math.max(0, Math.min(100, (voltage / 5) * 100));
    elements.voltageGauge.style.left = `calc(${pct}% - 10px)`;
}

function updateTemp(temp) {
    if (temp === null || temp === undefined || isNaN(temp)) {
        elements.tempValue.textContent = '--';
        elements.tempFill.style.width = '0%';
        return;
    }
    elements.tempValue.textContent = parseFloat(temp).toFixed(1);
    const pct = Math.max(0, Math.min(100, (temp / 50) * 100));
    elements.tempFill.style.width = pct + '%';
}

function updateHumidity(hum) {
    if (hum === null || hum === undefined || isNaN(hum)) {
        elements.humValue.textContent = '--';
        elements.humProgress.style.width = '0%';
        return;
    }
    elements.humValue.textContent = Math.round(hum);
    elements.humProgress.style.width = Math.min(100, hum) + '%';
}

function updateCO2(gas) {
    elements.co2Value.textContent = gas;
    const pct = Math.min(100, (gas / 1023) * 100);
    elements.co2Fill.style.width = pct + '%';
    elements.co2Label.classList.remove('ok', 'warning', 'danger');
    if (gas > 600) {
        elements.co2Label.textContent = 'НЕБЕЗПЕЧНО';
        elements.co2Label.classList.add('danger');
    } else if (gas > 400) {
        elements.co2Label.textContent = 'ПІДВИЩЕНО';
        elements.co2Label.classList.add('warning');
    } else {
        elements.co2Label.textContent = 'НОРМА';
        elements.co2Label.classList.add('ok');
    }
}

function updateStatus(status, battery) {
    const circumference = 283;
    const progress = (battery / 100) * circumference;
    elements.statusRingProgress.style.strokeDashoffset = circumference - progress;
    elements.statusRingProgress.style.stroke = status.color;
    const emojis = { critical:'🔴', warning:'🟡', normal:'🔵', optimal:'🟢' };
    elements.statusEmoji.textContent = emojis[status.status] || '⚡';
    elements.statusMain.textContent  = status.label;
    elements.statusMain.style.color  = status.color;
    const descs = { critical:'Потребує уваги', warning:'Моніторинг активний', normal:'Працює стабільно', optimal:'Максимальна ефективність' };
    elements.statusSub.textContent = descs[status.status] || 'Очікування...';
}

function updateStatusBanner(status, isCharging) {
    elements.statusBanner.classList.remove('critical', 'warning', 'optimal', 'charging');
    if (isCharging) {
        elements.statusBanner.classList.add('charging');
        elements.statusIcon.textContent = '☀️';
        elements.statusIcon.style.color = 'var(--neon-yellow)';
        elements.statusLabel.textContent = 'Зарядка від сонячної енергії';
        elements.statusLabel.style.color  = 'var(--neon-yellow)';
        elements.statusDescription.textContent = 'Реле активне — сонячна панель передає енергію до акумулятора.';
        elements.chargingBadge.style.display = 'flex';
    } else {
        if (status.status !== 'normal') elements.statusBanner.classList.add(status.status);
        const bannerIcons = { critical:'🚨', warning:'⚠️', normal:'✅', optimal:'🌟' };
        elements.statusIcon.textContent  = bannerIcons[status.status] || '●';
        elements.statusIcon.style.color  = status.color;
        elements.statusLabel.textContent = `Статус: ${status.label}`;
        elements.statusLabel.style.color  = status.color;
        const descs = { critical:'Система потребує негайної уваги!', warning:'Деякі показники вимагають уваги.', normal:'Система працює нормально.', optimal:'Всі системи на максимальній ефективності!' };
        elements.statusDescription.textContent = descs[status.status] || '';
        elements.chargingBadge.style.display = 'none';
    }
}

function updateRecommendations(recommendations) {
    if (!recommendations || !recommendations.length) {
        elements.recommendationsList.innerHTML = `<div class="recommendation-card info"><div class="rec-icon">📊</div><div class="rec-content"><p>Очікування даних...</p></div></div>`;
        return;
    }
    elements.recommendationsList.innerHTML = recommendations.map(rec =>
        `<div class="recommendation-card ${rec.type}"><div class="rec-icon">${rec.icon}</div><div class="rec-content"><p>${rec.message}</p></div></div>`
    ).join('');
}

// ===== ВІДПРАВКА КОМАНДИ =====
async function sendCmd(cmd) {
    // У демо-режимі просто логуємо
    if (isDemoMode) {
        console.log('[Demo] sendCmd:', cmd);
        return true;
    }
    if (!cmdChar) { showToast('Немає підключення до Arduino', 'error'); return false; }
    try {
        await cmdChar.writeValue(new TextEncoder().encode(cmd));
        return true;
    } catch (err) {
        showToast('Помилка відправки команди', 'error');
        return false;
    }
}

// ===== СЕРВО МОДАЛЬНЕ =====
function openServoModal()  { elements.servoModal.classList.add('open'); }
function closeServoModal() { elements.servoModal.classList.remove('open'); }

function updateServoVisual(angle) {
    const deg = angle - 90;
    elements.servoArrow.setAttribute('transform', `rotate(${deg}, 100, 100)`);
    elements.servoAngleValue.textContent = angle;
    const arcLen = 251;
    const offset = arcLen - (angle / 180) * arcLen;
    elements.servoArcProgress.style.strokeDashoffset = offset;
    const labels = { 0: 'Ліво', 90: 'Центр', 180: 'Право' };
    if (elements.servoStatus) elements.servoStatus.textContent = labels[angle] || `${angle}°`;
    if (elements.servoPositionLabel) elements.servoPositionLabel.textContent = labels[angle] || `${angle}°`;
}

async function handleServoClick(btn) {
    const angle = parseInt(btn.dataset.angle);
    const posLabels = { 0: 'servo:left', 90: 'servo:center', 180: 'servo:right' };
    const cmd = posLabels[angle];
    if (!cmd) return;
    const ok = await sendCmd(cmd);
    if (ok || !isConnected) {
        currentServoAngle = angle;
        updateServoVisual(angle);
        document.querySelectorAll('.servo-dir-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const names = { 0:'Ліво', 90:'Центр', 180:'Право' };
        showToast(`Панель повернута: ${names[angle]}`, 'success');
    }
}

// ===== TOAST =====
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span><span class="toast-message">${message}</span>`;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== BLE КНОПКА В HEADER =====
function addBLEButton() {
    const nav = document.querySelector('.header-nav');
    if (!nav) return;

    // Кнопка Bluetooth
    const btn = document.createElement('button');
    btn.id = 'bleConnectBtn';
    btn.className = 'nav-link';
    btn.style.cssText = 'background:rgba(0,255,204,0.1);border-color:rgba(0,255,204,0.3);color:var(--neon-teal);cursor:pointer;font-family:Rajdhani,sans-serif;';
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
        </svg>
        <span>Bluetooth</span>`;
    btn.addEventListener('click', () => {
        if (isConnected) {
            isDemoMode ? exitDemoMode() : disconnectBLE();
        } else {
            // Показуємо діалог: підключитись або демо
            showConnectDialog();
        }
    });

    nav.prepend(btn);
}

// ===== ДІАЛОГ ПІДКЛЮЧЕННЯ / ДЕМО =====
// Показується при кліку на кнопку Bluetooth (поки не підключено)
function showConnectDialog() {
    if (document.getElementById('connectDialog')) return;

    const overlay = document.createElement('div');
    overlay.id = 'connectDialog';
    overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9998;
        display:flex;align-items:center;justify-content:center;
    `;

    overlay.innerHTML = `
        <div style="
            background:var(--color-background-secondary,#1a1a2e);
            border:1px solid rgba(0,212,255,0.25);
            border-radius:16px;padding:28px;max-width:380px;width:90%;
            text-align:center;font-family:Rajdhani,sans-serif;
        ">
            <div style="font-size:40px;margin-bottom:12px;">📡</div>
            <h3 style="color:var(--neon-teal,#00d4ff);font-size:1.2rem;margin:0 0 8px;">
                Підключення до HelioCore
            </h3>
            <p style="color:var(--text-muted,#aaa);margin:0 0 20px;font-size:0.9rem;">
                Підключіться через Bluetooth або запустіть демо-режим без пристрою.
            </p>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
                <button id="dlgBleBtn" style="
                    background:rgba(0,212,255,0.12);border:1px solid #00d4ff;
                    color:#00d4ff;padding:10px 20px;border-radius:8px;
                    font-family:Rajdhani,sans-serif;font-size:0.95rem;cursor:pointer;
                ">🔷 Bluetooth</button>
                <button id="dlgDemoBtn" style="
                    background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.4);
                    color:#00ff88;padding:10px 20px;border-radius:8px;
                    font-family:Rajdhani,sans-serif;font-size:0.95rem;cursor:pointer;
                ">🔵 Демо-режим</button>
                <button id="dlgCancelBtn" style="
                    background:transparent;border:1px solid rgba(255,255,255,0.15);
                    color:var(--text-muted,#aaa);padding:10px 20px;border-radius:8px;
                    font-family:Rajdhani,sans-serif;font-size:0.95rem;cursor:pointer;
                ">✕ Скасувати</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('dlgBleBtn').addEventListener('click', () => {
        overlay.remove();
        connectBLE();
    });
    document.getElementById('dlgDemoBtn').addEventListener('click', () => {
        overlay.remove();
        enterDemoMode();
    });
    document.getElementById('dlgCancelBtn').addEventListener('click', () => {
        overlay.remove();
    });

    // Клік поза діалогом закриває його
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

function exitDemoMode() {
    stopDemoData();
    isDemoMode = false;
    setConnectionStatus(false);
    const btn = document.getElementById('bleConnectBtn');
    if (btn) {
        btn.classList.remove('connected');
        btn.querySelector('span').textContent = 'Bluetooth';
    }
    showToast('Демо-режим вимкнено', 'error');
}

// ===== ОБРОБНИК КНОПКИ АКБ =====
async function handleBatToggle() {
    const newState = !batRelayOn;
    const cmd = newState ? 'bat:on' : 'bat:off';
    if (!newState) {
        const confirmed = confirm('⚠️ Відключити акумулятор?\nРеле на піні 6 буде вимкнено.');
        if (!confirmed) return;
    }
    const ok = await sendCmd(cmd);
    if (ok) {
        batRelayOn = newState;
        updateBatRelayUI();
        showToast(
            newState ? 'Акумулятор підключено ✅' : 'Акумулятор відключено 🔋',
            newState ? 'success' : 'error'
        );
    }
}

// ===== ОБРОБНИКИ ПОДІЙ =====
function initEventListeners() {
    document.querySelectorAll('.control-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const action = button.dataset.action;
            if (action === 'eco-mode') {
                const newState = !relayOn;
                const ok = await sendCmd(newState ? 'relay:on' : 'relay:off');
                if (ok) showToast(newState ? 'Збереження енергії увімкнено ⚡' : 'Збереження енергії вимкнено', 'success');
            } else if (action === 'boost-charge') {
                const ok = await sendCmd('relay:on');
                if (ok) showToast('Прискорена зарядка активована ⚡', 'success');
            } else if (action === 'servo-panel') {
                openServoModal();
            } else if (action === 'reset') {
                showToast('Команда перезавантаження відправлена', 'success');
                sendCmd('reset');
            } else if (action === 'calibrate') {
                // Надсилаємо команду calibrate — Arduino відповість 'cal:align'
                // що запустить showCalibrationPrompt()
                showToast('Запит калібрування відправлено...', 'success');
                const ok = await sendCmd('calibrate');
                // У демо-режимі — одразу показуємо промпт
                if (ok && isDemoMode) {
                    setTimeout(showCalibrationPrompt, 500);
                }
            } else if (action === 'bat-toggle') {
                handleBatToggle();
            }
        });
    });

    const batBtn = document.querySelector('.bat-btn');
    if (batBtn && !batBtn.classList.contains('control-btn')) {
        batBtn.addEventListener('click', handleBatToggle);
    }

    document.querySelectorAll('.servo-dir-btn').forEach(btn => {
        btn.addEventListener('click', () => handleServoClick(btn));
    });

    document.getElementById('servoModalClose').addEventListener('click', closeServoModal);
    elements.servoModal.addEventListener('click', (e) => { if (e.target === elements.servoModal) closeServoModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeServoModal(); });
}

// ===== ІНІЦІАЛІЗАЦІЯ =====
function init() {
    addBLEButton();
    initEventListeners();
    setConnectionStatus(false);
    updateServoVisual(90);
    updateBatRelayUI();

    if (!navigator.bluetooth) {
        elements.statusDescription.textContent = 'Web Bluetooth недоступний. Використовуйте Chrome на ПК або Android. Доступний демо-режим.';
    }
}

function setConnectionStatus(connected) {
    isConnected = connected;
    const text = elements.connectionStatus.querySelector('.status-text');
    if (connected) {
        elements.connectionStatus.classList.remove('disconnected');
        text.textContent = isDemoMode ? 'Демо-режим' : 'Підключено';
        elements.lastUpdate.textContent = new Date().toLocaleTimeString('uk-UA');
    } else {
        elements.connectionStatus.classList.add('disconnected');
        text.textContent = 'Відключено';
    }
}

document.addEventListener('DOMContentLoaded', init);