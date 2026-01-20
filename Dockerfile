# Dockerfile для Spring Boot приложения ProstorApp

# Сборка приложения
FROM gradle:8.14.3-jdk21-alpine AS builder
WORKDIR /app

# файлы Gradle
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle .
COPY settings.gradle .
COPY src ./src

# права на выполнение gradlew
RUN chmod +x gradlew

# сборка приложения
RUN ./gradlew build --no-daemon -x test

# запуск приложения
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