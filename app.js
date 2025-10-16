// app.js
// Обновленный главный файл приложения

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Импортируем наши модули
const { connectToDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile'); // НОВЫЙ импорт

// Создаем Express приложение
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Подключаем маршруты
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes); // НОВЫЙ маршрут

// Базовый маршрут для проверки работы сервера
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Сервер аутентификации и медицинского профиля работает!',
        timestamp: new Date().toISOString(),
        version: '1.1.0'
    });
});

// Маршрут для проверки здоровья сервера
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'Connected' // Можно добавить проверку подключения к БД
    });
});

// Обработка несуществующих маршрутов
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден'
    });
});

// Обработка ошибок
app.use((error, req, res, next) => {
    console.error('Необработанная ошибка:', error);
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
    });
});

// Функция запуска сервера
async function startServer() {
    try {
        // Сначала подключаемся к базе данных
        await connectToDatabase();
        
        // Затем запускаем сервер
        app.listen(PORT, () => {
            console.log(`🚀 Сервер запущен на порту ${PORT}`);
            console.log(`📊 Режим: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 URL: http://localhost:${PORT}`);
            console.log(`📝 Доступные API: /api/auth, /api/profile`);
        });
        
    } catch (error) {
        console.error('❌ Не удалось запустить сервер:', error);
        process.exit(1);
    }
}

// Обработка graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Получен SIGINT. Завершение работы...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Получен SIGTERM. Завершение работы...');
    process.exit(0);
});

// Запускаем сервер
startServer();