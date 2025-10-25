from tests.conftest import register_and_login


def test_register_login_me_logout(client):
    # register
    r = client.post('/api/auth/register', json={'email': 'u1@example.com', 'password': 'Pass1234'})
    assert r.status_code == 200
    # login
    r = client.post('/api/auth/login', json={'email': 'u1@example.com', 'password': 'Pass1234'})
    assert r.status_code == 200
    # me
    r = client.get('/api/auth/me')
    assert r.status_code == 200
    assert r.get_json().get('user')
    # logout
    r = client.post('/api/auth/logout')
    assert r.status_code == 200
