from tests.conftest import register_and_login


def test_profile_get_update_and_password(client):
    register_and_login(client, email="p1@example.com", password="Pass1234")

    # Get profile
    r = client.get("/api/profile")
    assert r.status_code == 200

    # Update profile
    r = client.put(
        "/api/profile",
        json={"full_name": "Test User", "username": "tester", "email": "p1@example.com"},
    )
    assert r.status_code == 200

    # Change password
    r = client.post(
        "/api/profile/password",
        json={"current_password": "Pass1234", "new_password": "NewPass1234"},
    )
    assert r.status_code == 200
