# Architecture

## Overview
MoneyMate is a Flask-based web app with a single-page UI. Data is stored in SQLite via SQLAlchemy. The frontend is vanilla JS with Chart.js for visualizations and a dark theme.

## Components
- Flask application factory (`app.py`) wiring Blueprints from `routes/`
- Models in `models/models.py` using SQLAlchemy ORM
- Templates: `templates/index.html` (single entry HTML)
- Static assets: `static/css/style.css`, `static/js/script.js`, `static/uploads/*`

## Blueprints/Routes
- Auth: register, login, logout, me
- Profile: get/update, avatar upload, change password, delete account
- Transactions: CRUD, list with filters, balance, summaries, export CSV
- Goals & Moods: create/list/update/delete (goals), create/list (moods)
- Wallets: create/rename, invite, list/remove members, update member status

## Data Flow
1. User interacts with UI → JS issues fetch to `/api/...`
2. Route validates session and payload → ORM CRUD
3. JSON response → JS updates `state` and re-renders charts/components

## State (Frontend)
```js
state = {
  filters: { category: '', start: '', end: '' },
  lastTransactions: [],
  lastBreakdown: {},
  chartType: 'pie',
  focusedCategory: '',
  walletId: null,
  goals: [],
  moods: [],
}
```

## Charts
- Category breakdown (Chart.js pie/bar) with click-to-focus
- Daily trend mini-chart for focused category
- Mood trend (line)
- Heatmap: custom 2x15 canvas grid (last 30 days)

## Security
- Session-based auth guard (`require_login`) on protected endpoints
- PBKDF2 password hashing
- Owner checks for wallet mutations; invitee email match for status updates
- Avatar uploads stored locally in dev (static/uploads)

## Notes
- Dev DB auto-created with `db.create_all()` on startup
- Consider Alembic migrations and Postgres for production
