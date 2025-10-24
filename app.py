from flask import Flask, render_template
from models.models import db, User, Transaction
from routes.routes import api_bp
import os


def create_app():
    app = Flask(__name__, template_folder='templates', static_folder='static')
    # Use an absolute path so we always hit the same DB file in the project root
    abs_db_path = os.path.join(app.root_path, 'money_mate.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{abs_db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB
    # Always reload templates in dev
    app.config['TEMPLATES_AUTO_RELOAD'] = True

    db.init_app(app)

    with app.app_context():
        # Backward compatibility: if previous DB exists with old name, migrate it once
        old_db = os.path.join(app.root_path, 'moneymate.db')
        new_db = os.path.join(app.root_path, 'money_mate.db')
        try:
            if not os.path.exists(new_db) and os.path.exists(old_db):
                os.replace(old_db, new_db)
        except Exception:
            pass
        # Ensure upload directory exists
        try:
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        except Exception:
            pass
        db.create_all()

    # Ensure Jinja picks up template edits immediately
    try:
        app.jinja_env.auto_reload = True
        app.jinja_env.cache = {}
    except Exception:
        pass

    app.register_blueprint(api_bp, url_prefix='/api')

    @app.route('/')
    def index():
        return render_template('index.html')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
