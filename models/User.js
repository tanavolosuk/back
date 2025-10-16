// models/User.js
// Модель пользователя - определяет структуру данных пользователя

const { getDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Метод для создания нового пользователя
    static async create(userData) {
        const db = getDatabase();
        const usersCollection = db.collection('users');
        
        // Проверяем, существует ли пользователь с таким username
        const existingUser = await usersCollection.findOne({ 
            username: userData.username 
        });
        
        if (existingUser) {
            throw new Error('Пользователь с таким именем уже существует');
        }
        
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        // Создаем объект пользователя
        const user = {
            username: userData.username,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        // Сохраняем пользователя в базу данных
        const result = await usersCollection.insertOne(user);
        
        return {
            id: result.insertedId,
            username: user.username,
            createdAt: user.createdAt
        };
    }
    
    // Метод для поиска пользователя по username
    static async findByUsername(username) {
        const db = getDatabase();
        const usersCollection = db.collection('users');
        
        return await usersCollection.findOne({ username });
    }
    
    // Метод для проверки пароля
    static async checkPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    
    // Метод для получения пользователя по ID (без пароля)
    static async findById(userId) {
        const db = getDatabase();
        const usersCollection = db.collection('users');
        
        const user = await usersCollection.findOne(
            { _id: userId },
            { projection: { password: 0 } } // Исключаем пароль из результата
        );
        
        return user;
    }
}

module.exports = User;