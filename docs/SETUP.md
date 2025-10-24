# Setup Guide

## Prerequisites
- Python 3.10+
- pip
- (Optional) Git + GitHub SSH setup

## Create virtualenv and install deps
```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run the app (dev)
```
export FLASK_APP=app:create_app
flask run -p 5001
```
Open http://127.0.0.1:5001

## First run
- Register/log in
- Click "Run Demo" in the header to seed sample data

## Environment notes
- Dev DB is SQLite file (money_mate.db)
- User-uploaded avatars are stored in static/uploads (dev only)

## Troubleshooting
- Hard refresh with cache disabled if UI doesn’t update
- Check Flask console logs for errors
- Verify /api/auth/me returns a user after login
