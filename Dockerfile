# Dockerfile для Spring Boot приложения ProstorApp

# Сборка приложения
FROM gradle:8.14.3-jdk21-alpine AS builder
WORKDIR /app

# Копируем ВСЕ файлы проекта
COPY . .

# Права на выполнение gradlew (на всякий случай)
RUN chmod +x gradlew

# Сборка приложения
RUN ./gradlew build --no-daemon -x test

# Запуск приложения
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Копируем собранный JAR
COPY --from=builder /app/build/libs/*.jar app.jar

# Создаем не-root пользователя для безопасности
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Открываем порт Spring Boot
EXPOSE 8080

# Запускаем приложение
ENTRYPOINT ["java", "-jar", "app.jar"]