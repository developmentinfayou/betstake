import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30


def test_manual_bet_edge_cases_and_validation():
    session = requests.Session()

    # Register unique test user
    unique_id = str(uuid.uuid4())[:8]
    username = f"testuser_{unique_id}"
    email = f"{username}@example.com"
    password = "Password123!"

    register_payload = {
        "username": username,
        "email": email,
        "password": password
    }

    resp = session.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
    assert resp.status_code == 200, f"User registration failed: {resp.status_code} {resp.text}"
    token = resp.json().get("token")
    assert token and isinstance(token, str), "No token received upon registration"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 1) POST /api/bet/place with amount 0 and isDemo false - expect 400 error.
    payload1 = {
        "gameType": "DICE",
        "currency": "USD",
        "amount": 0,
        "gameParams": {"target": 50, "isOver": True},
        "isDemo": False
    }

    resp1 = session.post(f"{BASE_URL}/api/bet/place", json=payload1, headers=headers, timeout=TIMEOUT)
    assert resp1.status_code == 400, f"Expected 400 for amount=0, got {resp1.status_code}: {resp1.text}"

    # 2) POST with amount -5 - expect 400 error.
    payload2 = {
        "gameType": "DICE",
        "currency": "USD",
        "amount": -5,
        "gameParams": {"target": 50, "isOver": True},
        "isDemo": False
    }

    resp2 = session.post(f"{BASE_URL}/api/bet/place", json=payload2, headers=headers, timeout=TIMEOUT)
    assert resp2.status_code == 400, f"Expected 400 for amount=-5, got {resp2.status_code}: {resp2.text}"

    # 3) POST with gameType INVALID_GAME, amount 10, isDemo true - expect 400 error containing 'not found'.
    payload3 = {
        "gameType": "INVALID_GAME",
        "currency": "USD",
        "amount": 10,
        "gameParams": {},
        "isDemo": True
    }

    resp3 = session.post(f"{BASE_URL}/api/bet/place", json=payload3, headers=headers, timeout=TIMEOUT)
    assert resp3.status_code == 400, f"Expected 400 for invalid gameType, got {resp3.status_code}: {resp3.text}"
    # Check error message contains 'not found' (case insensitive)
    assert "not found" in resp3.text.lower(), f"Error message does not contain 'not found': {resp3.text}"

    # 4) POST with valid gameType DICE but isDemo false and no wallet balance (fresh user) - expect 400 error about insufficient balance.
    payload4 = {
        "gameType": "DICE",
        "currency": "USD",
        "amount": 10,
        "gameParams": {"target": 50, "isOver": True},
        "isDemo": False
    }

    resp4 = session.post(f"{BASE_URL}/api/bet/place", json=payload4, headers=headers, timeout=TIMEOUT)
    assert resp4.status_code == 400, f"Expected 400 for insufficient balance, got {resp4.status_code}: {resp4.text}"
    # Error message should mention insufficient balance or funds
    error_text = resp4.text.lower()
    assert ("insufficient" in error_text and "balance" in error_text) or ("funds" in error_text), f"Error message does not mention insufficient balance or funds: {resp4.text}"


test_manual_bet_edge_cases_and_validation()