from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_calculate_addition():
    response = client.post('/api/calculate', json={'expression': '2+2', 'angle_mode': 'deg'})
    assert response.status_code == 200
    assert response.json()['result'] == '4.0'


def test_calculate_sin_deg():
    response = client.post('/api/calculate', json={'expression': 'sin(90)', 'angle_mode': 'deg'})
    assert response.status_code == 200
    assert response.json()['result'] == '1.0'
