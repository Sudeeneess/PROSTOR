# Dockerfile для Spring Boot
FROM gradle:8.14.3-jdk21-alpine AS builder
WORKDIR /app

COPY . .

RUN apk add --no-cache dos2unix && \
    dos2unix gradlew && \
    chmod +x gradlew

# Сборка приложения
RUN ./gradlew build --no-daemon -x test

# Запуск приложения
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]