// models/User.js
const { getDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb'); // Добавляем импорт

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
            id: result.insertedId.toString(), // Преобразуем ObjectId в строку
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
        
        console.log('🔍 Поиск пользователя по ID:', userId);
        
        try {
            // Пробуем найти как по строке, так и по ObjectId
            let user = await usersCollection.findOne(
                { _id: new ObjectId(userId) },
                { 
                    projection: { 
                        password: 0,
                        'medicalProfile.notes': 0
                    } 
                }
            );
            
            // Если не нашли по ObjectId, пробуем найти по строке (как в логине)
            if (!user) {
                console.log('🔄 Пробуем найти пользователя по строковому ID...');
                user = await usersCollection.findOne(
                    { _id: userId },
                    { 
                        projection: { 
                            password: 0,
                            'medicalProfile.notes': 0
                        } 
                    }
                );
            }
            
            console.log('✅ Результат поиска пользователя:', user ? 'найден' : 'не найден');
            return user;
            
        } catch (error) {
            console.error('❌ Ошибка при поиске пользователя:', error);
            return null;
        }
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
        
        let result;
        try {
            // Пробуем обновить по ObjectId
            result = await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: updateData }
            );
            
            // Если не нашли, пробуем по строке
            if (result.matchedCount === 0) {
                result = await usersCollection.updateOne(
                    { _id: userId },
                    { $set: updateData }
                );
            }
            
        } catch (error) {
            console.error('❌ Ошибка при обновлении медицинского профиля:', error);
            return false;
        }
        
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
        
        let result;
        try {
            // Пробуем обновить по ObjectId
            result = await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: updateData }
            );
            
            // Если не нашли, пробуем по строке
            if (result.matchedCount === 0) {
                result = await usersCollection.updateOne(
                    { _id: userId },
                    { $set: updateData }
                );
            }
            
        } catch (error) {
            console.error('❌ Ошибка при обновлении персональных данных:', error);
            return false;
        }
        
        return result.modifiedCount > 0;
    }
    
    // Метод для обновления времени последнего входа
    static async updateLastLogin(userId) {
        const db = getDatabase();
        const usersCollection = db.collection('users');
        
        try {
            // Пробуем обновить по ObjectId
            let result = await usersCollection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: { lastLogin: new Date() } }
            );
            
            // Если не нашли, пробуем по строке
            if (result.matchedCount === 0) {
                await usersCollection.updateOne(
                    { _id: userId },
                    { $set: { lastLogin: new Date() } }
                );
            }
        } catch (error) {
            console.error('❌ Ошибка при обновлении lastLogin:', error);
        }
    }
}

module.exports = User;