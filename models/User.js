// models/User.js
// Расширенная модель пользователя с медицинским профилем

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
        
        // Создаем объект пользователя с медицинским профилем
        const user = {
            // Базовые данные
            username: userData.username,
            password: hashedPassword,
            email: userData.email || '',
            
            // Персональные данные
            personalData: {
                fullName: userData.fullName || '',
                birthDate: userData.birthDate || null,
                gender: userData.gender || '', // 'male', 'female', 'other'
                phone: userData.phone || '',
                emergencyContact: userData.emergencyContact || ''
            },
            
            // Медицинский профиль
            medicalProfile: {
                bloodType: userData.bloodType || '', // 'A+', 'A-', 'B+', etc.
                height: userData.height || null, // в см
                weight: userData.weight || null, // в кг
                chronicDiseases: userData.chronicDiseases || [],
                allergies: userData.allergies || [],
                currentMedications: userData.currentMedications || [],
                notes: userData.medicalNotes || ''
            },
            
            // Системные поля
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: null
        };
        
        // Сохраняем пользователя в базу данных
        const result = await usersCollection.insertOne(user);
        
        return {
            id: result.insertedId,
            username: user.username,
            email: user.email,
            personalData: user.personalData,
            createdAt: user.createdAt
        };
    }
    
    // Метод для поиска пользователя по username
    static async findByUsername(username) {
        const db = getDatabase();
        const usersCollection = db.collection('users');
        
        return await usersCollection.findOne({ username });
    }
    
    // Метод для получения пользователя по ID (без пароля)
    static async findById(userId) {
        const db = getDatabase();
        const usersCollection = db.collection('users');
        
        const user = await usersCollection.findOne(
            { _id: userId },
            { 
                projection: { 
                    password: 0, // Исключаем пароль
                    'medicalProfile.notes': 0 // Исключаем заметки по умолчанию
                } 
            }
        );
        
        return user;
    }
    
    // Метод для проверки пароля
    static async checkPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    
    // Метод для обновления медицинского профиля
    static async updateMedicalProfile(userId, medicalData) {
        const db = getDatabase();
        const usersCollection = db.collection('users');
        
        const updateData = {
            'medicalProfile': medicalData,
            'updatedAt': new Date()
        };
        
        const result = await usersCollection.updateOne(
            { _id: userId },
            { $set: updateData }
        );
        
        return result.modifiedCount > 0;
    }
    
    // Метод для обновления персональных данных
    static async updatePersonalData(userId, personalData) {
        const db = getDatabase();
        const usersCollection = db.collection('users');
        
        const updateData = {
            'personalData': personalData,
            'updatedAt': new Date()
        };
        
        const result = await usersCollection.updateOne(
            { _id: userId },
            { $set: updateData }
        );
        
        return result.modifiedCount > 0;
    }
    
    // Метод для обновления времени последнего входа
    static async updateLastLogin(userId) {
        const db = getDatabase();
        const usersCollection = db.collection('users');
        
        await usersCollection.updateOne(
            { _id: userId },
            { $set: { lastLogin: new Date() } }
        );
    }
}

module.exports = User;