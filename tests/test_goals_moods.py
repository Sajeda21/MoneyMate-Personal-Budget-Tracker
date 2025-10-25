from tests.conftest import register_and_login


def test_goals_crud_and_moods_flow(client):
    register_and_login(client)

    # Create goal
    r = client.post('/api/goals', json={'name': 'Food Budget', 'target_amount': 300, 'category': 'Food'})
    assert r.status_code in (200, 201)

    # List goals
    r = client.get('/api/goals')
    assert r.status_code == 200
    goals = r.get_json()
    assert isinstance(goals, list)
    goal_id = goals[0]['id'] if goals else None

    # Delete goal (if present)
    if goal_id:
        r = client.delete(f'/api/goals/{goal_id}')
        assert r.status_code == 200

    # Add a mood
    r = client.post('/api/moods', json={'score': 4, 'note': 'Good day', 'date': '2025-10-01'})
    assert r.status_code in (200, 201)

    # List moods
    r = client.get('/api/moods')
    assert r.status_code == 200
    moods = r.get_json()
    assert isinstance(moods, list)
