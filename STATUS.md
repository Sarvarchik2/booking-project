# ✅ СИСТЕМА ПОЛНОСТЬЮ ЗАПУЩЕНА И РАБОТАЕТ!

## 🌐 Доступ к Приложению

- **Frontend (React)**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **База данных**: SQLite (автоматически создана)

---

## 👥 ДВА ТИПА ПОЛЬЗОВАТЕЛЕЙ

### 1️⃣ **КЛИЕНТЫ** (Customers)
Регистрируются через форму на сайте

**Возможности:**
- ✅ Регистрация и вход
- 🚗 Управление автомобилями
- 📅 Бронирование услуг
- 💰 Просмотр счетов
- ⭐ Оставление отзывов
- 📊 Просмотр истории

**Как попробовать:**
1. Откройте http://localhost:3000
2. Нажмите "Register"
3. Создайте аккаунт
4. Добавьте автомобиль
5. Забронируйте услугу

---

### 2️⃣ **МЕХАНИКИ** (Mechanics)
Предзагружены 5 аккаунтов

| Механик | Email | Пароль | Специализация |
|---------|-------|--------|---------------|
| John Smith | `john.smith@garage.com` | `mechanic123` | Двигатели |
| Maria Garcia | `maria.garcia@garage.com` | `mechanic123` | Тормоза |
| David Chen | `david.chen@garage.com` | `mechanic123` | Трансмиссия |
| Sarah Johnson | `sarah.johnson@garage.com` | `mechanic123` | Электрика |
| Michael Brown | `michael.brown@garage.com` | `mechanic123` | Общее обслуживание |

**Возможности:**
- ✅ Вход в систему
- 📊 Личная панель управления
- 📅 Просмотр назначенных бронирований
- ⚙️ Управление статусом работ
- ⭐ Просмотр отзывов клиентов
- 📈 Статистика и рейтинг

**Как попробовать:**
1. Откройте http://localhost:3000
2. Нажмите "**Mechanic Login**"
3. Email: `john.smith@garage.com`
4. Пароль: `mechanic123`
5. Войдите в панель управления

---

## 🔄 ПОЛНЫЙ РАБОЧИЙ ЦИКЛ

### Шаг 1: Клиент бронирует услугу
1. Регистрация клиента
2. Добавление автомобиля
3. Выбор услуги и даты
4. Создание бронирования

### Шаг 2: Назначение механика (через API)
```bash
curl -X PUT http://localhost:5001/api/bookings/1/assign-mechanic \
  -H "Content-Type: application/json" \
  -d '{"mechanic_id": 1}'
```

### Шаг 3: Механик выполняет работу
1. Вход механика
2. Просмотр бронирования
3. Нажимает "Start Work" (Scheduled → In Progress)
4. Выполняет обслуживание
5. Нажимает "Complete" (In Progress → Completed)

### Шаг 4: Клиент оставляет отзыв
1. Вход клиента
2. Переход в "Bookings"
3. Нажимает "Give Feedback"
4. Ставит оценку (1-5 звезд)
5. Пишет комментарий

### Шаг 5: Механик видит отзыв
1. Вход механика
2. Вкладка "Customer Feedback"
3. Просмотр рейтинга и комментария

---

## 📊 ПРЕДЗАГРУЖЕННЫЕ ДАННЫЕ

### Услуги (9 типов):
- Oil Change - $49.99
- Brake Inspection - $79.99
- Tire Rotation - $39.99
- Engine Diagnostic - $99.99
- Transmission Service - $149.99
- Air Conditioning Service - $129.99
- Battery Replacement - $149.99
- Wheel Alignment - $89.99
- Full Service - $299.99

### Механики (5 человек):
- Все с паролем `mechanic123`
- Разные специализации
- Готовы к назначению

---

## 🛠️ УПРАВЛЕНИЕ СЕРВЕРАМИ

### Проверить статус:
```bash
# Backend
lsof -ti:5001

# Frontend
lsof -ti:3000
```

### Остановить серверы:
```bash
# Остановить оба
lsof -ti:3000 -ti:5001 | xargs kill -9
```

### Запустить заново:

**Backend:**
```bash
cd /Users/student/Desktop/project
PORT=5001 node backend/server.js
```

**Frontend:**
```bash
/Users/student/Desktop/project/start-frontend.sh
```

---

## 📁 ВАЖНЫЕ ФАЙЛЫ

### Конфигурация:
- `.env` - настройки окружения
- `start-frontend.sh` - скрипт запуска frontend

### База данных:
- `backend/vehicle_service.db` - SQLite БД

### Документация:
- `README.md` - основная документация
- `MECHANIC_GUIDE.md` - руководство для механиков
- `TESTING_GUIDE_RU.md` - сценарии тестирования
- `QUICK_START_RU.md` - быстрый старт
- `MECHANIC_QUICK_REF.md` - краткая справка

---

## ⚡ БЫСТРЫЕ ССЫЛКИ

### Вход:
- **Клиенты**: http://localhost:3000/login
- **Механики**: http://localhost:3000/mechanic-login
- **Регистрация**: http://localhost:3000/register

### API:
- **Health Check**: http://localhost:5001/api/health
- **Все endpoints**: см. README.md

---

## 🎯 ЧТО ПОПРОБОВАТЬ

### Для клиентов:
1. ✅ Зарегистрироваться
2. 🚗 Добавить автомобиль
3. 📅 Забронировать услугу
4. 📊 Посмотреть dashboard
5. 📜 Просмотреть историю

### Для механиков:
1. ✅ Войти с любым email механика
2. 📊 Увидеть статистику
3. ⚙️ Управлять бронированиями
4. ⭐ Просмотреть отзывы

---

## 🐛 РЕШЕНИЕ ПРОБЛЕМ

### Backend не отвечает?
```bash
# Перезапустить
lsof -ti:5001 | xargs kill -9
cd /Users/student/Desktop/project
PORT=5001 node backend/server.js
```

### Frontend не загружается?
```bash
# Перезапустить
lsof -ti:3000 | xargs kill -9
/Users/student/Desktop/project/start-frontend.sh
```

### База данных повреждена?
```bash
# Пересоздать
rm backend/vehicle_service.db
# Перезапустить backend (автоматически создаст новую БД)
```

### Механики не могут войти?
```bash
# Установить пароли заново
cd /Users/student/Desktop/project
node backend/setup-mechanics.js
```

---

## 🎉 ВСЁ ГОТОВО!

**Система полностью функциональна:**
- ✅ Backend запущен (порт 5001)
- ✅ Frontend запущен (порт 3000)
- ✅ База данных создана
- ✅ 5 механиков с аккаунтами
- ✅ 9 типов услуг
- ✅ Двойная система входа
- ✅ Полный workflow

**Откройте http://localhost:3000 и начните работу!** 🚀

---

**Пароль для всех механиков: `mechanic123`** 🔐
