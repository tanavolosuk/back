// config/database.js
// Файл для подключения к MongoDB

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Создаем клиент MongoDB
const client = new MongoClient(process.env.MONGODB_URI);

// Переменная для хранения подключения к базе данных
let database;

// Функция для подключения к базе данных
async function connectToDatabase() {
    try {
        // Подключаемся к MongoDB
        await client.connect();
        console.log('✅ Успешно подключились к MongoDB');
        
        // Выбираем базу данных
        database = client.db();
        
        return database;
    } catch (error) {
        console.error('❌ Ошибка подключения к MongoDB:', error);
        process.exit(1); // Завершаем процесс при ошибке
    }
}

// Функция для получения подключения к базе данных
function getDatabase() {
    if (!database) {
        throw new Error('База данных не подключена! Сначала вызовите connectToDatabase()');
    }
    return database;
}

// Функция для закрытия подключения
async function closeDatabase() {
    await client.close();
    console.log('🔌 Подключение к MongoDB закрыто');
}

module.exports = {
    connectToDatabase,
    getDatabase,
    closeDatabase
};