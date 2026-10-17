import pytest


def test_register_and_login_flow(client):
    test_email = "testuser@example.com"
    test_password = "SecurePassword123!"

    # 1. Register new user
    register_res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": test_email,
            "password": test_password,
        },
    )
    assert register_res.status_code == 201
    user_data = register_res.json()
    assert user_data["email"] == test_email
    assert "id" in user_data

    # 2. Duplicate registration attempt should fail
    dup_res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": test_email,
            "password": test_password,
        },
    )
    assert dup_res.status_code == 400

    # 3. Login with correct credentials
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_email,
            "password": test_password,
        },
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 4. Login with invalid password
    invalid_login = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_email,
            "password": "WrongPassword!",
        },
    )
    assert invalid_login.status_code == 401

    # 5. Access protected /me endpoint
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == test_email
