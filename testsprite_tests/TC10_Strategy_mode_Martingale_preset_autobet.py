import requests
import time
import uuid

BASE_URL = "http://localhost:3001"


def test_strategy_mode_martingale_preset_autobet():
    # Step 1: Register user to get token
    unique_suffix = str(uuid.uuid4())
    username = f"testuser_{unique_suffix[:8]}"
    email = f"{username}@example.com"
    password = "TestPass123"

    register_payload = {
        "username": username,
        "email": email,
        "password": password
    }
    r = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=30)
    assert r.status_code == 200, f"Registration failed: {r.text}"
    token = r.json()["token"]
    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Step 2: Add 5000 USD
    add_balance_payload = {
        "currency": "USD",
        "amount": 5000
    }
    r = requests.post(f"{BASE_URL}/api/wallet/add", json=add_balance_payload, headers=headers, timeout=30)
    assert r.status_code == 200, f"Add balance failed: {r.text}"

    # Step 3: GET /api/strategy/defaults to find Martingale preset
    r = requests.get(f"{BASE_URL}/api/strategy/defaults", timeout=30)
    assert r.status_code == 200, f"Get default strategies failed: {r.text}"
    strategies = r.json().get("strategies", [])
    martingale_strategy = None
    for strategy in strategies:
        if strategy.get("name") == "Martingale":
            martingale_strategy = strategy
            break
    assert martingale_strategy is not None, "Martingale strategy preset not found"
    martingale_id = martingale_strategy["_id"]

    # Step 4: Start autobet with Martingale strategy
    autobet_start_payload = {
        "gameType": "DICE",
        "currency": "USD",
        "amount": 10,
        "gameParams": {"target": 50, "isOver": True},
        "config": {
            "enabled": True,
            "numberOfBets": 10,
            "strategyId": martingale_id
        }
    }
    r = requests.post(f"{BASE_URL}/api/bet/autobet/start", json=autobet_start_payload, headers=headers, timeout=30)
    assert r.status_code == 200, f"Autobet start failed: {r.text}"
    resp_json = r.json()
    assert resp_json.get("success") is True
    assert "Auto-bet started" in resp_json.get("message", "")

    # Step 5: Wait 12 seconds
    time.sleep(12)

    # Step 6: GET /api/bet/history with limit 10
    history_params = {"limit": 10}
    r = requests.get(f"{BASE_URL}/api/bet/history", headers=headers, params=history_params, timeout=30)
    assert r.status_code == 200, f"Get bet history failed: {r.text}"
    bets = r.json().get("bets", [])
    # Verify multiple bets exist with isAutoBet true
    auto_bets = [bet for bet in bets if bet.get("isAutoBet") is True]
    assert len(auto_bets) > 1, "Auto bets with isAutoBet true not found or less than 2 bets"

    # Step 7: Verify that bet amounts vary (Martingale doubles on loss, resets on win)
    # Extract amounts from bets preserving order
    amounts = [bet.get("amount") for bet in auto_bets if isinstance(bet.get("amount"), (int, float))]
    assert len(amounts) > 1, "Not enough bet amounts for variation check"

    # Basic check: amounts should not all be identical
    all_same = all(amount == amounts[0] for amount in amounts)
    assert not all_same, "Bet amounts do not vary; Martingale strategy might not be applied"

    # Optional deeper check: look for doubling pattern after loss and resetting on win.
    # Since we don't have direct outcome info for each bet here, we only verify variance.

    # Step 8: Stop autobet to clean up
    r = requests.post(f"{BASE_URL}/api/bet/autobet/stop", headers=headers, timeout=30)
    assert r.status_code == 200, f"Autobet stop failed: {r.text}"
    stop_resp = r.json()
    assert stop_resp.get("success") is True

test_strategy_mode_martingale_preset_autobet()