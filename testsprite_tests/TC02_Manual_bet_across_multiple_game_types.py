import requests
import uuid

BASE_URL = "http://localhost:3001"
TIMEOUT = 30

def test_manual_bet_across_multiple_game_types():
    # Register test user
    register_url = f"{BASE_URL}/api/auth/register"
    unique_suffix = uuid.uuid4().hex
    username = f"testuser_{unique_suffix[:11]}"  # total length <= 20 characters
    email = f"{username}@example.com"
    password = "testPassword123"
    register_payload = {
        "username": username,
        "email": email,
        "password": password
    }
    response = requests.post(register_url, json=register_payload, timeout=TIMEOUT)
    assert response.status_code == 200, f"Register failed: {response.text}"
    token = response.json().get("token")
    assert token, "Token not received after registration"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    bets = [
        {
            "gameType": "DICE",
            "gameParams": {"target": 50, "isOver": True}
        },
        {
            "gameType": "LIMBO",
            "gameParams": {"targetMultiplier": 2}
        },
        {
            "gameType": "COINFLIP",
            "gameParams": {"choice": "heads"}
        },
        {
            "gameType": "WHEEL",
            "gameParams": {"segments": 10, "risk": "medium"}
        }
    ]

    place_bet_url = f"{BASE_URL}/api/bet/place"

    for bet in bets:
        payload = {
            "gameType": bet["gameType"],
            "currency": "USD",
            "amount": 5,
            "isDemo": True,
            "gameParams": bet["gameParams"]
        }
        resp = requests.post(place_bet_url, json=payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Bet failed for {bet['gameType']}: {resp.text}"
        data = resp.json()
        assert "result" in data, f"No result in response for {bet['gameType']}"
        result = data["result"]
        # Verify 'won' is boolean
        assert isinstance(result.get("won"), bool), f"result.won not boolean for {bet['gameType']}"
        # Verify 'multiplier' is number (int or float)
        multiplier = result.get("multiplier")
        assert isinstance(multiplier, (int, float)), f"result.multiplier not number for {bet['gameType']}"


test_manual_bet_across_multiple_game_types()
