# Этап 1: сборка приложения
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# Сначала зависимости — для эффективного кэширования слоёв
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B clean package -DskipTests

# Этап 2: запуск
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/tourfirm-backend-1.0.0.jar app.jar
# Каталог для загружаемых документов
RUN mkdir -p /app/uploads
ENV UPLOAD_DIR=/app/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
