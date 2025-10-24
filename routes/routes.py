from flask import Blueprint, request, jsonify, Response, session, current_app
from models.models import db, Transaction, User, Goal, Mood, Wallet, WalletMember
from sqlalchemy import func
from datetime import datetime, timezone
import csv
import io
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os


api_bp = Blueprint('api', __name__)


def _parse_iso(dt_str):
    if not dt_str:
        return None
    try:
        s = dt_str.strip()
        if s.endswith('Z'):
            s = s[:-1] + '+00:00'
        return datetime.fromisoformat(s)
    except Exception:
        return None


# -------------------- Auth Utilities --------------------
def current_user_id():
    return session.get('user_id')


def require_login():
    uid = current_user_id()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    return None


# -------------------- Auth Endpoints --------------------
@api_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    if not email or not password:
        return jsonify({'error': 'email and password are required'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'email already registered'}), 400
    # Use PBKDF2 for compatibility on systems without hashlib.scrypt
    pw_hash = generate_password_hash(password, method='pbkdf2:sha256')
    user = User(email=email, password_hash=pw_hash)
    db.session.add(user)
    db.session.commit()
    session['user_id'] = user.id
    return jsonify({'message': 'registered', 'user': user.to_dict()})


@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'invalid credentials'}), 401
    session['user_id'] = user.id
    # One-time backfill: claim any legacy transactions without a user_id
    try:
        db.session.query(Transaction).filter(Transaction.user_id.is_(None)).update({Transaction.user_id: user.id}, synchronize_session=False)
        db.session.commit()
    except Exception:
        db.session.rollback()
    return jsonify({'message': 'logged_in', 'user': user.to_dict()})


@api_bp.route('/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'logged_out'})


@api_bp.route('/auth/me', methods=['GET'])
def me():
    uid = current_user_id()
    if not uid:
        return jsonify({'user': None})
    u = User.query.get(uid)
    return jsonify({'user': u.to_dict() if u else None})


# -------------------- Profile Endpoints --------------------
@api_bp.route('/profile', methods=['GET'])
def get_profile():
    auth_err = require_login()
    if auth_err:
        return auth_err
    u = User.query.get(current_user_id())
    if not u:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(u.to_dict())


@api_bp.route('/profile', methods=['PUT'])
def update_profile():
    auth_err = require_login()
    if auth_err:
        return auth_err
    data = request.get_json(silent=True) or {}
    u = User.query.get(current_user_id())
    if not u:
        return jsonify({'error': 'Not found'}), 404

    email = (data.get('email') or u.email).strip().lower()
    username = (data.get('username') or u.username)
    full_name = (data.get('full_name') or u.full_name)

    if not email:
        return jsonify({'error': 'email is required'}), 400
    # ensure unique email if changed
    if email != u.email:
        if User.query.filter(User.email == email, User.id != u.id).first():
            return jsonify({'error': 'email already in use'}), 400
        u.email = email
    u.username = username
    u.full_name = full_name
    db.session.commit()
    return jsonify({'message': 'updated', 'user': u.to_dict()})


@api_bp.route('/profile/avatar', methods=['POST'])
def upload_avatar():
    auth_err = require_login()
    if auth_err:
        return auth_err
    if 'avatar' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    filename = secure_filename(file.filename)
    if not filename:
        return jsonify({'error': 'Invalid filename'}), 400
    # Prefix with user id and timestamp to avoid collisions
    uid = current_user_id()
    ts = datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')
    name, ext = os.path.splitext(filename)
    safe_name = f"u{uid}_{ts}{ext}"
    upload_dir = current_app.config.get('UPLOAD_FOLDER')
    try:
        os.makedirs(upload_dir, exist_ok=True)
    except Exception:
        pass
    path = os.path.join(upload_dir, safe_name)
    file.save(path)
    # Public URL under static
    public_url = f"/static/uploads/{safe_name}"
    u = User.query.get(uid)
    u.avatar_url = public_url
    db.session.commit()
    return jsonify({'message': 'uploaded', 'avatar_url': public_url})


@api_bp.route('/profile/password', methods=['POST'])
def change_password():
    auth_err = require_login()
    if auth_err:
        return auth_err
    data = request.get_json(silent=True) or {}
    current_password = data.get('current_password') or ''
    new_password = data.get('new_password') or ''
    if not current_password or not new_password:
        return jsonify({'error': 'current_password and new_password are required'}), 400
    u = User.query.get(current_user_id())
    if not u or not check_password_hash(u.password_hash, current_password):
        return jsonify({'error': 'invalid current password'}), 400
    u.password_hash = generate_password_hash(new_password, method='pbkdf2:sha256')
    db.session.commit()
    return jsonify({'message': 'password_updated'})


@api_bp.route('/profile', methods=['DELETE'])
def delete_account():
    auth_err = require_login()
    if auth_err:
        return auth_err
    uid = current_user_id()
    # Delete related data
    try:
        db.session.query(Transaction).filter(Transaction.user_id == uid).delete(synchronize_session=False)
        db.session.query(Goal).filter(Goal.user_id == uid).delete(synchronize_session=False)
        db.session.query(Mood).filter(Mood.user_id == uid).delete(synchronize_session=False)
        # Remove memberships owned by user's wallets and their member records
        for w in db.session.query(Wallet).filter(Wallet.owner_id == uid).all():
            db.session.query(WalletMember).filter(WalletMember.wallet_id == w.id).delete(synchronize_session=False)
            db.session.delete(w)
        # Remove memberships where user email matches (best-effort)
        u = User.query.get(uid)
        if u and u.email:
            db.session.query(WalletMember).filter(WalletMember.email == u.email).delete(synchronize_session=False)
        # Finally, delete user
        if u:
            db.session.delete(u)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'failed to delete account'}), 500
    session.pop('user_id', None)
    return jsonify({'message': 'account_deleted'})
@api_bp.route('/transactions', methods=['POST'])
def add_transaction():
    # require auth
    auth_err = require_login()
    if auth_err:
        return auth_err
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON'}), 400

    t_type = data.get('type')
    amount = data.get('amount')
    category = data.get('category')
    date_str = data.get('date')  # store as provided (string)

    if t_type not in ('income', 'expense'):
        return jsonify({'error': 'type must be "income" or "expense"'}), 400

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify({'error': 'amount must be a number'}), 400

    if amount < 0:
        return jsonify({'error': 'amount must be non-negative'}), 400

    if not category or not str(category).strip():
        return jsonify({'error': 'category is required'}), 400

    tx = Transaction(type=t_type, category=str(category).strip(), amount=amount, date=date_str, user_id=current_user_id())
    db.session.add(tx)
    db.session.commit()

    return jsonify({'message': 'Transaction added', 'transaction': tx.to_dict()}), 201


@api_bp.route('/add_transaction', methods=['POST'])
def add_transaction_alias():
    return add_transaction()


@api_bp.route('/transactions', methods=['GET'])
def list_transactions():
    # require auth
    auth_err = require_login()
    if auth_err:
        return auth_err
    # Optional filters: start_date, end_date (ISO), category
    start_iso = request.args.get('start_date')
    end_iso = request.args.get('end_date')
    category = request.args.get('category')

    txs = Transaction.query.filter(Transaction.user_id == current_user_id()).order_by(Transaction.id.desc()).all()
    items = [t.to_dict() for t in txs]

    # In-Python filter because dates are stored as strings
    start_dt = _parse_iso(start_iso) if start_iso else None
    end_dt = _parse_iso(end_iso) if end_iso else None

    def match(tx):
        if category and tx.get('category') != category:
            return False
        if start_dt or end_dt:
            dt = _parse_iso(tx.get('date'))
            if start_dt and (dt is None or dt < start_dt):
                return False
            if end_dt and (dt is None or dt > end_dt):
                return False
        return True

    if start_dt or end_dt or category:
        items = [tx for tx in items if match(tx)]
    return jsonify(items)


@api_bp.route('/balance', methods=['GET'])
def get_balance():
    auth_err = require_login()
    if auth_err:
        return auth_err
    income_sum = db.session.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(Transaction.type == 'income', Transaction.user_id == current_user_id()).scalar() or 0.0
    expense_sum = db.session.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(Transaction.type == 'expense', Transaction.user_id == current_user_id()).scalar() or 0.0
    balance = float(income_sum) - float(expense_sum)

    return jsonify({
        'income': float(income_sum),
        'expense': float(expense_sum),
        'balance': balance
    })


@api_bp.route('/breakdown', methods=['GET'])
def get_breakdown():
    auth_err = require_login()
    if auth_err:
        return auth_err
    # Group only expenses by category and sum their amounts for the current user
    rows = (
        db.session.query(
            Transaction.category,
            func.coalesce(func.sum(Transaction.amount), 0.0)
        )
        .filter(Transaction.type == 'expense', Transaction.user_id == current_user_id())
        .group_by(Transaction.category)
        .all()
    )

    result = {cat: float(total or 0.0) for cat, total in rows}
    return jsonify(result)


@api_bp.route('/category_summary', methods=['GET'])
def category_summary():
    auth_err = require_login()
    if auth_err:
        return auth_err
    """Return a list of {category, amount} for expenses grouped by category."""
    rows = (
        db.session.query(
            Transaction.category,
            func.coalesce(func.sum(Transaction.amount), 0.0)
        )
        .filter(Transaction.type == 'expense', Transaction.user_id == current_user_id())
        .group_by(Transaction.category)
        .all()
    )
    data = [{'category': cat, 'amount': float(total or 0.0)} for cat, total in rows]
    return jsonify(data)


@api_bp.route('/transactions/<int:tx_id>', methods=['PUT'])
def update_transaction(tx_id):
    auth_err = require_login()
    if auth_err:
        return auth_err
    tx = Transaction.query.get(tx_id)
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404
    if tx.user_id != current_user_id():
        return jsonify({'error': 'Forbidden'}), 403
    data = request.get_json(silent=True) or {}

    t_type = data.get('type', tx.type)
    category = data.get('category', tx.category)
    amount = data.get('amount', tx.amount)
    date_str = data.get('date', tx.date)

    if t_type not in ('income', 'expense'):
        return jsonify({'error': 'type must be "income" or "expense"'}), 400
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify({'error': 'amount must be a number'}), 400
    if amount < 0:
        return jsonify({'error': 'amount must be non-negative'}), 400
    if not category or not str(category).strip():
        return jsonify({'error': 'category is required'}), 400

    tx.type = t_type
    tx.category = str(category).strip()
    tx.amount = amount
    tx.date = date_str
    db.session.commit()
    return jsonify({'message': 'Transaction updated', 'transaction': tx.to_dict()})


@api_bp.route('/transactions/<int:tx_id>', methods=['DELETE'])
def delete_transaction(tx_id):
    auth_err = require_login()
    if auth_err:
        return auth_err
    tx = Transaction.query.get(tx_id)
    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404
    if tx.user_id != current_user_id():
        return jsonify({'error': 'Forbidden'}), 403
    db.session.delete(tx)
    db.session.commit()
    return jsonify({'message': 'Transaction deleted'})


@api_bp.route('/summary', methods=['GET'])
def get_monthly_summary():
    auth_err = require_login()
    if auth_err:
        return auth_err
    # Current month in UTC
    now = datetime.now(timezone.utc)
    start_month = datetime(year=now.year, month=now.month, day=1, tzinfo=timezone.utc)
    # Next month start
    if now.month == 12:
        next_month = datetime(year=now.year + 1, month=1, day=1, tzinfo=timezone.utc)
    else:
        next_month = datetime(year=now.year, month=now.month + 1, day=1, tzinfo=timezone.utc)

    income = 0.0
    expense = 0.0
    for t in Transaction.query.filter(Transaction.user_id == current_user_id()).all():
        dt = _parse_iso(t.date)
        if not dt:
            continue
        if start_month <= dt.replace(tzinfo=dt.tzinfo or timezone.utc) < next_month:
            if t.type == 'income':
                income += float(t.amount)
            elif t.type == 'expense':
                expense += float(t.amount)
    return jsonify({
        'month': f"{now.year}-{now.month:02d}",
        'income': round(income, 2),
        'expense': round(expense, 2),
        'net': round(income - expense, 2),
    })


@api_bp.route('/export', methods=['GET'])
def export_csv():
    auth_err = require_login()
    if auth_err:
        return auth_err
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['id', 'type', 'category', 'amount', 'date'])
    for t in Transaction.query.filter(Transaction.user_id == current_user_id()).order_by(Transaction.id.asc()).all():
        writer.writerow([t.id, t.type, t.category, t.amount, t.date])
    csv_data = output.getvalue()
    output.close()
    return Response(
        csv_data,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=moneymate_transactions.csv'}
    )


@api_bp.route('/insights', methods=['GET'])
def insights():
    auth_err = require_login()
    if auth_err:
        return auth_err
    # Simple local insights
    now = datetime.now(timezone.utc)
    def month_range(year, month):
        start = datetime(year=year, month=month, day=1, tzinfo=timezone.utc)
        if month == 12:
            end = datetime(year=year + 1, month=1, day=1, tzinfo=timezone.utc)
        else:
            end = datetime(year=year, month=month + 1, day=1, tzinfo=timezone.utc)
        return start, end

    cur_start, cur_end = month_range(now.year, now.month)
    prev_month = 12 if now.month == 11 and False else (now.month - 1 or 12)
    prev_year = now.year - 1 if now.month == 1 else now.year
    prev_start, prev_end = month_range(prev_year, prev_month)

    cur_income = cur_expense = 0.0
    prev_expense = 0.0
    cat_totals = {}
    for t in Transaction.query.all():
        dt = _parse_iso(t.date)
        if not dt:
            continue
        dtu = dt.replace(tzinfo=dt.tzinfo or timezone.utc)
        if cur_start <= dtu < cur_end:
            if t.type == 'income':
                cur_income += float(t.amount)
            else:
                cur_expense += float(t.amount)
                cat_totals[t.category] = cat_totals.get(t.category, 0.0) + float(t.amount)
        if prev_start <= dtu < prev_end and t.type == 'expense':
            prev_expense += float(t.amount)

    insights_list = []
    if cat_totals:
        top_cat = max(cat_totals, key=cat_totals.get)
        insights_list.append(f"You spent the most on {top_cat} this month.")
    if prev_expense > 0:
        change = ((cur_expense - prev_expense) / prev_expense) * 100.0
        direction = 'increased' if change >= 0 else 'decreased'
        insights_list.append(f"Your total expenses {direction} by {abs(change):.1f}% compared to last month.")
    if cur_income > 0:
        target = 0.10 * cur_income
        insights_list.append(f"Try saving 10% of your income (~${target:.2f}) for next month.")

    return jsonify({'insights': insights_list[:3]})


# -------------------- Bulk Delete (All Data) --------------------
@api_bp.route('/transactions', methods=['DELETE'])
def delete_all_transactions():
    auth_err = require_login()
    if auth_err:
        return auth_err
    db.session.query(Transaction).filter(Transaction.user_id == current_user_id()).delete(synchronize_session=False)
    db.session.commit()
    return jsonify({'message': 'All transactions deleted'})


# -------------------- Goals CRUD --------------------
@api_bp.route('/goals', methods=['GET'])
def list_goals():
    auth_err = require_login()
    if auth_err:
        return auth_err
    items = Goal.query.filter(Goal.user_id == current_user_id()).order_by(Goal.id.desc()).all()
    return jsonify([g.to_dict() for g in items])


@api_bp.route('/goals', methods=['POST'])
def create_goal():
    auth_err = require_login()
    if auth_err:
        return auth_err
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    target = data.get('target_amount')
    category = (data.get('category') or '').strip() or None
    if not name:
        return jsonify({'error': 'name is required'}), 400
    try:
        target = float(target)
    except (TypeError, ValueError):
        return jsonify({'error': 'target_amount must be a number'}), 400
    g = Goal(user_id=current_user_id(), name=name, target_amount=target, category=category, created_at=datetime.now(timezone.utc).isoformat())
    db.session.add(g)
    db.session.commit()
    return jsonify({'message': 'created', 'goal': g.to_dict()}), 201


@api_bp.route('/goals/<int:goal_id>', methods=['PUT'])
def update_goal(goal_id):
    auth_err = require_login()
    if auth_err:
        return auth_err
    g = Goal.query.get(goal_id)
    if not g or g.user_id != current_user_id():
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json(silent=True) or {}
    if 'name' in data:
        g.name = (data.get('name') or '').strip() or g.name
    if 'target_amount' in data:
        try:
            g.target_amount = float(data.get('target_amount'))
        except (TypeError, ValueError):
            return jsonify({'error': 'target_amount must be a number'}), 400
    if 'category' in data:
        cat = (data.get('category') or '').strip()
        g.category = cat or None
    if 'achieved_at' in data:
        g.achieved_at = data.get('achieved_at')
    db.session.commit()
    return jsonify({'message': 'updated', 'goal': g.to_dict()})


@api_bp.route('/goals/<int:goal_id>', methods=['DELETE'])
def delete_goal(goal_id):
    auth_err = require_login()
    if auth_err:
        return auth_err
    g = Goal.query.get(goal_id)
    if not g or g.user_id != current_user_id():
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(g)
    db.session.commit()
    return jsonify({'message': 'deleted'})


# -------------------- Mood Endpoints --------------------
@api_bp.route('/moods', methods=['GET'])
def list_moods():
    auth_err = require_login()
    if auth_err:
        return auth_err
    items = Mood.query.filter(Mood.user_id == current_user_id()).order_by(Mood.id.desc()).limit(60).all()
    return jsonify([m.to_dict() for m in items])


@api_bp.route('/moods', methods=['POST'])
def create_mood():
    auth_err = require_login()
    if auth_err:
        return auth_err
    data = request.get_json(silent=True) or {}
    score = data.get('score')
    note = (data.get('note') or '').strip() or None
    date = (data.get('date') or '').strip() or None
    try:
        score = int(score)
    except (TypeError, ValueError):
        return jsonify({'error': 'score must be an integer (1-5)'}), 400
    if score < 1 or score > 5:
        return jsonify({'error': 'score must be 1..5'}), 400
    m = Mood(user_id=current_user_id(), score=score, note=note, date=date or datetime.now(timezone.utc).date().isoformat())
    db.session.add(m)
    db.session.commit()
    return jsonify({'message': 'created', 'mood': m.to_dict()}), 201


# -------------------- Shared Wallets (basic stubs) --------------------
@api_bp.route('/wallets', methods=['POST'])
def create_wallet():
    auth_err = require_login()
    if auth_err:
        return auth_err
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or 'My Wallet').strip() or 'My Wallet'
    w = Wallet(owner_id=current_user_id(), name=name)
    db.session.add(w)
    db.session.commit()
    # Add owner as member
    db.session.add(WalletMember(wallet_id=w.id, email=User.query.get(current_user_id()).email, role='owner', status='active'))
    db.session.commit()
    return jsonify({'message': 'created', 'wallet': w.to_dict()})


@api_bp.route('/wallets/<int:wallet_id>', methods=['PUT'])
def update_wallet(wallet_id):
    auth_err = require_login()
    if auth_err:
        return auth_err
    w = Wallet.query.get(wallet_id)
    if not w or w.owner_id != current_user_id():
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    if name:
        w.name = name
    db.session.commit()
    return jsonify({'message': 'updated', 'wallet': w.to_dict()})


@api_bp.route('/wallets/<int:wallet_id>/invite', methods=['POST'])
def invite_wallet_member(wallet_id):
    auth_err = require_login()
    if auth_err:
        return auth_err
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    if not email:
        return jsonify({'error': 'email is required'}), 400
    # Ensure wallet exists and owned by current user (simplified access control)
    w = Wallet.query.get(wallet_id)
    if not w or w.owner_id != current_user_id():
        return jsonify({'error': 'Not found'}), 404
    mem = WalletMember(wallet_id=wallet_id, email=email, role='member', status='invited')
    db.session.add(mem)
    db.session.commit()
    return jsonify({'message': 'invited', 'member': mem.to_dict()})


@api_bp.route('/wallets/<int:wallet_id>/members', methods=['GET'])
def list_wallet_members(wallet_id):
    auth_err = require_login()
    if auth_err:
        return auth_err
    ms = WalletMember.query.filter(WalletMember.wallet_id == wallet_id).all()
    return jsonify([m.to_dict() for m in ms])


@api_bp.route('/wallets/<int:wallet_id>/members/<int:member_id>', methods=['DELETE'])
def remove_wallet_member(wallet_id, member_id):
    auth_err = require_login()
    if auth_err:
        return auth_err
    w = Wallet.query.get(wallet_id)
    if not w or w.owner_id != current_user_id():
        return jsonify({'error': 'Not found'}), 404
    m = WalletMember.query.get(member_id)
    if not m or m.wallet_id != wallet_id:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(m)
    db.session.commit()
    return jsonify({'message': 'removed'})


@api_bp.route('/wallets/<int:wallet_id>/members/<int:member_id>/status', methods=['POST'])
def update_member_status(wallet_id, member_id):
    auth_err = require_login()
    if auth_err:
        return auth_err
    data = request.get_json(silent=True) or {}
    status = (data.get('status') or '').strip().lower()
    if status not in ('invited', 'active', 'declined'):
        return jsonify({'error': 'invalid status'}), 400
    # Owner may update any member; member themselves could also accept/decline (simplified: allow current user if their email matches).
    m = WalletMember.query.get(member_id)
    if not m or m.wallet_id != wallet_id:
        return jsonify({'error': 'Not found'}), 404
    w = Wallet.query.get(wallet_id)
    if not w:
        return jsonify({'error': 'Not found'}), 404
    # simplified permission: owner or the invited member email (if current user's email matches)
    cur = User.query.get(current_user_id())
    if not (w.owner_id == current_user_id() or (cur and cur.email and cur.email.lower() == (m.email or '').lower())):
        return jsonify({'error': 'Forbidden'}), 403
    m.status = status
    if status == 'active' and m.role not in ('owner','member'):
        m.role = 'member'
    db.session.commit()
    return jsonify({'message': 'updated', 'member': m.to_dict()})
