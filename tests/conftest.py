import os
import tempfile
import pytest
from app import create_app
from models.models import db


@pytest.fixture()
def app():
    # Create a temp sqlite DB file for integration tests
    db_fd, db_path = tempfile.mkstemp()
    os.close(db_fd)

    app = create_app()
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{db_path}",
        WTF_CSRF_ENABLED=False,
        SERVER_NAME="localhost",
    )

    with app.app_context():
        db.drop_all()
        db.create_all()

    yield app

    # Teardown
    with app.app_context():
        db.session.remove()
        db.drop_all()
    try:
        os.unlink(db_path)
    except OSError:
        pass


@pytest.fixture()
def client(app):
    return app.test_client()


def register_and_login(client, email="test@example.com", password="Test1234"):
    client.post("/api/auth/register", json={"email": email, "password": password})
    client.post("/api/auth/login", json={"email": email, "password": password})
    return email
