import requests
import time
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_autobet_advanced_onwin_reset_onloss_increase():
    # Register unique user
    unique_suffix = str(uuid.uuid4())
    username = f"testuser_{unique_suffix[:8]}"
    email = f"{username}@example.com"
    password = "TestPass1234"
    register_payload = {
        "username": username,
        "email": email,
        "password": password
    }
    resp = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
    assert resp.status_code == 200, f"Registration failed: {resp.text}"
    token = resp.json().get("token")
    assert token and isinstance(token, str), "Token missing or invalid in registration response"
    headers = {"Authorization": f"Bearer {token}"}

    try:
        # Add 5000 USD balance
        wallet_add_payload = {
            "currency": "USD",
            "amount": 5000
        }
        resp = requests.post(f"{BASE_URL}/api/wallet/add", json=wallet_add_payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Add balance failed: {resp.text}"

        # Start autobet with specified config
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
                "numberOfBets": 10,
                "onWin": {"reset": True},
                "onLoss": {"reset": False, "increaseBy": 100}
            }
        }
        resp = requests.post(f"{BASE_URL}/api/bet/autobet/start", json=autobet_start_payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Autobet start failed: {resp.text}"
        start_resp = resp.json()
        assert start_resp.get("success") is True, f"Autobet start success false: {start_resp}"

        # Wait 10 seconds for autobet to complete
        time.sleep(10)

        # Stop autobet to be sure it's stopped
        resp = requests.post(f"{BASE_URL}/api/bet/autobet/stop", headers=headers, timeout=TIMEOUT)
        # It can be already stopped, so accept success true or 400 if no active autobet
        assert resp.status_code in (200,400), f"Autobet stop failed: {resp.text}"
        if resp.status_code == 200:
            stop_resp = resp.json()
            assert stop_resp.get("success") is True, f"Autobet stop success false: {stop_resp}"

        # Get bet history limit 10
        params = {"limit": 10}
        resp = requests.get(f"{BASE_URL}/api/bet/history", headers=headers, params=params, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Get bet history failed: {resp.text}"
        data = resp.json()
        bets = data.get("bets")
        assert isinstance(bets, list), "Bets is not a list"
        assert len(bets) > 0, "No bets returned in history"

        # Verify each bet has amount field and is a number > 0
        amounts = []
        for bet in bets:
            assert isinstance(bet, dict), "Bet item not a dict"
            assert "_id" in bet and isinstance(bet["_id"], str), "Bet _id missing or invalid"
            assert "amount" in bet, "Bet amount missing"
            amount = bet["amount"]
            assert isinstance(amount, (int, float)) and amount > 0, f"Invalid bet amount: {amount}"
            amounts.append(amount)

        # Check that not all amounts are the same (strategy adjusted them)
        unique_amounts = set(amounts)
        assert len(unique_amounts) > 1, "All bet amounts are the same; strategy adjustments not observed"

    finally:
        # Cleanup: no resource specifically created that needs deletion, so nothing to do here
        pass

test_autobet_advanced_onwin_reset_onloss_increase()