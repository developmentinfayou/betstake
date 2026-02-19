import requests
import time
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_TC09_autobet_session_game_rejection():
    session = requests.Session()
    # Register a unique test user
    unique_id = str(uuid.uuid4()).replace('-', '')
    username = f"testuser_{unique_id[:8]}"
    email = f"{username}@example.com"
    password = "TestPass123!"

    register_payload = {
        "username": username,
        "email": email,
        "password": password
    }
    r = session.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
    assert r.status_code == 200, f"Failed to register user: {r.text}"
    token = r.json().get("token")
    assert token and isinstance(token, str), "No token received on registration"
    headers = {"Authorization": f"Bearer {token}"}

    # Add balance required for autobet start
    add_balance_payload = {
        "currency": "USD",
        "amount": 5000
    }
    r = session.post(f"{BASE_URL}/api/wallet/add", headers=headers, json=add_balance_payload, timeout=TIMEOUT)
    assert r.status_code == 200, f"Failed to add balance: {r.text}"

    # Test autobet start with session game types should reject with 400 and 'not supported' in message
    session_game_types = ["TOWER", "STAIRS", "HILO", "BLACKJACK"]
    for game_type in session_game_types:
        payload = {
            "gameType": game_type,
            "currency": "USD",
            "amount": 10,
            "gameParams": {},
            "config": {
                "enabled": True,
                "numberOfBets": 5
            }
        }
        r = session.post(f"{BASE_URL}/api/bet/autobet/start", headers=headers, json=payload, timeout=TIMEOUT)
        assert r.status_code == 400, (
            f"Expected 400 for gameType {game_type}, got {r.status_code} with response: {r.text}"
        )
        err_text = r.text.lower()
        assert "not supported" in err_text, (
            f"Error message for gameType {game_type} does not contain 'not supported': {r.text}"
        )

test_TC09_autobet_session_game_rejection()