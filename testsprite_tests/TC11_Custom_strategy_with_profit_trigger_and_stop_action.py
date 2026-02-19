import requests
import time
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30


def test_custom_strategy_with_profit_trigger_and_stop_action():
    session = requests.Session()

    # Step 1: Register a unique test user
    unique_id = str(uuid.uuid4()).replace('-', '')[:10]
    username = f"testuser_{unique_id}"
    email = f"{username}@example.com"
    password = "TestPass123!"

    register_data = {
        "username": username,
        "email": email,
        "password": password
    }

    register_resp = session.post(f"{BASE_URL}/api/auth/register", json=register_data, timeout=TIMEOUT)
    assert register_resp.status_code == 200, f"Register failed: {register_resp.text}"
    token = register_resp.json().get("token")
    assert token and isinstance(token, str)
    headers = {"Authorization": f"Bearer {token}"}

    lock_strategy_id = None
    try:
        # Step 2: Create custom strategy via POST /api/strategy
        strategy_payload = {
            "name": "Profit Stop Test",
            "conditions": [
                {
                    "id": "c1",
                    "type": "profit",
                    "profitTrigger": {
                        "source": "profit",
                        "operator": "greater_than",
                        "value": 20
                    },
                    "action": "stop_autobet"
                },
                {
                    "id": "c2",
                    "type": "bet",
                    "betTrigger": {
                        "frequency": "every",
                        "value": 1,
                        "target": "losses"
                    },
                    "action": "increase_bet_amount",
                    "actionValue": 50
                }
            ]
        }
        strat_resp = session.post(f"{BASE_URL}/api/strategy", json=strategy_payload, headers=headers, timeout=TIMEOUT)
        assert strat_resp.status_code == 201, f"Create strategy failed: {strat_resp.text}"
        strat_json = strat_resp.json()
        strategy = strat_json.get("strategy")
        assert strategy and isinstance(strategy, dict)
        strategy_id = strategy.get("_id")
        assert strategy_id and isinstance(strategy_id, str)
        lock_strategy_id = strategy_id  # For cleanup

        # Step 3: Add 5000 USD balance via POST /api/wallet/add
        add_balance_payload = {
            "currency": "USD",
            "amount": 5000
        }
        add_balance_resp = session.post(f"{BASE_URL}/api/wallet/add", json=add_balance_payload, headers=headers, timeout=TIMEOUT)
        assert add_balance_resp.status_code == 200, f"Add balance failed: {add_balance_resp.text}"

        # Step 4: Start autobet with created strategy
        autobet_start_payload = {
            "gameType": "DICE",
            "currency": "USD",
            "amount": 10,
            "gameParams": {"target": 50, "isOver": True},
            "config": {
                "enabled": True,
                "numberOfBets": 0,
                "strategyId": strategy_id,
                "onWin": {"reset": True},
                "onLoss": {"reset": True},
            },
            "isDemo": False
        }
        autobet_start_resp = session.post(f"{BASE_URL}/api/bet/autobet/start", json=autobet_start_payload, headers=headers, timeout=TIMEOUT)
        assert autobet_start_resp.status_code == 200, f"Start autobet failed: {autobet_start_resp.text}"
        autobet_start_json = autobet_start_resp.json()
        assert autobet_start_json.get("success") is True, f"Autobet start not successful: {autobet_start_resp.text}"

        # Step 5: Wait 15 seconds
        time.sleep(15)

        # Step 6: GET /api/bet/autobet/status and verify active is False
        autobet_status_resp = session.get(f"{BASE_URL}/api/bet/autobet/status", headers=headers, timeout=TIMEOUT)
        assert autobet_status_resp.status_code == 200, f"Get autobet status failed: {autobet_status_resp.text}"
        autobet_status_json = autobet_status_resp.json()
        active = autobet_status_json.get("active")
        # active is expected to be False (autobet stopped due to profit trigger)
        assert active is False, f"Autobet status active expected False but got {active}"

        # Step 7: GET /api/bet/history to verify bets exist
        params = {"limit": 20, "offset": 0}
        history_resp = session.get(f"{BASE_URL}/api/bet/history", headers=headers, params=params, timeout=TIMEOUT)
        assert history_resp.status_code == 200, f"Get bet history failed: {history_resp.text}"
        history_json = history_resp.json()
        bets = history_json.get("bets")
        assert isinstance(bets, list) and len(bets) > 0, "No bets found in history"

    finally:
        # Cleanup: Delete the created strategy to avoid clutter
        if lock_strategy_id:
            session.delete(f"{BASE_URL}/api/strategy/{lock_strategy_id}", headers=headers, timeout=TIMEOUT)


test_custom_strategy_with_profit_trigger_and_stop_action()