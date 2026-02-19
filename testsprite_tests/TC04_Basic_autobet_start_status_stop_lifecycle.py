import requests
import time
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30


def test_basic_autobet_start_status_stop_lifecycle():
    # Register unique test user
    unique_suffix = uuid.uuid4().hex[:8]
    register_payload = {
        "username": f"testuser_{unique_suffix}",
        "email": f"testuser_{unique_suffix}@example.com",
        "password": "TestPass123!"
    }
    register_resp = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
    assert register_resp.status_code == 200, f"Registration failed: {register_resp.text}"
    token = register_resp.json().get("token")
    assert token, "No token received on registration"
    headers = {"Authorization": f"Bearer {token}"}

    try:
        # Add 1000 USD balance
        add_balance_payload = {"currency": "USD", "amount": 1000}
        add_balance_resp = requests.post(f"{BASE_URL}/api/wallet/add", json=add_balance_payload, headers=headers, timeout=TIMEOUT)
        assert add_balance_resp.status_code == 200, f"Adding balance failed: {add_balance_resp.text}"

        # Start autobet with specified config
        autobet_start_payload = {
            "gameType": "DICE",
            "currency": "USD",
            "amount": 10,
            "gameParams": {"target": 50, "isOver": True},
            "config": {"enabled": True, "numberOfBets": 5}
        }
        autobet_start_resp = requests.post(f"{BASE_URL}/api/bet/autobet/start", json=autobet_start_payload, headers=headers, timeout=TIMEOUT)
        assert autobet_start_resp.status_code == 200, f"Autobet start failed: {autobet_start_resp.text}"
        json_start = autobet_start_resp.json()
        assert json_start.get("success") is True, "Autobet start success flag missing or false"
        assert "Auto-bet started" in json_start.get("message", ""), "Unexpected autobet start message"

        # Wait 5 seconds for bets to be placed
        time.sleep(5)

        # Get autobet status
        autobet_status_resp = requests.get(f"{BASE_URL}/api/bet/autobet/status", headers=headers, timeout=TIMEOUT)
        assert autobet_status_resp.status_code == 200, f"Getting autobet status failed: {autobet_status_resp.text}"
        status_json = autobet_status_resp.json()
        # Status object minimal check - no specific schema given, but must exist
        assert isinstance(status_json, dict), "Autobet status response is not a dict"

        # Stop autobet
        autobet_stop_resp = requests.post(f"{BASE_URL}/api/bet/autobet/stop", headers=headers, timeout=TIMEOUT)
        assert autobet_stop_resp.status_code == 200, f"Stopping autobet failed: {autobet_stop_resp.text}"
        stop_json = autobet_stop_resp.json()
        assert stop_json.get("success") is True, "Autobet stop success flag missing or false"

        # Get bet history
        bet_history_resp = requests.get(f"{BASE_URL}/api/bet/history", headers=headers, timeout=TIMEOUT)
        assert bet_history_resp.status_code == 200, f"Getting bet history failed: {bet_history_resp.text}"
        bets = bet_history_resp.json().get("bets", [])
        assert isinstance(bets, list), "Bets is not a list"
        # Verify at least one bet exists with isAutoBet true
        auto_bets = [bet for bet in bets if bet.get("isAutoBet") is True]
        assert len(auto_bets) >= 1, "No auto bets found in bet history"

    finally:
        # Cleanup: stop autobet if still active to avoid leftover sessions
        try:
            requests.post(f"{BASE_URL}/api/bet/autobet/stop", headers=headers, timeout=TIMEOUT)
        except Exception:
            pass


test_basic_autobet_start_status_stop_lifecycle()