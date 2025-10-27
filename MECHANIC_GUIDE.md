# 🔧 Mechanic Account Setup Guide

## Overview
Механики теперь имеют собственные аккаунты для входа в систему и управления своими бронированиями!

## Features for Mechanics

### ✅ Функционал:
- 🔐 Вход в систему с email и паролем
- 📊 Личная панель управления
- 📅 Просмотр назначенных бронирований
- ⚙️ Обновление статуса работ (Запланировано → В работе → Завершено)
- ⭐ Просмотр отзывов клиентов
- 📈 Статистика (общие бронирования, средний рейтинг)

## Default Login Credentials

После запуска скрипта настройки, все механики получают пароль по умолчанию: **`mechanic123`**

### Mechanic Accounts:

1. **John Smith** - Engine Specialist
   - Email: `john.smith@garage.com`
   - Password: `mechanic123`

2. **Maria Garcia** - Brake Systems
   - Email: `maria.garcia@garage.com`
   - Password: `mechanic123`

3. **David Chen** - Transmission Expert
   - Email: `david.chen@garage.com`
   - Password: `mechanic123`

4. **Sarah Johnson** - Electrical Systems
   - Email: `sarah.johnson@garage.com`
   - Password: `mechanic123`

5. **Michael Brown** - General Maintenance
   - Email: `michael.brown@garage.com`
   - Password: `mechanic123`

## Setup Instructions

### 1. Initialize Mechanic Passwords

Запустите скрипт для установки паролей:

```bash
cd /Users/student/Desktop/project
node backend/setup-mechanics.js
```

### 2. Access Mechanic Portal

1. Откройте http://localhost:3000
2. Нажмите "Mechanic Login" в навигации
3. Введите email механика
4. Введите пароль: `mechanic123`

### 3. Change Password (Optional)

Механики могут использовать страницу "Set up your password" для установки собственного пароля.

## Mechanic Dashboard Features

### 📊 Statistics
- Общее количество бронирований
- Бронирования на сегодня
- Завершенные работы
- Средний рейтинг

### 📅 My Bookings
- Просмотр всех назначенных бронирований
- Информация о клиенте и автомобиле
- Детали услуги
- **Управление статусом:**
  - "Scheduled" → Кнопка "Start Work" → "In Progress"
  - "In Progress" → Кнопка "Complete" → "Completed"

### ⭐ Customer Feedback
- Просмотр всех отзывов от клиентов
- Рейтинги (1-5 звезд)
- Комментарии

## Workflow Example

### Сценарий работы механика:

1. **Вход в систему**
   ```
   Email: john.smith@garage.com
   Password: mechanic123
   ```

2. **Просмотр Dashboard**
   - Видит назначенные бронирования
   - Проверяет статистику

3. **Начало работы**
   - Находит бронирование со статусом "Scheduled"
   - Нажимает "Start Work"
   - Статус меняется на "In Progress"

4. **Завершение работы**
   - Заканчивает обслуживание
   - Нажимает "Complete"
   - Статус меняется на "Completed"
   - Клиент может оставить отзыв

5. **Просмотр отзывов**
   - Переключается на вкладку "Customer Feedback"
   - Видит рейтинги и комментарии

## API Endpoints for Mechanics

### Authentication
```
POST /api/mechanics/login
Body: { email, password }
Response: { mechanic, token }
```

### Set Password
```
POST /api/mechanics/set-password
Body: { email, password }
```

### Get Mechanic Bookings
```
GET /api/mechanics/:id/bookings
Response: Array of bookings
```

### Get Mechanic Feedback
```
GET /api/feedback?mechanicId=:id
GET /api/feedback/mechanic/:id/average
```

### Update Booking Status
```
PUT /api/bookings/:id/status
Body: { status, actual_completion }
```

## Database Schema Update

Поле `password_hash` добавлено в таблицу `mechanics`:

```sql
CREATE TABLE mechanics (
  mechanic_id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,  -- NEW FIELD
  phone TEXT,
  specialization TEXT,
  hourly_rate REAL,
  is_available INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Security Notes

⚠️ **Important:**
- Пароль по умолчанию `mechanic123` следует изменить в продакшене
- Механики должны установить собственные пароли при первом входе
- JWT токены используются для аутентификации
- Пароли хешируются с помощью bcrypt

## Troubleshooting

### Не можете войти?
```bash
# Переустановите пароли
node backend/setup-mechanics.js
```

### Забыли пароль?
Используйте страницу "Set up your password" для сброса.

---

**Happy Servicing!** 🔧
