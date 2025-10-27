# 🎯 Руководство по Тестированию Системы Механиков

## ✅ Система Готова!

### 🌐 URLs:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

---

## 👨‍🔧 Тестирование Аккаунтов Механиков

### Учетные данные для входа:

| Механик | Email | Пароль | Специализация |
|---------|-------|--------|---------------|
| John Smith | `john.smith@garage.com` | `mechanic123` | Engine Specialist |
| Maria Garcia | `maria.garcia@garage.com` | `mechanic123` | Brake Systems |
| David Chen | `david.chen@garage.com` | `mechanic123` | Transmission Expert |
| Sarah Johnson | `sarah.johnson@garage.com` | `mechanic123` | Electrical Systems |
| Michael Brown | `michael.brown@garage.com` | `mechanic123` | General Maintenance |

---

## 📝 Пошаговый Сценарий Тестирования

### Сценарий 1: Вход Механика

1. Откройте http://localhost:3000
2. Нажмите "**Mechanic Login**" в навигации
3. Введите:
   - Email: `john.smith@garage.com`
   - Password: `mechanic123`
4. Нажмите "Login"
5. ✅ Вы должны увидеть панель управления механика

### Сценарий 2: Создание Бронирования (от имени клиента)

**Шаг 1: Регистрация клиента**
1. Logout (если вошли как механик)
2. Нажмите "**Register**"
3. Заполните форму:
   - First Name: Test
   - Last Name: Customer
   - Email: test@customer.com
   - Password: test123
   - Phone: 555-1234
4. Нажмите "Register"

**Шаг 2: Добавить автомобиль**
1. Перейдите в "**My Vehicles**"
2. Нажмите "+ Add Vehicle"
3. Заполните:
   - Make: Toyota
   - Model: Camry
   - Year: 2020
   - Color: Silver
   - License Plate: ABC123
4. Нажмите "Add Vehicle"

**Шаг 3: Забронировать услугу**
1. Нажмите "**Book Service**"
2. Выберите автомобиль
3. Выберите услугу (например, "Oil Change")
4. Выберите дату (сегодня или завтра)
5. Выберите время
6. Нажмите "Book Service"

### Сценарий 3: Назначение Механика (Admin action через API)

Выполните в терминале:
```bash
curl -X PUT http://localhost:5001/api/bookings/1/assign-mechanic \
  -H "Content-Type: application/json" \
  -d '{"mechanic_id": 1}'
```

Или используйте простой скрипт:
```bash
cd /Users/student/Desktop/project
node -e "
const axios = require('axios');
axios.put('http://localhost:5001/api/bookings/1/assign-mechanic', 
  { mechanic_id: 1 })
  .then(r => console.log('✅ Mechanic assigned:', r.data))
  .catch(e => console.error('Error:', e.response?.data || e.message));
"
```

### Сценарий 4: Работа Механика

**Шаг 1: Вход механика**
1. Logout
2. Нажмите "**Mechanic Login**"
3. Email: `john.smith@garage.com`
4. Password: `mechanic123`

**Шаг 2: Просмотр бронирований**
1. Вы увидите назначенное бронирование
2. Проверьте детали:
   - Дата и время
   - Информация о клиенте
   - Детали автомобиля
   - Тип услуги

**Шаг 3: Начать работу**
1. Найдите бронирование со статусом "**scheduled**"
2. Нажмите кнопку "**Start Work**"
3. ✅ Статус должен измениться на "in_progress"

**Шаг 4: Завершить работу**
1. Нажмите кнопку "**Complete**"
2. ✅ Статус должен измениться на "completed"

### Сценарий 5: Отзыв Клиента

**Шаг 1: Вход клиента**
1. Logout
2. Customer Login
3. Email: `test@customer.com`
4. Password: `test123`

**Шаг 2: Оставить отзыв**
1. Перейдите в "**Bookings**"
2. Найдите завершенное бронирование
3. Нажмите "**Give Feedback**"
4. Выберите рейтинг (1-5 звезд)
5. Напишите комментарий
6. Нажмите "Submit Feedback"

**Шаг 3: Проверить отзыв механика**
1. Logout и войдите как механик
2. Перейдите на вкладку "**Customer Feedback**"
3. ✅ Вы должны увидеть отзыв клиента

---

## 🔍 Что Проверить

### Dashboard Механика:
- ✅ Отображается имя механика
- ✅ Показывается специализация
- ✅ Статистика бронирований
- ✅ Средний рейтинг
- ✅ Список бронирований
- ✅ Кнопки управления статусом
- ✅ Отзывы клиентов

### Управление Бронированиями:
- ✅ Кнопка "Start Work" для статуса "scheduled"
- ✅ Кнопка "Complete" для статуса "in_progress"
- ✅ Обновление статуса в реальном времени
- ✅ Корректное отображение информации

### Feedback:
- ✅ Отображение звезд рейтинга
- ✅ Показ комментариев
- ✅ Информация о клиенте
- ✅ Дата отзыва

---

## 🐛 Troubleshooting

### Не можете войти как механик?
```bash
# Пересоздайте пароли
cd /Users/student/Desktop/project
node backend/setup-mechanics.js
```

### Не видите бронирований?
1. Создайте бронирование как клиент
2. Назначьте механика через API (см. Сценарий 3)

### Ошибка "Invalid credentials"?
- Проверьте email (должен быть из списка механиков)
- Используйте пароль: `mechanic123`

---

## 📊 API Endpoints для Тестирования

### Назначить механика на бронирование:
```bash
PUT /api/bookings/:id/assign-mechanic
Body: { "mechanic_id": 1 }
```

### Обновить статус бронирования:
```bash
PUT /api/bookings/:id/status
Body: { "status": "in_progress" }
```

### Получить бронирования механика:
```bash
GET /api/mechanics/:id/bookings
```

### Получить отзывы механика:
```bash
GET /api/feedback?mechanicId=:id
GET /api/feedback/mechanic/:id/average
```

---

## ✨ Новые Возможности

1. **Dual Login System**
   - Customer Login
   - Mechanic Login

2. **Mechanic Dashboard**
   - Personalized view
   - Booking management
   - Feedback display

3. **Workflow Management**
   - Status transitions
   - Real-time updates
   - Performance tracking

4. **Rating System**
   - Customer feedback
   - Average rating calculation
   - Review history

---

**Приятного тестирования!** 🎉
