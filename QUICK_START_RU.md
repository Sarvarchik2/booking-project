# 🚗 Быстрый Запуск / Quick Start

## ✅ Приложение Запущено!

### Серверы работают на:
- **Frontend (React)**: http://localhost:3000
- **Backend (API)**: http://localhost:5001

### База данных:
- **SQLite** (автоматически создана): `vehicle_service.db`
- Предзагружены образцы данных:
  - 9 типов услуг
  - 5 механиков

## 📝 Как использовать:

### 1. Регистрация
- Перейдите на http://localhost:3000
- Нажмите "Register"
- Заполните форму регистрации

### 2. Добавить автомобиль
- После входа перейдите в "My Vehicles"
- Нажмите "+ Add Vehicle"
- Введите данные автомобиля

### 3. Забронировать услугу
- Нажмите "Book Service"
- Выберите автомобиль и услугу
- Выберите дату и время
- Нажмите "Book Service"

### 4. Просмотреть историю
- Перейдите в "History"
- Смотрите бронирования, счета и отзывы

## 🔧 Команды для управления:

### Остановить серверы:
```bash
# Найти процессы
lsof -ti:3000 -ti:5001

# Остановить процессы
kill $(lsof -ti:3000 -ti:5001)
```

### Запустить заново:

**Backend:**
```bash
cd /Users/student/Desktop/project
PORT=5001 node backend/server.js
```

**Frontend:**
```bash
cd /Users/student/Desktop/project
./start-frontend.sh
```

Или используйте созданный скрипт:
```bash
# В одном терминале
cd /Users/student/Desktop/project
PORT=5001 node backend/server.js

# В другом терминале  
/Users/student/Desktop/project/start-frontend.sh
```

## 🎯 Основные возможности:

✅ Регистрация и вход клиентов
✅ Управление автомобилями
✅ Бронирование услуг
✅ Просмотр счетов
✅ Система отзывов (1-5 звезд)
✅ История обслуживания
✅ Dashboard с статистикой

## 📊 Образцы данных в БД:

### Услуги:
- Замена масла - $49.99
- Проверка тормозов - $79.99
- Ротация шин - $39.99
- Диагностика двигателя - $99.99
- И другие...

### Механики:
- John Smith - Специалист по двигателям
- Maria Garcia - Тормозные системы
- David Chen - Эксперт по трансмиссии
- Sarah Johnson - Электрические системы
- Michael Brown - Общее обслуживание

## 🐛 Устранение неполадок:

### Порт занят:
```bash
# Освободить порт 5001
lsof -ti:5001 | xargs kill -9

# Освободить порт 3000
lsof -ti:3000 | xargs kill -9
```

### Переустановить зависимости:
```bash
# Backend
cd /Users/student/Desktop/project
rm -rf node_modules
npm install

# Frontend
cd /Users/student/Desktop/project/frontend
rm -rf node_modules
npm install react-scripts@4.0.3 --legacy-peer-deps
```

## 📁 Важные файлы:

- **База данных**: `/Users/student/Desktop/project/backend/vehicle_service.db`
- **Backend**: `/Users/student/Desktop/project/backend/server.js`
- **Frontend**: `/Users/student/Desktop/project/frontend/src/`
- **Конфигурация**: `/Users/student/Desktop/project/.env`

---

**Приятного использования!** 🎉
