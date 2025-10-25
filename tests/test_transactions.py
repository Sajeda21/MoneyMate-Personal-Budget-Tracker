from tests.conftest import register_and_login


def test_add_list_balance_and_summary(client):
    register_and_login(client)
    # add income and expenses
    client.post('/api/transactions', json={'type':'income','category':'Salary','amount':1000})
    client.post('/api/transactions', json={'type':'expense','category':'Food','amount':100})
    client.post('/api/transactions', json={'type':'expense','category':'Transport','amount':50})

    # list
    r = client.get('/api/transactions')
    assert r.status_code == 200
    data = r.get_json()
    assert len(data) == 3

    # balance
    r = client.get('/api/balance')
    b = r.get_json()
    assert b['income'] == 1000
    assert b['expense'] == 150
    assert b['balance'] == 850

    # category summary
    r = client.get('/api/category_summary')
    assert r.status_code == 200
    rows = r.get_json()
    cats = {row['category']: row['amount'] for row in rows}
    assert cats.get('Food') == 100
    assert cats.get('Transport') == 50
