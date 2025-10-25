from tests.conftest import register_and_login


def test_export_csv_and_wallets_minimal(client):
    register_and_login(client, email="w1@example.com", password="Pass1234")

    # Add some transactions so export has content
    client.post('/api/transactions', json={'type':'income','category':'Salary','amount':1000})
    client.post('/api/transactions', json={'type':'expense','category':'Food','amount':50})

    # Export CSV
    r = client.get('/api/export')
    assert r.status_code == 200
    assert 'text/csv' in r.headers.get('Content-Type','') or 'attachment' in r.headers.get('Content-Disposition','')

    # Wallets minimal flow
    r = client.post('/api/wallets', json={'name':'Family'})
    assert r.status_code == 200
    wallet = r.get_json()
    if isinstance(wallet, dict) and isinstance(wallet.get('wallet'), dict):
        wallet_id = wallet['wallet'].get('id')
    else:
        wallet_id = None

    # Rename
    r = client.put(f'/api/wallets/{wallet_id}', json={'name':'Household'})
    assert r.status_code == 200

    # Invite a member
    r = client.post(f'/api/wallets/{wallet_id}/invite', json={'email':'friend@example.com'})
    assert r.status_code == 200

    # List members
    r = client.get(f'/api/wallets/{wallet_id}/members')
    assert r.status_code == 200
    members = r.get_json()
    if isinstance(members, list) and members:
        member_id = members[0].get('id')
        # Update member status
        r = client.post(f'/api/wallets/{wallet_id}/members/{member_id}/status', json={'status':'active'})
        assert r.status_code == 200
        # Remove member
        r = client.delete(f'/api/wallets/{wallet_id}/members/{member_id}')
        assert r.status_code == 200
