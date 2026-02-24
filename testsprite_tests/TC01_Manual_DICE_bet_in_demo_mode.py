import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30


def test_manual_dice_bet_in_demo_mode():
    # Register test user
    unique_id = str(uuid.uuid4())
    username = f"testuser_{unique_id[:8]}"
    email = f"{unique_id[:8]}@test.com"
    password = "TestPass123"

    register_payload = {
        "username": username,
        "email": email,
        "password": password
    }
    register_resp = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
    assert register_resp.status_code == 200, f"Registration failed: {register_resp.text}"
    register_data = register_resp.json()
    token = register_data.get("token")
    assert isinstance(token, str) and token != "", "Token missing or invalid in registration response"

    headers = {"Authorization": f"Bearer {token}"}

    # Place DICE bet in demo mode
    bet_payload = {
        "gameType": "DICE",
        "currency": "USD",
        "amount": 10,
        "isDemo": True,
        "gameParams": {
            "target": 50,
            "isOver": True
        }
    }
    bet_resp = requests.post(f"{BASE_URL}/api/bet/place", json=bet_payload, headers=headers, timeout=TIMEOUT)
    assert bet_resp.status_code == 200, f"Bet placement failed: {bet_resp.text}"
    bet_data = bet_resp.json()

    # Validate bet._id is string
    bet = bet_data.get("bet")
    assert isinstance(bet, dict), "Response missing 'bet' object"
    bet_id = bet.get("_id")
    assert isinstance(bet_id, str) and bet_id != "", "'bet._id' missing or not a string"

    # Validate result fields
    result = bet_data.get("result")
    assert isinstance(result, dict), "Response missing 'result' object"

    won = result.get("won")
    multiplier = result.get("multiplier")
    payout = result.get("payout")
    profit = result.get("profit")

    assert isinstance(won, bool), "'result.won' missing or not boolean"
    assert isinstance(multiplier, (int, float)), "'result.multiplier' missing or not number"
    assert isinstance(payout, (int, float)), "'result.payout' missing or not number"
    assert isinstance(profit, (int, float)), "'result.profit' missing or not number"

    # Validate wallet is null since demo mode
    wallet = bet_data.get("wallet")
    assert wallet is None, "'wallet' should be null in demo mode"


test_manual_dice_bet_in_demo_mode()