-- ТУТ ТРЕБА ПІДКЛЮЧИТИ POSTGRESQL
-- Створення таблиці для зберігання даних енергії

CREATE TABLE IF NOT EXISTS energy_data (
    id SERIAL PRIMARY KEY,
    voltage FLOAT NOT NULL,
    battery INT NOT NULL,
    light INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ЦЕ ТЕСТОВІ ДАНІ ДЛЯ ІМІТАЦІЇ ESP32
-- Вставка тестових даних для демонстрації роботи системи

INSERT INTO energy_data (voltage, battery, light, created_at) VALUES
    (12.5, 85, 750, NOW() - INTERVAL '10 minutes'),
    (12.3, 82, 680, NOW() - INTERVAL '9 minutes'),
    (11.8, 75, 450, NOW() - INTERVAL '8 minutes'),
    (11.2, 68, 320, NOW() - INTERVAL '7 minutes'),
    (10.8, 55, 180, NOW() - INTERVAL '6 minutes'),
    (10.5, 45, 120, NOW() - INTERVAL '5 minutes'),
    (10.2, 35, 80, NOW() - INTERVAL '4 minutes'),
    (9.8, 18, 50, NOW() - INTERVAL '3 minutes'),
    (9.5, 12, 30, NOW() - INTERVAL '2 minutes'),
    (11.5, 65, 520, NOW() - INTERVAL '1 minute');
