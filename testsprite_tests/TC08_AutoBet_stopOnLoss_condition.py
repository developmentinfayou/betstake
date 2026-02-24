import requests
import time
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_TC08_autobet_stopOnLoss_condition():
    # Register a unique user
    unique_suffix = str(uuid.uuid4()).replace("-", "")[:8]
    username = f"testuser_{unique_suffix}"
    email = f"{username}@example.com"
    password = "Password123!"

    session = requests.Session()

    # Register user
    register_resp = session.post(
        f"{BASE_URL}/api/auth/register",
        json={"username": username, "email": email, "password": password},
        timeout=TIMEOUT
    )
    assert register_resp.status_code == 200, f"Registration failed: {register_resp.text}"
    register_data = register_resp.json()
    token = register_data["token"]
    headers = {"Authorization": f"Bearer {token}"}

    try:
        # Add 5000 USD balance
        wallet_add_resp = session.post(
            f"{BASE_URL}/api/wallet/add",
            headers=headers,
            json={"currency": "USD", "amount": 5000},
            timeout=TIMEOUT
        )
        assert wallet_add_resp.status_code == 200, f"Add wallet failed: {wallet_add_resp.text}"

        # Start autobet with specified config
        autobet_start_payload = {
            "gameType": "DICE",
            "currency": "USD",
            "amount": 10,
            "gameParams": {"target": 10, "isOver": True},
            "config": {
                "enabled": True,
                "numberOfBets": 0,
                "stopOnLoss": 30
            }
        }
        autobet_start_resp = session.post(
            f"{BASE_URL}/api/bet/autobet/start",
            headers=headers,
            json=autobet_start_payload,
            timeout=TIMEOUT
        )
        assert autobet_start_resp.status_code == 200, f"Autobet start failed: {autobet_start_resp.text}"
        autobet_start_data = autobet_start_resp.json()
        assert autobet_start_data.get("success") == True

        # Wait 15 seconds as per instructions
        time.sleep(15)

        # Check autobet status - expect active false (stopped)
        autobet_status_resp = session.get(
            f"{BASE_URL}/api/bet/autobet/status",
            headers=headers,
            timeout=TIMEOUT
        )
        assert autobet_status_resp.status_code == 200, f"Autobet status failed: {autobet_status_resp.text}"
        autobet_status = autobet_status_resp.json()
        # The active flag under autobet_status expected false due to stopOnLoss limit reached
        assert autobet_status.get("active") is False, f"Autobet should be inactive but is active: {autobet_status}"

        # Get bet history
        bet_history_resp = session.get(
            f"{BASE_URL}/api/bet/history",
            headers=headers,
            timeout=TIMEOUT
        )
        assert bet_history_resp.status_code == 200, f"Bet history failed: {bet_history_resp.text}"
        bet_history = bet_history_resp.json()
        bets = bet_history.get("bets")
        assert isinstance(bets, list) and len(bets) > 0, "No bets found in history"

        # Filter bets with isAutoBet = True and gameType = DICE uppercase
        auto_bets = [b for b in bets if b.get("isAutoBet") is True and b.get("gameType") == "DICE"]
        assert len(auto_bets) > 0, "No autobet DICE bets found in history"

        # Calculate total profit from all bets in history
        # Each bet object may not contain profit but per PRD it should have 'profit' in result or in bet?
        # According to PRD, bet history returns bets with _id, amount, gameType, isAutoBet, status fields
        # No profit directly. So we must assume that total profit requires summing bet results?
        # Since bet history is the only endpoint here, and lacks profit, we rely on bets having 'profit' property
        # or fetching each bet detail if needed. But the problem states to verify total profit negative.
        # We'll sum profit per bet where profit is available in bet dict, else 0.
        total_profit = 0
        for bet in auto_bets:
            # If 'profit' present in bet, use it; else 0
            profit = bet.get("profit")
            if profit is None:
                # If profit not present, skip or treat as 0
                profit = 0
            total_profit += profit

        # Assert total profit is negative (due to stopOnLoss triggering stop)
        assert total_profit < 0, f"Total profit is not negative: {total_profit}"

    finally:
        # Stop autobet to clean up
        try:
            session.post(
                f"{BASE_URL}/api/bet/autobet/stop",
                headers=headers,
                timeout=TIMEOUT
            )
        except Exception:
            pass


test_TC08_autobet_stopOnLoss_condition()