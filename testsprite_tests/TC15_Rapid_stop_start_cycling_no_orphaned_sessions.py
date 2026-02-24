import requests
import time
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_TC15_rapid_stop_start_cycling_no_orphaned_sessions():
    session = requests.Session()

    # Register a unique user
    unique_id = uuid.uuid4().hex
    username = f"testuser_{unique_id[:8]}"
    email = f"{username}@example.com"
    password = "StrongPass123"

    register_payload = {
        "username": username,
        "email": email,
        "password": password
    }
    r = session.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
    assert r.status_code == 200, f"Registration failed: {r.text}"
    token = r.json().get("token")
    assert token and isinstance(token, str)

    headers = {"Authorization": f"Bearer {token}"}

    # Add 5000 USD balance
    add_balance_payload = {
        "currency": "USD",
        "amount": 5000
    }
    r = session.post(f"{BASE_URL}/api/wallet/add", json=add_balance_payload, headers=headers, timeout=TIMEOUT)
    assert r.status_code == 200, f"Add balance failed: {r.text}"

    # Prepare autobet start payload
    autobet_start_payload = {
        "gameType": "DICE",
        "currency": "USD",
        "amount": 10,
        "gameParams": {
            "target": 50,
            "isOver": True
        },
        "config": {
            "enabled": True,
            "numberOfBets": 0
        }
    }

    # Cycle 1: start autobet
    r = session.post(f"{BASE_URL}/api/bet/autobet/start", json=autobet_start_payload, headers=headers, timeout=TIMEOUT)
    assert r.status_code == 200, f"Autobet start cycle 1 failed: {r.text}"
    start_resp = r.json()
    assert start_resp.get("success") is True

    # Wait 500ms
    time.sleep(0.5)

    # Stop autobet cycle 1
    r = session.post(f"{BASE_URL}/api/bet/autobet/stop", headers=headers, timeout=TIMEOUT)
    assert r.status_code == 200, f"Autobet stop cycle 1 failed: {r.text}"
    stop_resp = r.json()
    assert stop_resp.get("success") is True

    # Cycle 2: start autobet
    r = session.post(f"{BASE_URL}/api/bet/autobet/start", json=autobet_start_payload, headers=headers, timeout=TIMEOUT)
    assert r.status_code == 200, f"Autobet start cycle 2 failed: {r.text}"
    start_resp2 = r.json()
    assert start_resp2.get("success") is True

    # Wait 500ms
    time.sleep(0.5)

    # Stop autobet cycle 2
    r = session.post(f"{BASE_URL}/api/bet/autobet/stop", headers=headers, timeout=TIMEOUT)
    assert r.status_code == 200, f"Autobet stop cycle 2 failed: {r.text}"
    stop_resp2 = r.json()
    assert stop_resp2.get("success") is True

    # Get autobet status after both cycles
    r = session.get(f"{BASE_URL}/api/bet/autobet/status", headers=headers, timeout=TIMEOUT)
    assert r.status_code == 200, f"Autobet status fetch failed: {r.text}"
    status = r.json()
    assert isinstance(status, dict)
    assert status.get("active") is False, "Autobet session still active after stops"

test_TC15_rapid_stop_start_cycling_no_orphaned_sessions()