from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_register_and_login_flow():
    email = f"admin-{uuid4()}@example.com"
    password = "StrongPass123!"

    response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Demo Admin"},
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["email"] == email
    assert "id" in data
    assert "password" not in data

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200, login_response.text
    login_data = login_response.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200, me_response.text
    assert me_response.json()["email"] == email


def test_login_rejects_invalid_credentials():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "missing@example.com", "password": "wrongpass"},
    )
    assert response.status_code == 401
