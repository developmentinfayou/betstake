import requests
import time
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_TC05_autobet_infinite_mode_and_stop():
    # Register unique user
    random_suffix = uuid.uuid4().hex[:8]
    username = f"testuser_{random_suffix}"
    email = f"{random_suffix}@example.com"
    password = "TestPass123!"
    register_payload = {
        "username": username,
        "email": email,
        "password": password
    }
    r = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
    assert r.status_code == 200, f"Registration failed: {r.text}"
    token = r.json().get("token")
    assert token, "No token received after registration"
    headers = {"Authorization": f"Bearer {token}"}

    # Add 5000 USD balance
    add_balance_payload = {"currency": "USD", "amount": 5000}
    r = requests.post(f"{BASE_URL}/api/wallet/add", json=add_balance_payload, headers=headers, timeout=TIMEOUT)
    assert r.status_code == 200, f"Add balance failed: {r.text}"

    # Start autobet with infinite numberOfBets = 0
    autobet_start_payload = {
        "gameType": "DICE",
        "currency": "USD",
        "amount": 5,
        "gameParams": {"target": 50, "isOver": True},
        "config": {"enabled": True, "numberOfBets": 0}
    }
    r = requests.post(f"{BASE_URL}/api/bet/autobet/start", json=autobet_start_payload, headers=headers, timeout=TIMEOUT)
    assert r.status_code == 200, f"Autobet start failed: {r.text}"
    resp_json = r.json()
    assert resp_json.get("success") is True, f"Autobet start response success false: {r.text}"
    assert "message" in resp_json and "Auto-bet started" in resp_json["message"], f"Unexpected autobet start message: {r.text}"

    # Wait 3 seconds
    time.sleep(3)

    # Stop autobet
    r = requests.post(f"{BASE_URL}/api/bet/autobet/stop", headers=headers, timeout=TIMEOUT)
    assert r.status_code == 200, f"Autobet stop failed: {r.text}"
    stop_resp = r.json()
    assert stop_resp.get("success") is True, f"Autobet stop response success false: {r.text}"

    # Get bet history
    r = requests.get(f"{BASE_URL}/api/bet/history", headers=headers, timeout=TIMEOUT)
    assert r.status_code == 200, f"Get bet history failed: {r.text}"
    history = r.json()
    assert "bets" in history and isinstance(history["bets"], list), "Bet history missing bets array"

    # Verify multiple bets placed and all have isAutoBet true
    auto_bets = [bet for bet in history["bets"] if bet.get("isAutoBet") is True]
    assert len(auto_bets) > 1, f"Expected multiple autobet bets, found {len(auto_bets)}"
    for bet in auto_bets:
        assert isinstance(bet.get("_id"), str) and bet["_id"], "Bet _id missing or not string"
        assert bet.get("amount") == 5, f"Bet amount unexpected: {bet.get('amount')}"
        assert bet.get("gameType") == "DICE", f"Bet gameType unexpected: {bet.get('gameType')}"
        assert bet.get("status") in ["PENDING", "LOST", "WON", "CANCELLED"], f"Bet status unexpected: {bet.get('status')}"

test_TC05_autobet_infinite_mode_and_stop()