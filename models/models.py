from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(100), nullable=True)
    full_name = db.Column(db.String(255), nullable=True)
    avatar_url = db.Column(db.String(512), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'full_name': self.full_name,
            'avatar_url': self.avatar_url,
        }


class Goal(db.Model):
    __tablename__ = 'goals'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    name = db.Column(db.String(255), nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.String(64), nullable=True)
    achieved_at = db.Column(db.String(64), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'target_amount': self.target_amount,
            'category': self.category,
            'created_at': self.created_at,
            'achieved_at': self.achieved_at,
        }


class Mood(db.Model):
    __tablename__ = 'moods'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    score = db.Column(db.Integer, nullable=False)  # 1-5
    note = db.Column(db.String(255), nullable=True)
    date = db.Column(db.String(64), nullable=True)  # ISO date (YYYY-MM-DD)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'score': self.score,
            'note': self.note,
            'date': self.date,
        }


class Wallet(db.Model):
    __tablename__ = 'wallets'
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    name = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {'id': self.id, 'owner_id': self.owner_id, 'name': self.name}


class WalletMember(db.Model):
    __tablename__ = 'wallet_members'
    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallets.id'), index=True)
    email = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='member')  # owner/member
    status = db.Column(db.String(50), nullable=False, default='invited')  # invited/active

    def to_dict(self):
        return {
            'id': self.id,
            'wallet_id': self.wallet_id,
            'email': self.email,
            'role': self.role,
            'status': self.status,
        }


class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column('type', db.String(10), nullable=False)  # 'income' or 'expense'
    category = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(64), nullable=True)  # store as string (e.g., ISO 8601)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'category': self.category,
            'amount': self.amount,
            'date': self.date,
            'user_id': self.user_id,
        }
