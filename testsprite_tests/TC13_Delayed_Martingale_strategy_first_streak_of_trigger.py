import requests
import time
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30


def test_TC13_delayed_martingale_strategy_first_streak_of_trigger():
    # Register user
    unique_suffix = str(uuid.uuid4()).replace("-", "")[:8]
    username = f"testuser_{unique_suffix}"
    email = f"{username}@example.com"
    password = "TestPass1234"
    register_payload = {"username": username, "email": email, "password": password}

    try:
        r = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"Register failed: {r.text}"
        token = r.json().get("token")
        assert token, "No token in register response"
        headers = {"Authorization": f"Bearer {token}"}

        # Add 5000 USD to wallet
        add_balance_payload = {"currency": "USD", "amount": 5000}
        r = requests.post(f"{BASE_URL}/api/wallet/add", json=add_balance_payload, headers=headers, timeout=TIMEOUT)
        assert r.status_code == 200, f"Add balance failed: {r.text}"

        # Get strategy defaults and find Delayed Martingale ID
        r = requests.get(f"{BASE_URL}/api/strategy/defaults", timeout=TIMEOUT)
        assert r.status_code == 200, f"Get strategy defaults failed: {r.text}"
        strategies = r.json().get("strategies")
        assert isinstance(strategies, list), "Strategies is not a list"
        delayed_martingale = None
        for strat in strategies:
            if strat.get("name") and "Delayed Martingale" in strat.get("name"):
                delayed_martingale = strat
                break
        assert delayed_martingale is not None, "Delayed Martingale strategy not found"
        strategy_id = delayed_martingale.get("_id") or delayed_martingale.get("id")
        assert strategy_id, "Strategy ID missing"

        # Start autobet with Delayed Martingale strategy
        autobet_start_payload = {
            "gameType": "DICE",
            "currency": "USD",
            "amount": 10,
            "gameParams": {"target": 50, "isOver": True},
            "config": {
                "enabled": True,
                "numberOfBets": 15,
                "strategyId": strategy_id,
                "onWin": {"reset": True},
                "onLoss": {"reset": True}
            }
        }
        r = requests.post(f"{BASE_URL}/api/bet/autobet/start", json=autobet_start_payload, headers=headers, timeout=TIMEOUT)
        assert r.status_code == 200, f"Autobet start failed: {r.text}"
        assert r.json().get("success") is True, "Autobet start success flag false"

        # Wait 18 seconds as per instructions (enough time for 15 bets)
        time.sleep(18)

        # Get bet history with limit 15
        params = {"limit": 15}
        r = requests.get(f"{BASE_URL}/api/bet/history", headers=headers, params=params, timeout=TIMEOUT)
        assert r.status_code == 200, f"Get bet history failed: {r.text}"
        bets = r.json().get("bets")
        assert isinstance(bets, list), "Bets is not a list"
        assert len(bets) > 0, "No bets found in history"

        # Verify all returned bets have isAutoBet true
        for bet in bets:
            assert bet.get("isAutoBet") is True, f"Bet {_id_repr(bet)} is not auto bet"

        # Verify first bets maintain initial amount until a loss streak of 1 is reached
        # Logic updated: The first bets should have amount 10 until first loss streak 1.
        def is_loss(bet):
            st = bet.get("status")
            if st is None:
                return False
            return str(st).lower() in ("loss", "lost", "fail", "lose", "lost")

        initial_amount = 10
        loss_streak = 0
        first_streak_reached_index = None
        for index, bet in enumerate(bets):
            amount = bet.get("amount")
            assert amount is not None, f"Bet {bet.get('_id','no_id')} missing amount"
            if loss_streak < 1:
                # Before loss streak of 1, amounts should be initial amount (10)
                assert amount == initial_amount, f"Bet {bet.get('_id','no_id')} amount changed before loss streak 1: {amount}"
            if is_loss(bet):
                loss_streak += 1
                if loss_streak == 1:
                    first_streak_reached_index = index
            else:
                loss_streak = 0

        # Stop autobet to clean up session
        stop_resp = requests.post(f"{BASE_URL}/api/bet/autobet/stop", headers=headers, timeout=TIMEOUT)
        assert stop_resp.status_code == 200, f"Autobet stop failed: {stop_resp.text}"
        assert stop_resp.json().get("success") is True, "Autobet stop success flag false"

    except Exception:
        # Attempt to stop autobet session if something went wrong before cleanup
        try:
            requests.post(f"{BASE_URL}/api/bet/autobet/stop", headers=headers, timeout=TIMEOUT)
        except Exception:
            pass
        raise


def _id_repr(bet):
    return bet.get("_id") or bet.get("id") or "<no_id>"


test_TC13_delayed_martingale_strategy_first_streak_of_trigger()
