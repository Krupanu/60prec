# Tour Firm Backend

Backend программного средства для автоматизации работы тур-фирмы.
Java 17, Spring Boot 3.3, Spring Security + JWT, Spring Data JPA, PostgreSQL 16, Liquibase, springdoc-openapi (Swagger UI).

## Запуск локально

Требования: JDK 17, Maven 3.9+, PostgreSQL 16 (БД `tourfirm`).

```bash
# создать БД (один раз)
psql -U postgres -c "CREATE DATABASE tourfirm;"

# запуск (миграции Liquibase применятся автоматически, включая начальные данные)
mvn spring-boot:run
```

Swagger UI: http://localhost:8080/swagger-ui.html

## Запуск в Docker

```bash
docker build -t tourfirm-backend .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/tourfirm \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  -e JWT_SECRET=change-me-please-change-me-32bytes \
  tourfirm-backend
```

## Тесты

```bash
mvn test          # unit (Mockito) + интеграционные (H2, профиль test)
```

## Переменные окружения

| Переменная | По умолчанию | Назначение |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/tourfirm` | URL БД |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Пользователь БД |
| `SPRING_DATASOURCE_PASSWORD` | `postgres` | Пароль БД |
| `JWT_SECRET` | dev-строка (только для разработки) | Секрет подписи JWT (≥32 байт) |
| `JWT_EXPIRATION_MS` | `86400000` | Время жизни токена, мс |
| `UPLOAD_DIR` | `./uploads` | Каталог загрузки документов |
| `SERVER_PORT` | `8080` | Порт сервера |

## Учётные записи (начальные данные, пароль у всех — `password123`)

| Email | Роль |
|---|---|
| manager@tour.by | MANAGER |
| vehicle@tour.by | VEHICLE_OWNER |
| client@tour.by | CLIENT |

Промокоды: `SUMMER10` (скидка 10%), `WELCOME5` (скидка 5%).

## Структура API

Базовый путь: `/api/v1`. Основные группы: `/auth`, `/tours`, `/bookings`,
`/favorites`, `/promocodes`, `/transports`, `/trips`, `/users`, `/profile`,
документы рейсов (`/trips/{id}/documents`, `/documents/{id}/download`).
Полное описание — в Swagger UI.
