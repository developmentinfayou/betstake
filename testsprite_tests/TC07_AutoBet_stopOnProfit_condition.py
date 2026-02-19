import requests
import time
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_TC07_autobet_stop_on_profit_condition():
    try:
        # Step 1: Register user with unique username and email
        unique_suffix = str(uuid.uuid4())[:8]
        username = f"testuser_{unique_suffix}"
        email = f"{username}@example.com"
        password = "P@ssword123"

        register_payload = {
            "username": username,
            "email": email,
            "password": password
        }
        r = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"Register failed: {r.text}"
        register_resp = r.json()
        token = register_resp.get("token")
        assert token, "No token received on registration"

        headers = {
            "Authorization": f"Bearer {token}"
        }

        # Step 2: Add 5000 USD to wallet
        add_balance_payload = {
            "currency": "USD",
            "amount": 5000
        }
        r = requests.post(f"{BASE_URL}/api/wallet/add", json=add_balance_payload, headers=headers, timeout=TIMEOUT)
        assert r.status_code == 200, f"Add balance failed: {r.text}"
        wallet_resp = r.json()
        assert "currency" in wallet_resp and wallet_resp["currency"] == "USD", "Wallet currency mismatch"

        # Step 3: Start autobet with specified config and gameParams
        autobet_start_payload = {
            "gameType": "DICE",
            "currency": "USD",
            "amount": 10,
            "gameParams": {
                "target": 75,
                "isOver": False
            },
            "config": {
                "enabled": True,
                "numberOfBets": 0,
                "stopOnProfit": 20
            }
        }
        r = requests.post(f"{BASE_URL}/api/bet/autobet/start", json=autobet_start_payload, headers=headers, timeout=TIMEOUT)
        assert r.status_code == 200, f"Autobet start failed: {r.text}"
        autobet_start_resp = r.json()
        assert autobet_start_resp.get("success") is True, f"Autobet start response unexpected: {autobet_start_resp}"

        # Step 4: Wait 15 seconds for autobet to run and (hopefully) stop on profit
        time.sleep(15)

        # Step 5: Get autobet status and verify active is False (stopped)
        r = requests.get(f"{BASE_URL}/api/bet/autobet/status", headers=headers, timeout=TIMEOUT)
        assert r.status_code == 200, f"Get autobet status failed: {r.text}"
        status_resp = r.json()
        active = status_resp.get("active")
        assert active is False, f"Autobet should have stopped but active is {active}"

        # Step 6: Get bet history and verify bets were placed with isAutoBet True
        r = requests.get(f"{BASE_URL}/api/bet/history?limit=50&offset=0", headers=headers, timeout=TIMEOUT)
        assert r.status_code == 200, f"Get bet history failed: {r.text}"
        history_resp = r.json()
        bets = history_resp.get("bets")
        assert isinstance(bets, list), "Bets field missing or not a list"
        auto_bet_bets = [bet for bet in bets if bet.get("isAutoBet") is True]
        assert len(auto_bet_bets) > 0, "No autobet bets found in history"

    finally:
        # Cleanup: Stop autobet if still active to avoid residual state
        try:
            requests.post(f"{BASE_URL}/api/bet/autobet/stop", headers=headers, timeout=TIMEOUT)
        except Exception:
            pass

test_TC07_autobet_stop_on_profit_condition()