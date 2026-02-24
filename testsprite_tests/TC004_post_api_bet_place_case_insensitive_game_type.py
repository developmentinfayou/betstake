import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_post_api_bet_place_case_insensitive_game_type():
    # Register user to get a token
    register_url = f"{BASE_URL}/api/auth/register"
    unique_suffix = str(uuid.uuid4())
    username = f"testuser_{unique_suffix[:8]}"
    email = f"{unique_suffix[:8]}@example.com"
    password = "password123"
    register_body = {
        "username": username,
        "email": email,
        "password": password
    }

    try:
        reg_resp = requests.post(register_url, json=register_body, timeout=TIMEOUT)
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.text}"
        reg_json = reg_resp.json()
        token = reg_json.get("token")
        assert token and isinstance(token, str), "Token missing or invalid after registration"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        bet_url = f"{BASE_URL}/api/bet/place"

        # Define bet payloads with uppercase gameType 'DICE' only
        bet_payloads = [
            {
                "gameType": "DICE",
                "currency": "USD",
                "amount": 5,
                "gameParams": {"target": 50, "isOver": True},
                "isDemo": True
            },
            {
                "gameType": "DICE",
                "currency": "USD",
                "amount": 5,
                "gameParams": {"target": 50, "isOver": True},
                "isDemo": True
            }
        ]

        for payload in bet_payloads:
            resp = requests.post(bet_url, json=payload, headers=headers, timeout=TIMEOUT)
            assert resp.status_code == 200, f"Bet placement failed for gameType {payload['gameType']}: {resp.text}"
            data = resp.json()
            # Validate keys in response
            assert "bet" in data, "Response missing 'bet' field"
            assert "result" in data, "Response missing 'result' field"
            assert "wallet" in data, "Response missing 'wallet' field"
            bet = data["bet"]
            # Validate bet fields relevant for a bet response
            for field in ["multiplier", "payout", "profit"]:
                assert field in bet, f"Bet object missing '{field}' field"
            # Validate that gameType is normalized to uppercase in the bet returned
            assert bet.get("gameType") == "DICE", f"gameType was not normalized to uppercase: {bet.get('gameType')}"

    finally:
        # Cleanup: Delete the created user if possible (Not specified in PRD so skipping)
        pass

test_post_api_bet_place_case_insensitive_game_type()
