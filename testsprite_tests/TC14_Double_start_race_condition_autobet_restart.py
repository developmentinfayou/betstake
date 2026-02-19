import requests
import time
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_double_start_race_condition_autobet_restart():
    # Register unique user
    unique_id = str(uuid.uuid4())
    username = f"testuser_{unique_id[:8]}"
    email = f"{unique_id[:8]}@example.com"
    password = "Password123!"

    # Register user
    register_resp = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={"username": username, "email": email, "password": password},
        timeout=TIMEOUT
    )
    assert register_resp.status_code == 200, f"Registration failed: {register_resp.text}"
    token = register_resp.json().get("token")
    assert token, "No token returned on registration"
    headers = {"Authorization": f"Bearer {token}"}

    try:
        # Add 5000 USD balance
        add_balance_resp = requests.post(
            f"{BASE_URL}/api/wallet/add",
            json={"currency": "USD", "amount": 5000},
            headers=headers,
            timeout=TIMEOUT
        )
        assert add_balance_resp.status_code == 200, f"Add balance failed: {add_balance_resp.text}"

        # Start autobet 1: DICE
        autobet1_payload = {
            "gameType": "DICE",
            "currency": "USD",
            "amount": 10,
            "gameParams": {"target": 50, "isOver": True},
            "config": {"enabled": True, "numberOfBets": 0}
        }
        start_autobet1_resp = requests.post(
            f"{BASE_URL}/api/bet/autobet/start",
            json=autobet1_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert start_autobet1_resp.status_code == 200, f"Start autobet 1 failed: {start_autobet1_resp.text}"
        json1 = start_autobet1_resp.json()
        assert json1.get("success") is True, f"Autobet 1 response missing success: {json1}"
        assert "Auto-bet started" in json1.get("message", ""), f"Unexpected autobet 1 message: {json1.get('message')}"

        # Wait 1 second before starting autobet 2
        time.sleep(1)

        # Start autobet 2: LIMBO, should stop autobet 1 and start cleanly
        autobet2_payload = {
            "gameType": "LIMBO",
            "currency": "USD",
            "amount": 5,
            "gameParams": {"targetMultiplier": 2},
            "config": {"enabled": True, "numberOfBets": 5}
        }
        start_autobet2_resp = requests.post(
            f"{BASE_URL}/api/bet/autobet/start",
            json=autobet2_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert start_autobet2_resp.status_code == 200, f"Start autobet 2 failed: {start_autobet2_resp.text}"
        json2 = start_autobet2_resp.json()
        assert json2.get("success") is True, f"Autobet 2 response missing success: {json2}"
        assert "Auto-bet started" in json2.get("message", ""), f"Unexpected autobet 2 message: {json2.get('message')}"

        # Wait 8 seconds to allow bets to be placed
        time.sleep(8)

        # Get autobet status and verify no errors
        status_resp = requests.get(
            f"{BASE_URL}/api/bet/autobet/status",
            headers=headers,
            timeout=TIMEOUT
        )
        assert status_resp.status_code == 200, f"Autobet status request failed: {status_resp.text}"
        status_json = status_resp.json()
        # Status object schema not fully specified, just check it returns keys and no error
        assert isinstance(status_json, dict), f"Autobet status is not a dict: {status_json}"

        # Get bet history
        history_resp = requests.get(
            f"{BASE_URL}/api/bet/history",
            headers=headers,
            timeout=TIMEOUT
        )
        assert history_resp.status_code == 200, f"Bet history request failed: {history_resp.text}"
        history_json = history_resp.json()
        bets = history_json.get("bets")
        assert isinstance(bets, list), f"Bets is not a list: {bets}"
        assert len(bets) > 0, "No bets found in history"

        # Check bets for both game types placed with isAutoBet true
        found_dice = False
        found_limbo = False
        for bet in bets:
            # Validate bet structure minimal fields
            assert "_id" in bet and isinstance(bet["_id"], str), f"Bet _id missing or invalid: {bet}"
            assert "gameType" in bet and isinstance(bet["gameType"], str), f"Bet gameType missing or invalid: {bet}"
            assert "isAutoBet" in bet and isinstance(bet["isAutoBet"], bool), f"Bet isAutoBet missing or invalid: {bet}"
            if bet["isAutoBet"]:
                if bet["gameType"].upper() == "DICE":
                    found_dice = True
                if bet["gameType"].upper() == "LIMBO":
                    found_limbo = True

        assert found_dice, "No autobet DICE bets found in history"
        assert found_limbo, "No autobet LIMBO bets found in history"

    finally:
        # Stop any running autobet to clean up
        stop_resp = requests.post(
            f"{BASE_URL}/api/bet/autobet/stop",
            headers=headers,
            timeout=TIMEOUT
        )
        # Accept 200 or 400 or other if no autobet running, but no exception
        if stop_resp.status_code not in (200, 400):
            # Just raise for unexpected error
            stop_resp.raise_for_status()

test_double_start_race_condition_autobet_restart()