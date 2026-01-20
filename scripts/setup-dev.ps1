Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Prostor Marketplace - Настройка         " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка Docker
Write-Host "[1/3] Проверка Docker..." -ForegroundColor Green
try {
    docker --version | Out-Null
    Write-Host "  ✅ Docker установлен" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker не установлен" -ForegroundColor Red
    Write-Host "  Скачайте: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Запуск базы данных
Write-Host "[2/3] Запуск базы данных PostgreSQL..." -ForegroundColor Green
docker-compose -f docker/docker-compose.db.yml up -d

Write-Host "  ⏳ Ожидание запуска БД..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Проверка запуска
Write-Host "[3/3] Проверка запущенных сервисов..." -ForegroundColor Green
docker ps --filter "name=prostor" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "✅ Настройка завершена!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Сервисы доступны:" -ForegroundColor Cyan
Write-Host "  • База данных:     localhost:5432" -ForegroundColor White
Write-Host "     - Database: prostor_dev" -ForegroundColor Gray
Write-Host "     - User: developer" -ForegroundColor Gray
Write-Host "     - Password: dev123" -ForegroundColor Gray
Write-Host ""
Write-Host "  • Adminer (UI БД): http://localhost:8081" -ForegroundColor White
Write-Host ""
Write-Host "⚡ Следующие шаги:" -ForegroundColor Yellow
Write-Host "  1. Запустите бэкенд: ./gradlew bootRun" -ForegroundColor White
Write-Host "  2. Запустите фронтенд: cd frontend && npm install && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Команды управления:" -ForegroundColor Magenta
Write-Host "  Остановить БД:    docker-compose -f docker/docker-compose.db.yml down" -ForegroundColor Gray
Write-Host "  Просмотр логов:   docker-compose -f docker/docker-compose.db.yml logs -f" -ForegroundColor Gray