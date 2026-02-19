import requests
import time
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30


def test_tc12_dalembert_strategy_preset_autobet():
    # Register unique test user
    unique_suffix = str(uuid.uuid4())[:8]
    username = f"testuser_{unique_suffix}"
    email = f"testuser_{unique_suffix}@example.com"
    password = f"Passw0rd!{unique_suffix}"

    register_payload = {
        "username": username,
        "email": email,
        "password": password
    }

    register_resp = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
    assert register_resp.status_code == 200, f"Register failed: {register_resp.text}"
    token = register_resp.json().get("token")
    assert token, "No token received on registration"

    headers_auth = {"Authorization": f"Bearer {token}"}

    try:
        # Add 5000 USD balance
        add_balance_payload = {"currency": "USD", "amount": 5000}
        add_balance_resp = requests.post(f"{BASE_URL}/api/wallet/add", json=add_balance_payload, headers=headers_auth,
                                         timeout=TIMEOUT)
        assert add_balance_resp.status_code == 200, f"Add balance failed: {add_balance_resp.text}"

        # GET /api/strategy/defaults and find strategy with name containing "Alembert"
        strategy_defaults_resp = requests.get(f"{BASE_URL}/api/strategy/defaults", timeout=TIMEOUT)
        assert strategy_defaults_resp.status_code == 200, f"Failed to get strategy defaults: {strategy_defaults_resp.text}"
        strategies = strategy_defaults_resp.json().get("strategies", [])
        dalembert_strategy = next((s for s in strategies if "alembert" in s.get("name", "").lower()), None)
        assert dalembert_strategy and "_id" in dalembert_strategy, "D'Alembert strategy preset not found"
        dalembert_id = dalembert_strategy["_id"]

        # Start autobet with config containing D'Alembert strategyId
        autobet_start_payload = {
            "gameType": "DICE",
            "currency": "USD",
            "amount": 10,
            "gameParams": {"target": 50, "isOver": True},
            "config": {
                "enabled": True,
                "numberOfBets": 10,
                "strategyId": dalembert_id,
                "onWin": {"reset": True},
                "onLoss": {"reset": False}
            }
        }
        autobet_start_resp = requests.post(f"{BASE_URL}/api/bet/autobet/start", json=autobet_start_payload,
                                           headers=headers_auth, timeout=TIMEOUT)
        assert autobet_start_resp.status_code == 200, f"Start autobet failed: {autobet_start_resp.text}"
        autobet_start_json = autobet_start_resp.json()
        assert autobet_start_json.get("success") is True, "Autobet did not start successfully"

        # Wait 12 seconds for autobet to place bets
        time.sleep(12)

        # GET /api/bet/history with limit 10
        bet_history_resp = requests.get(f"{BASE_URL}/api/bet/history", headers=headers_auth,
                                       params={"limit": 10}, timeout=TIMEOUT)
        assert bet_history_resp.status_code == 200, f"Get bet history failed: {bet_history_resp.text}"
        bets = bet_history_resp.json().get("bets", [])
        assert isinstance(bets, list), "Bet history not a list"
        assert len(bets) > 0, "No bets found in history"

        # Verify incremental bet amounts according to D'Alembert strategy logic
        # D'Alembert: On loss amount increases by $1, on win amount decreases by $1 (not below original)
        # We check the sequence of amounts: changes should be small increments (+1, -1) around starting amount 10
        amounts = [bet.get("amount") for bet in bets if bet.get("amount") is not None]
        assert len(amounts) > 1, "Not enough bets with amount field for verification"

        # Starting amount for D'Alembert is 10
        original_amount = 10

        # Check that amount changes are small absolute increments and never below 1
        # Differences between consecutive bet amounts should be -1, 0, or +1
        prev = amounts[0]
        assert prev >= 1, "Bet amount less than 1 found"
        for amt in amounts[1:]:
            assert amt >= 1, "Bet amount less than 1 found"
            diff = amt - prev
            assert diff in (-1, 0, 1), f"Bet amount changed by {diff}, expected small increment/decrement"
            prev = amt

    finally:
        # Stop autobet if running
        try:
            stop_resp = requests.post(f"{BASE_URL}/api/bet/autobet/stop", headers=headers_auth, timeout=TIMEOUT)
            assert stop_resp.status_code == 200 and stop_resp.json().get("success") is True, \
                f"Failed to stop autobet: {stop_resp.text}"
        except Exception:
            # Ignore errors on stop
            pass


test_tc12_dalembert_strategy_preset_autobet()