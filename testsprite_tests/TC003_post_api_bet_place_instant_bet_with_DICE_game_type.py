import requests
import time
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_post_api_bet_place_instant_bet_with_DICE_game_type():
    # Register a new user to get auth token
    unique_suffix = str(uuid.uuid4())
    register_payload = {
        "username": f"testuser_{unique_suffix[:8]}",
        "email": f"testuser_{unique_suffix[:8]}@example.com",
        "password": "SecurePass123"
    }
    try:
        register_resp = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=register_payload,
            timeout=TIMEOUT
        )
        assert register_resp.status_code == 200, f"Registration failed: {register_resp.text}"
        token = register_resp.json().get("token")
        assert token and isinstance(token, str), "Missing or invalid token in registration response"

        headers = {"Authorization": f"Bearer {token}"}

        # Prepare bet payload as per test case
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

        bet_resp = requests.post(
            f"{BASE_URL}/api/bet/place",
            json=bet_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        # Validate response success status
        assert bet_resp.status_code == 200, f"Bet place failed: {bet_resp.text}"

        bet_data = bet_resp.json()
        assert "bet" in bet_data, "Response missing 'bet'"
        assert "result" in bet_data, "Response missing 'result'"
        assert "wallet" in bet_data, "Response missing 'wallet'"

        bet = bet_data["bet"]
        # Validate bet fields: multiplier, payout, profit
        for field in ["multiplier", "payout", "profit"]:
            assert field in bet, f"Bet object missing field '{field}'"
        # Additional type checks
        assert isinstance(bet["multiplier"], (int, float)), "'multiplier' is not a number"
        assert isinstance(bet["payout"], (int, float)), "'payout' is not a number"
        assert isinstance(bet["profit"], (int, float)), "'profit' is not a number"

        # Validate result object exists and is dictionary
        assert isinstance(bet_data["result"], dict), "'result' is not an object"

    finally:
        # Cleanup: no resource to delete for a bet, so nothing to cleanup here
        pass

test_post_api_bet_place_instant_bet_with_DICE_game_type()
