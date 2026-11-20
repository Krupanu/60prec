# ТурФирма — Frontend

Клиентская часть программного средства для автоматизации работы тур-фирмы.
Курсовой проект, УО «БГУИР», 2026.

## Стек

- Vite 5 + React 18 + TypeScript
- React Router v6
- Axios (REST API `/api/v1`)
- Material UI v5 (@mui/material + @emotion)
- State: React Context API (AuthContext)

## Запуск для разработки

Требования: Node.js 18+, npm.

```bash
npm install
npm run dev
```

Приложение поднимется на http://localhost:5173. Запросы `/api` проксируются
на backend http://localhost:8080 (настройка в `vite.config.ts`).

При необходимости скопируйте `.env.example` в `.env` и укажите адрес API:

```
VITE_API_URL=/api/v1
```

## Сборка production-версии

```bash
npm run build
```

Результат — в папке `dist/`. Предпросмотр сборки: `npm run preview`.

## Docker

```bash
docker build -t tourfirm-frontend .
docker run -p 80:80 tourfirm-frontend
```

Контейнер отдаёт статику через nginx, маршруты SPA обрабатываются
директивой `try_files`, запросы `/api/` проксируются на `backend:8080`
(имя сервиса в docker-compose).

## Роли и страницы

| Роль           | Страница                                   |
|----------------|--------------------------------------------|
| Гость          | Каталог туров, страница тура, вход, регистрация |
| CLIENT         | Личный кабинет: данные, заявки (оплата/отмена), избранное; бронирование, отзывы, промокоды |
| VEHICLE_OWNER  | Кабинет владельца ТС: рейсы (смена статуса), транспорт, документы к рейсам |
| MANAGER        | Панель менеджера: CRUD туров, транспорта, промокодов; заявки, пользователи, рейсы |
