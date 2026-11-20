# Этап 60% — полный код без тестов и контейнеризации

Снапшот курсового проекта «Программное средство для автоматизации работы тур-фирмы» на отметке 60%.
Кодовая база backend и frontend полностью реализована; отсутствуют автотесты и Docker-окружение.

## Что реализовано

- Полный CRUD всех 10 сущностей (User, Tour, Booking, Transport, Trip, Review, Favorite, PromoCode, Document).
- Роли и разграничение доступа: CLIENT, VEHICLE_OWNER, MANAGER (Spring Security + JWT).
- Вся бизнес-логика: бронирование с расчётом стоимости, статусы заявок, имитация оплаты, отзывы и рейтинг, избранное, промокоды, рейсы и назначение транспорта, загрузка документов.
- Интерфейсы всех трёх ролей (React + TypeScript + MUI).
- UML-диаграммы (классы, последовательность, варианты использования, состояния заявки) — каталог `diagrams/`.
- ПЗ: разделы 2.2 (проектирование GUI), 2.3 (алгоритмы), 3.1 (ввод в эксплуатацию) — черновик `docs/draft_pz_60.md`.

## Чего нет (появится на следующих этапах)

- Автотесты (JUnit 5 + Mockito, интеграционные @SpringBootTest) — этап 90%.
- Настройка контейнеризации (Dockerfile присутствует, но docker-compose и отладка образов — на этапе 90%).
- ПЗ: раздел 3.2 (руководство по эксплуатации) и заключение.

## Структура

```
stage_60/
├── backend/    Spring Boot 3.3, Java 17, PostgreSQL 16 (без src/test)
├── frontend/   React 18 + TS + Vite + MUI
├── diagrams/   4 drawio-файла (черновик графической части)
├── docs/       draft_pz_60.md — черновик ПЗ
└── README.md
```

## Запуск локально

Требования: JDK 17, Maven 3.9+, Node.js 18+, PostgreSQL 16.

1. Поднять PostgreSQL и создать базу `tourfirm` (пользователь `postgres`, пароль `postgres`).
2. Backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   API: http://localhost:8080, Swagger UI: http://localhost:8080/swagger-ui.html
   Схема БД и тестовые данные создаются миграциями Liquibase автоматически.
3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Интерфейс: http://localhost:5173

## Тестовые учётные записи

| Роль | Email | Пароль |
|---|---|---|
| Менеджер | manager@tour.by | password123 |
| Владелец ТС | vehicle@tour.by | password123 |
| Клиент | client@tour.by | password123 |
