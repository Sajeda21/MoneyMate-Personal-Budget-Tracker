# 💰 MoneyMate – Personal Budget Tracker (Web App)

Dark-themed, full-stack budgeting app built with Flask, SQLite (SQLAlchemy), and vanilla JS + Chart.js. Tracks income/expenses, renders interactive breakdowns, provides insights, supports collaboration via shared wallets, and offers a polished profile management experience.

## 👥 Team
- **Sajeda Albarghati**
- **Tasneem Touati**

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

## 🧱 Architecture

- Flask app using Blueprints (see routes/)
- SQLAlchemy models with db.create_all() on startup for dev
- Single-Page UI via templates/index.html + static/js/script.js
- Chart.js for charts; dark background plugin
- Session-based auth; PBKDF2 password hashing

Design notes: docs/ARCHITECTURE.md

---

## 🎬 Demo Walkthrough

Step-by-step demo covering all features is in docs/DEMO.md. Quick path:

1) Register/login → Run Demo
2) Explore Breakdown (toggle pie/bar, click slice, view details and trend)
3) Goals progress + Mood trend + Heatmap
4) Shared Wallets → Manage → rename/invite/accept/remove
5) Profile → update info, change password, upload avatar, see badges

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
