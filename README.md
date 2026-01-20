## Prostor

Маркетплейс для продажи и покупки товаров. Полнофункциональное веб-приложение с бэкендом на Spring Boot и фронтендом на React.

---

## **ДЛЯ ТЕСТА/ПРОД:**
```bash
# 1. Клонируй
git clone https://github.com/ваш-логин/prostor-marketplace.git
cd prostor-marketplace

# 2. Запусти
docker-compose up -d

# 3. Открой
# - Фронт: http://localhost:3001
# - API: http://localhost:8080
# - БД: http://localhost:8081 (adminer)

# 4. Останови (когда надоест)
docker-compose down
```

---

## **ДЛЯ РАЗРАБОТЧИКОВ:**
### **Общие требования:**
- **Java 17+** (для бэка)
- **Node.js 18+** и **npm** (для фронта)
- **Docker** и **Docker Compose** (для БД)
- **IntelliJ IDEA** (рекомендуется для бэка)
- **VS Code** (рекомендуется для фронта)

---

### ** Бэкенд-разработчик (Java/Spring):**

1. **Установи:**
```bash
# Проверь Java
java -version  # должна быть 17+
```

2. **Настрой проект:**
```bash
# Запусти только БД
docker-compose up -d postgres adminer

# Открой бэкенд в IDEA
# Файл → Открыть → папка backend/
```

3. **Запусти из IDEA:**
- Открой `ProstorAppApplication.java`
- Нажми зеленую стрелку (Run)
- API будет на http://localhost:8080

---

### ** Фронтенд-разработчик (React/TS):**

1. **Установи:**
```bash
# Проверь Node.js
node -v  # должна быть 18+
npm -v
```

2. **Настрой проект:**
```bash
# Запусти БД и бэкенд
docker-compose up -d postgres adminer backend

# Перейди во фронтенд
cd frontend

# Установи зависимости
npm install

# Запусти дев-сервер
npm run dev
```

3. **Работай:**
- Код в `frontend/src/`
- Дев-сервер: http://localhost:3000
- Прокси на API: http://localhost:8080

---

### ** Разработчик БД (PostgreSQL):**

1. **Доступ к БД:**
```bash
# Запусти БД
docker-compose up -d postgres

# Подключись через psql
docker exec -it prostor-db psql -U developer -d prostor_dev

# Или через Adminer
# http://localhost:8081
```

2. **Данные для подключения:**
- Хост: `localhost:5432`
- База: `prostor_dev`
- Пользователь: `developer`
- Пароль: `dev123`

---

## **СТРУКТУРА ПРОЕКТА:**

```
prostor-marketplace/
├── backend/                 # Spring Boot
│   ├── src/main/java/      ← ТУТ КОД JAVA
│   ├── src/main/resources/ ← application.yml, миграции
│   └── pom.xml
├── frontend/                # React
│   ├── src/                ← ТУТ КОД REACT
│   │   ├── components/     # Компоненты
│   │   ├── pages/          # Страницы
│   │   └── App.tsx         # Главный компонент
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml       # Запуск всего
```

---

## **ПОЛЕЗНЫЕ ССЫЛКИ:**

### При запущенном проекте:
- **Фронтенд:** http://localhost:3001 (продакшен)
- **Фронтенд (дев):** http://localhost:3000 (для разработки)
- **API:** http://localhost:8080
- **Swagger:** http://localhost:8080/swagger-ui.html
- **Adminer (БД):** http://localhost:8081
- **Health check:** http://localhost:8080/actuator/health

---

## **ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ:**

```bash
# 1. Проверь контейнеры
docker-compose ps

# 2. Посмотри логи
docker-compose logs backend

# 3. Пересобери
docker-compose up -d --build

# 4. Спроси у того, кто знает
```

---

##  **СОВЕТЫ:**

1. **Для разработки бэка** запускай только БД через Docker, а Spring Boot — из IDEA
2. **Для разработки фронта** запускай БД+бэк через Docker, а React — через npm run dev
3. **Миграции БД** автоматически применяются при запуске Spring Boot
4. **Не коммить** `.env` файлы, `target/`, `node_modules/`

---

*P.S. Если все равно не работает — перезагрузи компьютер, 90% проблем решаются* 