# API Reference

All endpoints are prefixed with /api. Auth required unless noted.

## Auth
- POST /api/auth/register { email, password }
- POST /api/auth/login { email, password }
- POST /api/auth/logout
- GET  /api/auth/me

## Profile
- GET  /api/profile
- PUT  /api/profile { full_name, username, email }
- POST /api/profile/avatar (multipart/form-data: avatar)
- POST /api/profile/password { current_password, new_password }
- DELETE /api/profile (delete account and related data)

## Transactions
- GET  /api/transactions?category=&start_date=&end_date=
- POST /api/transactions { type:"income|expense", category, amount, date }
- PUT  /api/transactions/<id>
- DELETE /api/transactions/<id>
- DELETE /api/transactions (bulk delete all for current user)
- GET  /api/balance -> { income, expense, balance }
- GET  /api/summary -> { monthIncome, monthExpense, monthNet }
- GET  /api/category_summary -> [ { category, amount } ]
- GET  /api/export (CSV)

## Goals
- GET  /api/goals -> [Goal]
- POST /api/goals { name, target_amount, category }
- PUT  /api/goals/<id> { ... }
- DELETE /api/goals/<id>

## Moods
- GET  /api/moods -> [Mood]
- POST /api/moods { score(1..5), note, date(YYYY-MM-DD) }

## Wallets (Collaboration)
- POST /api/wallets { name } -> create wallet (owner)
- PUT  /api/wallets/<wallet_id> { name } -> rename wallet (owner)
- POST /api/wallets/<wallet_id>/invite { email }
- GET  /api/wallets/<wallet_id>/members -> [WalletMember]
- DELETE /api/wallets/<wallet_id>/members/<member_id>
- POST /api/wallets/<wallet_id>/members/<member_id>/status { status: invited|active|declined }

## Types
- Transaction: { id, type, category, amount, date }
- Goal: { id, name, target_amount, category, created_at, achieved_at }
- Mood: { id, score, note, date }
- Wallet: { id, name, owner_id }
- WalletMember: { id, wallet_id, email, role, status }
