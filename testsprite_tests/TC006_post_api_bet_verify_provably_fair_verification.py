import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30


def test_post_api_bet_verify_provably_fair_verification():
    try:
        # Step 1: Register a new user
        unique_suffix = str(uuid.uuid4())
        register_payload = {
            "username": f"testuser_{unique_suffix[:8]}",
            "email": f"testuser_{unique_suffix[:8]}@example.com",
            "password": "TestPass1234"
        }
        register_resp = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=register_payload,
            timeout=TIMEOUT
        )
        assert register_resp.status_code == 200, f"Register failed: {register_resp.text}"
        register_data = register_resp.json()
        token = register_data.get("token")
        assert token, "No token returned on register"

        headers = {
            "Authorization": f"Bearer {token}"
        }

        # Step 2: Place a demo DICE bet
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
            headers=headers,
            json=bet_payload,
            timeout=TIMEOUT
        )
        assert bet_resp.status_code == 200, f"Bet place failed: {bet_resp.text}"
        bet_data = bet_resp.json()
        bet = bet_data.get("bet")
        assert bet and isinstance(bet, dict), "No bet object returned"
        bet_id = bet.get("id")
        assert bet_id, "Bet ID missing"

        # Step 3: Verify the bet with POST /api/bet/verify
        verify_payload = {"betId": bet_id}
        verify_resp = requests.post(
            f"{BASE_URL}/api/bet/verify",
            headers=headers,
            json=verify_payload,
            timeout=TIMEOUT
        )
        assert verify_resp.status_code == 200, f"Bet verify failed: {verify_resp.text}"
        verify_data = verify_resp.json()
        assert "match" in verify_data, "Verification result missing 'match' field"
    finally:
        # Cleanup: No delete endpoint specified for bet or user - skipping
        pass


test_post_api_bet_verify_provably_fair_verification()
