import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_post_api_bet_place_limbo_game_and_verify_result():
    # Register a unique test user
    unique_suffix = str(uuid.uuid4()).replace("-", "")[:8]
    username = f"testuser_{unique_suffix}"
    email = f"{username}@example.com"
    password = "TestPass123"

    register_url = f"{BASE_URL}/api/auth/register"
    register_payload = {
        "username": username,
        "email": email,
        "password": password
    }

    token = None
    try:
        reg_resp = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.status_code} - {reg_resp.text}"
        reg_data = reg_resp.json()
        token = reg_data.get("token")
        assert token and isinstance(token, str), "Token missing or invalid in registration response"

        headers = {"Authorization": f"Bearer {token}"}
        bet_url = f"{BASE_URL}/api/bet/place"
        bet_payload = {
            "gameType": "LIMBO",  # must be uppercase per instructions
            "currency": "USD",
            "amount": 10,
            "isDemo": True,
            "gameParams": {
                "targetMultiplier": 2
            }
        }

        bet_resp = requests.post(bet_url, json=bet_payload, headers=headers, timeout=TIMEOUT)
        assert bet_resp.status_code == 200, f"Bet placement failed: {bet_resp.status_code} - {bet_resp.text}"
        bet_data = bet_resp.json()

        # Validate response contains bet, result, wallet objects
        assert isinstance(bet_data, dict), "Response JSON should be a dictionary"
        assert "bet" in bet_data, "Missing 'bet' in response"
        assert "result" in bet_data, "Missing 'result' in response"
        # wallet object may be present but not required to verify crashPoint and won per instructions
        result = bet_data["result"]

        # Check that 'won' is boolean field in result
        assert "won" in result, "'won' missing from result"
        won = result["won"]
        assert isinstance(won, bool), "'won' field should be boolean"

    finally:
        # Cleanup: If bet resource deletion endpoint existed, it would be called here.
        # PRD does not specify bet deletion; so no delete action possible.
        pass

test_post_api_bet_place_limbo_game_and_verify_result()
