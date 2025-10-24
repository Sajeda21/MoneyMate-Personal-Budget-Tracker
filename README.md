# 💰 MoneyMate – Personal Budget Tracker (Web App)

Dark-themed, full-stack budgeting app built with Flask, SQLite (SQLAlchemy), and vanilla JS + Chart.js. Tracks income/expenses, renders interactive breakdowns, provides insights, supports collaboration via shared wallets, and offers a polished profile management experience.

## 👥 Team
- **Sajeda Albarghati**
- **Tasneem Touati**

---

## 🧾 Abstract
MoneyMate is a dark-themed, full-stack budgeting application that enables users to track income and expenses, visualize spending patterns, set goals, record mood, and collaborate through shared wallets. The app is built with Flask and SQLAlchemy on the backend and vanilla JavaScript + Chart.js on the frontend. This README is structured for academic review and includes problem statement, architecture, data model, implementation details, evaluation, and future work.

---

## 📌 Problem Statement & Objectives
Modern personal finance tools can feel complex or impersonal. MoneyMate aims to provide an intuitive, minimal, dark-mode interface with features that encourage financial awareness and collaboration.

Objectives:
- Simple, accurate tracking of income and expenses
- Actionable visualizations (breakdown, trend, heatmap)
- Goal progress and habit-building (badges)
- Optional mood tracking to relate emotions and spending
- Collaboration via shared wallets (invites, roles, statuses)

---

## ✨ Highlights
- Track income and expenses with filters and exports.
- Interactive Expense Breakdown (pie/bar) + category details + trend.
- Smart Insights (top category, MoM change, suggestions).
- Expense Heatmap (last 30 days) for intensity.
- Mood & Money tracker with trend and insights.
- Goals & Achievements with progress bars and badges.
- Collaboration: Shared Wallets (create/rename, invite, accept/decline, remove).
- Profile Management (avatar, name/username/email, password change, delete account).
- In-app Demo Mode to seed realistic data quickly.

Dark, responsive UI using CSS variables; consistent with the original MoneyMate style.

---

## 🏗️ System Architecture (High-Level)
- Flask app with Blueprints (auth, profile, transactions, goals, moods, wallets)
- SQLite via SQLAlchemy ORM (dev mode, auto-create tables)
- Single-page UI served by Flask templates; JS drives all interactions
- Chart.js for visualizations; custom plugin paints dark background
- Session-based authentication; PBKDF2 password hashing

Key flows: user session → REST endpoints → ORM → DB; responses hydrate charts and UI state on the client.

---

## 📂 Repo Structure

```
MoneyMate/
├─ app.py                 # Flask app factory entrypoint
├─ models/                # SQLAlchemy models (User, Transaction, Goal, Mood, Wallet, WalletMember)
├─ routes/                # API blueprints (auth, profile, transactions, goals, moods, wallets)
├─ static/
│  ├─ css/style.css       # Dark theme styles
│  ├─ js/script.js        # Frontend logic and charts
│  └─ uploads/            # User avatars (dev only)
├─ templates/index.html   # Single-page UI shell
├─ requirements.txt       # Python dependencies
├─ README.md              # You are here
└─ docs/                  # Additional documentation (setup, API, demo, architecture)
```

---

## 🗃️ Data Model (Summary)
- User(id, email, password_hash, full_name, username, avatar_url, created_at)
- Transaction(id, user_id, type[income|expense], category, amount, date)
- Goal(id, user_id, name, target_amount, category, created_at, achieved_at)
- Mood(id, user_id, score(1..5), note, date)
- Wallet(id, owner_id, name)
- WalletMember(id, wallet_id, email, role[owner|member], status[invited|active|declined])

Relationships: User 1—N Transaction/Goal/Mood; Wallet 1—N WalletMember; User (owner_id) 1—N Wallet.

---

## 🚀 Quick Start (Local)

See docs/SETUP.md for full steps. Summary:

1) Create venv and install dependencies
```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2) Run the server
```
FLASK_APP=app:create_app flask run -p 5001
```

3) Open http://127.0.0.1:5001 and register/login

4) Click “Run Demo” to populate sample data.

---

## 🛠️ Features (Overview)

- Transactions: add/edit/delete, filters, CSV/PDF export
- Breakdown: pie/bar Chart.js with tooltips and click-to-focus details
- Insights: top category, monthly change, suggestions
- Heatmap: last 30 days spend intensity (dark-friendly)
- Goals: create/list, progress, achievement badge
- Mood: record daily mood, trend chart, spending correlation insight
- Shared Wallets: create/rename wallet, invite members, accept/decline, remove
- Profile: avatar upload, name/username/email update, password change, delete account

Details and screenshots: docs/FEATURES.md

---

## 🔌 API

All endpoints documented in docs/API.md, including:
- Auth: /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me
- Profile: GET/PUT /api/profile, POST /api/profile/avatar, POST /api/profile/password, DELETE /api/profile
- Transactions: CRUD, bulk delete, balance, summary, export
- Goals & Moods: CRUD/list
- Wallets: create/rename, invite, list/remove members, update member status

---

## 🧱 Implementation Notes

- Backend
  - Flask Blueprints and JSON APIs return clear error messages
  - Simple auth guard wrapper `require_login()` applied on endpoints
  - Owner-based access control on wallet routes; invitee can accept/decline
  - Password hashing with PBKDF2; avatars stored under static/uploads for dev
- Frontend
  - Central `state` object with lastTransactions, lastBreakdown, filters, goals, moods
  - Expense Breakdown dynamically renders pie/bar; click→details + daily trend
  - Heatmap canvas draws last-30-days intensity grid
  - Profile page: avatar upload (multipart/form-data), password change flow
  - Demo Mode seeds data (transactions, goals, moods, wallet invites)

Design notes: docs/ARCHITECTURE.md (optional)

---

## 🎬 Demo Walkthrough

Step-by-step demo covering all features is in docs/DEMO.md. Quick path:

1) Register/login → Run Demo
2) Explore Breakdown (toggle pie/bar, click slice, view details and trend)
3) Goals progress + Mood trend + Heatmap
4) Shared Wallets → Manage → rename/invite/accept/remove
5) Profile → update info, change password, upload avatar, see badges

---

## 🔒 Security Considerations
- Session-based auth; server checks user_id per request
- Owner checks on wallet mutations; invitee matches by email for status changes
- Passwords never stored plaintext; PBKDF2 hashing
- File uploads restricted to images; stored locally for dev only

---

## 🧪 Evaluation & Limitations
What works well:
- Clear, dark UI with responsive charts and state-driven updates
- Goals and badges provide quick motivation
- Wallet collaboration flow (invite → accept/decline → remove)

Limitations (roadmap):
- No real-time sync (could add SSE/WebSockets)
- Email-based invite acceptance is simulated (no email delivery)
- SQLite-only dev DB (could add Postgres + migrations)

---

## 🧭 Future Work
- Real-time collaboration updates
- Detailed analytics page (comparisons, forecasts)
- AI Insights backend integration (currently mocked placeholders)
- Role management and multi-wallet support per user
- Proper migrations and production-ready storage for avatars

---

## 🧪 Testing / CI (Optional)

- Add tests with pytest (pending).
- GitHub Actions template can be added to run lint/tests on PRs.

---

## 📜 License

MIT (if desired). Add LICENSE file if you want to publish under MIT.

---

## 📝 Changelog

See docs/CHANGELOG.md for a summary of recent work and commits.

---

## 🙏 Acknowledgments

Thanks to instructors and reviewers. Built with Flask, SQLAlchemy, and Chart.js; designed for clarity and a great dark-mode experience.
